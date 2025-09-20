import { createStore } from 'vuex'
import axios from 'axios'

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    user: null,
    cart: JSON.parse(localStorage.getItem('cart')) || []
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
    CLEAR_CART(state) {
      state.cart = []
      localStorage.removeItem('cart')
    }
  },
  actions: {
    async login({ commit }, credentials) {
      try {
        const response = await axios.post('/api/users/login', credentials)
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
        return response
      } catch (error) {
        throw error.response.data
      }
    },
    async register({ commit }, userData) {
      try {
        const response = await axios.post('/api/users/register', userData)
        commit('SET_TOKEN', response.data.token)
        commit('SET_USER', response.data.user)
        return response
      } catch (error) {
        throw error.response.data
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
    logoutUser({ commit }) {
      commit('CLEAR_AUTH')
      commit('CLEAR_CART')
    },
    addToCart({ commit }, product) {
      commit('ADD_TO_CART', product)
    },
    removeFromCart({ commit }, productId) {
      commit('REMOVE_FROM_CART', productId)
    },
    updateCartItemQuantity({ commit }, payload) {
      commit('UPDATE_CART_ITEM_QUANTITY', payload)
    },
    clearCart({ commit }) {
      commit('CLEAR_CART')
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
    cartTotal: state => state.cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }
})