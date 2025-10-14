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

// Axios response interceptor to handle 401 errors globally
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Attempt to refresh the token
        await store.dispatch('refreshToken')

        // Retry the original request with the new token
        originalRequest.headers['Authorization'] = `Bearer ${store.state.token}`
        return axios(originalRequest)
      } catch (refreshError) {
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