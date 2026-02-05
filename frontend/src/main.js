import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './assets/css/modern.css'

// Set base URL for API calls
axios.defaults.baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000'

// Axios request interceptor to add the token to headers
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Token refresh state management
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

// URLs that should NOT trigger token refresh on 401
const authUrls = ['/api/users/refresh-token', '/api/users/login', '/api/users/register']

// Axios response interceptor to handle 401 errors globally
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // Don't retry for auth endpoints or if already retried
    const isAuthUrl = authUrls.some(url => originalRequest.url?.includes(url))

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthUrl) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(token => {
          originalRequest.headers['Authorization'] = `Bearer ${token}`
          return axios(originalRequest)
        }).catch(err => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh the token
        await store.dispatch('refreshToken')
        const newToken = store.state.token

        // Process queued requests
        processQueue(null, newToken)

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`
        return axios(originalRequest)
      } catch (refreshError) {
        // Process queued requests with error
        processQueue(refreshError, null)

        // Refresh failed, logout and redirect to login
        store.dispatch('logoutUser')
        router.push('/login')
        // Show toast only if not on login page
        if (router.currentRoute.value.path !== '/login') {
          // Use nextTick to ensure router has updated
          import('vue').then(({ nextTick }) => {
            nextTick(() => {
              // Import useToast dynamically
              import('vue-toastification').then(({ useToast }) => {
                const toast = useToast()
                toast.error('Your session has expired. Please log in again.')
              })
            })
          })
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

const app = createApp(App)
app.use(store)
app.use(router)
app.use(Toast, {
  position: 'top-right',
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
})
app.config.globalProperties.$http = axios
app.config.globalProperties.$toast = useToast()

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
})

app.mount('#app')