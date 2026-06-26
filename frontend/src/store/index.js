import { createStore } from 'vuex'
import axios from 'axios'

const normalizeSelectedOptions = (selectedOptions = {}) => {
  const raw = selectedOptions instanceof Map
    ? Object.fromEntries(selectedOptions)
    : (selectedOptions || {})

  return Object.keys(raw)
    .sort()
    .reduce((acc, key) => {
      acc[key] = raw[key]
      return acc
    }, {})
}

const buildCartItemKey = (productId, selectedOptions = {}) =>
  `${productId}::${JSON.stringify(normalizeSelectedOptions(selectedOptions))}`

const hydrateCartItem = (item = {}) => {
  const productId = item._id || item.productId
  const normalizedOptions = normalizeSelectedOptions(item.selectedOptions)
  return {
    ...item,
    _id: productId,
    selectedOptions: normalizedOptions,
    cartItemKey: item.cartItemKey || buildCartItemKey(productId, normalizedOptions)
  }
}

const hydrateCartItems = (items = []) => items.map(hydrateCartItem)

const resolveCartItemPayload = (state, itemOrKey) => {
  if (!itemOrKey) return null

  let item = itemOrKey
  if (typeof itemOrKey === 'string') {
    item = state.cart.find(i => i.cartItemKey === itemOrKey) || state.cart.find(i => i._id === itemOrKey)
  }
  if (!item) return null

  const productId = item._id || item.productId
  const selectedOptions = normalizeSelectedOptions(item.selectedOptions)
  return {
    cartItemKey: item.cartItemKey || buildCartItemKey(productId, selectedOptions),
    productId,
    selectedOptions
  }
}

const mapCartItemsFromApi = (items = []) => hydrateCartItems(items.map(i => ({
  _id: i.productId,
  name: i.name,
  price: i.price,
  image: i.image,
  category: i.category || '',
  stock: i.stock || 99,
  quantity: i.quantity,
  sellerId: i.sellerId,
  sellerName: i.sellerName,
  selectedOptions: i.selectedOptions instanceof Map
    ? Object.fromEntries(i.selectedOptions)
    : (i.selectedOptions || {})
})))

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    user: null,
    cart: hydrateCartItems(JSON.parse(localStorage.getItem('cart')) || []),
    searchQuery: ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
      // Set axios default headers
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      } else {
        delete axios.defaults.headers.common['Authorization']
      }
    },
    SET_USER(state, user) {
      state.user = user
    },
    SET_REFRESH_TOKEN(state, refreshToken) {
      state.refreshToken = refreshToken
      localStorage.setItem('refreshToken', refreshToken)
    },
    CLEAR_AUTH(state) {
      state.token = ''
      state.refreshToken = ''
      state.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      delete axios.defaults.headers.common['Authorization']
    },
    ADD_TO_CART(state, product) {
      const normalizedOptions = normalizeSelectedOptions(product.selectedOptions)
      const cartItemKey = buildCartItemKey(product._id, normalizedOptions)
      const existingItem = state.cart.find(item => item.cartItemKey === cartItemKey)

      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cart.push(hydrateCartItem({
          ...product,
          quantity: 1,
          selectedOptions: normalizedOptions,
          cartItemKey
        }))
      }

      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    REMOVE_FROM_CART(state, cartItemKey) {
      state.cart = state.cart.filter(item => item.cartItemKey !== cartItemKey)
      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    UPDATE_CART_ITEM_QUANTITY(state, { cartItemKey, quantity }) {
      const item = state.cart.find(cartItem => cartItem.cartItemKey === cartItemKey)
      if (item) {
        item.quantity = quantity
        localStorage.setItem('cart', JSON.stringify(state.cart))
      }
    },
    SET_CART(state, items) {
      state.cart = hydrateCartItems(items)
      if (Array.isArray(items)) {
        localStorage.setItem('cart', JSON.stringify(state.cart))
      } else {
        localStorage.removeItem('cart')
      }
    },
    CLEAR_CART(state) {
      state.cart = []
      localStorage.removeItem('cart')
    },
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
    }
  },
  actions: {
    async login({ commit, dispatch }, credentials) {
      try {
        const response = await axios.post('/api/users/login', credentials)
        commit('SET_TOKEN', response.data.token)
        commit('SET_REFRESH_TOKEN', response.data.refreshToken)
        commit('SET_USER', response.data.user)
        await dispatch('fetchCart')
        return response
      } catch (error) {
        throw error.response?.data || error
      }
    },
    async register({ commit, dispatch }, userData) {
      try {
        const response = await axios.post('/api/users/register', userData)
        commit('SET_TOKEN', response.data.token)
        commit('SET_REFRESH_TOKEN', response.data.refreshToken)
        commit('SET_USER', response.data.user)
        await dispatch('fetchCart')
        return response
      } catch (error) {
        throw error.response?.data || error
      }
    },
    async fetchUserProfile({ commit }) {
      try {
        const response = await axios.get('/api/users/me')
        commit('SET_USER', response.data)
        return response
      } catch (error) {
        throw error
      }
    },
    async fetchCart({ commit, state }) {
      try {
        if (!state.token) return
        const response = await axios.get('/api/cart')
        commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
        return response
      } catch (error) {
        // Bubble up for caller to handle if needed
        throw error
      }
    },
    logoutUser({ commit }) {
      commit('CLEAR_AUTH')
      commit('CLEAR_CART')
    },
    async addToCart({ commit, state }, product) {
      if (!state.token) {
        commit('ADD_TO_CART', product)
        return
      }
      const response = await axios.post('/api/cart/items', {
        productId: product._id,
        quantity: 1,
        selectedOptions: product.selectedOptions || {}
      })
      commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
    },
    async removeFromCart({ commit, state }, itemOrKey) {
      const payload = resolveCartItemPayload(state, itemOrKey)
      if (!payload) return

      if (!state.token) {
        commit('REMOVE_FROM_CART', payload.cartItemKey)
        return
      }
      try {
        const response = await axios.delete(`/api/cart/items/${payload.productId}`, {
          data: { selectedOptions: payload.selectedOptions }
        })
        commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
      } catch (error) {
        // If item not found (404), just remove locally
        if (error.response && error.response.status === 404) {
          commit('REMOVE_FROM_CART', payload.cartItemKey)
        } else {
          throw error
        }
      }
    },
    async updateCartItemQuantity({ commit, state }, { item, cartItemKey, quantity }) {
      const payload = resolveCartItemPayload(state, item || cartItemKey)
      if (!payload) return

      commit('UPDATE_CART_ITEM_QUANTITY', { cartItemKey: payload.cartItemKey, quantity })
      if (!state.token) return
      try {
        const response = await axios.patch(`/api/cart/items/${payload.productId}`, {
          quantity,
          selectedOptions: payload.selectedOptions
        })
        commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
      } catch (err) {
        console.error('Failed to update cart on server:', err)
      }
    },
    async clearCart({ commit, state }) {
      if (state.token) {
        await axios.delete('/api/cart')
      }
      commit('CLEAR_CART')
    },
    updateSearchQuery({ commit }, query) {
      commit('SET_SEARCH_QUERY', query)
    },
    async refreshToken({ commit, state }) {
      try {
        if (!state.refreshToken) {
          throw new Error('No refresh token available')
        }

        const response = await axios.post('/api/users/refresh-token', {
          refreshToken: state.refreshToken
        })

        commit('SET_TOKEN', response.data.token)
        commit('SET_REFRESH_TOKEN', response.data.refreshToken)

        return response.data.token
      } catch (error) {
        // If refresh fails, logout user
        commit('CLEAR_AUTH')
        throw error
      }
    }
  },
  getters: {
    isAuthenticated: state => !!state.token,
    currentUser: state => state.user,
    userRole: state => state.user?.role || 'customer',
    isAdmin: state => state.user?.role === 'admin',
    isSeller: state => state.user?.role === 'seller',
    isCustomer: state => state.user?.role === 'customer',
    cartItems: state => state.cart,
    cartItemCount: state => state.cart.reduce((total, item) => total + item.quantity, 0),
    cartTotal: state => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    searchQuery: state => state.searchQuery
  }
})
