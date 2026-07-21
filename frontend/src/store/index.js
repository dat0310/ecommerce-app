import { createStore } from 'vuex'
import axios from 'axios'
import { fetchUserProfile } from '../api/users'

export default createStore({
  state: {
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    user: null,
    searchQuery: ''
  },
  mutations: {
    SET_TOKEN(state, token) {
      state.token = token
      localStorage.setItem('token', token)
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
    SET_SEARCH_QUERY(state, query) {
      state.searchQuery = query
    }
  },
  actions: {
    logoutUser({ commit }) {
      commit('CLEAR_AUTH')
    },
    async fetchUserProfile({ commit, state }) {
      if (!state.token) return
      const data = await fetchUserProfile()
      commit('SET_USER', data)
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
    searchQuery: state => state.searchQuery
  }
})
