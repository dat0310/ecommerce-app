import { createStore } from 'vuex'
import axios from 'axios'

const mapCartItemsFromApi = (items = []) => items.map(i => ({
  _id: i.productId,
  name: i.name,
  price: i.price,
  image: i.image,
  quantity: i.quantity,
  sellerId: i.sellerId,
  sellerName: i.sellerName
}));

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user: null,
    cart: JSON.parse(localStorage.getItem('cart')) || [],
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
    CLEAR_AUTH(state) {
      state.token = ''
      state.user = null
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    },
    ADD_TO_CART(state, product) {
      const existingItem = state.cart.find(item => item._id === product._id)
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        state.cart.push({ ...product, quantity: 1 })
      }
      
      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    REMOVE_FROM_CART(state, productId) {
      state.cart = state.cart.filter(item => item._id !== productId)
      localStorage.setItem('cart', JSON.stringify(state.cart))
    },
    UPDATE_CART_ITEM_QUANTITY(state, { productId, quantity }) {
      const item = state.cart.find(item => item._id === productId)
      if (item) {
        item.quantity = quantity
        localStorage.setItem('cart', JSON.stringify(state.cart))
      }
    },
    SET_CART(state, items) {
      state.cart = items
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
        commit('SET_USER', response.data.user)
        await dispatch('fetchCart')
        return response
      } catch (error) {
        throw error.response?.data || error
      }
    },
    async fetchUserProfile({ commit }) {
      try {
        const response = await axios.get('/api/users/profile')
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
      const response = await axios.post('/api/cart/items', { productId: product._id, quantity: 1 })
      commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
    },
    async removeFromCart({ commit, state }, productId) {
      if (!state.token) {
        commit('REMOVE_FROM_CART', productId)
        return
      }
      const response = await axios.delete(`/api/cart/items/${productId}`)
      commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
    },
    async updateCartItemQuantity({ commit, state }, { productId, quantity }) {
      if (!state.token) {
        commit('UPDATE_CART_ITEM_QUANTITY', { productId, quantity })
        return
      }
      const response = await axios.patch(`/api/cart/items/${productId}`, { quantity })
      commit('SET_CART', mapCartItemsFromApi(response.data.items || []))
    },
    async clearCart({ commit, state }) {
      if (state.token) {
        await axios.delete('/api/cart')
      }
      commit('CLEAR_CART')
    },
    updateSearchQuery({ commit }, query) {
      commit('SET_SEARCH_QUERY', query)
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