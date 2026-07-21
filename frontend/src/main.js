import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import AOS from 'aos'
import 'aos/dist/aos.css'
import './assets/css/modern.css'
import { VueQueryPlugin, queryClient } from './plugins/vue-query'

const app = createApp(App)
app.use(store)
app.use(router)
app.use(VueQueryPlugin, { queryClient })
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
app.config.globalProperties.$toast = useToast()

// Initialize AOS
AOS.init({
  duration: 1000,
  once: true,
  offset: 100
})

app.mount('#app')