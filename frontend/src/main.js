import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import axios from 'axios'
import 'bootstrap-icons/font/bootstrap-icons.css'

// Set base URL for API calls
axios.defaults.baseURL = 'http://localhost:3000'

const app = createApp(App)
app.use(store)
app.use(router)
app.config.globalProperties.$http = axios
app.mount('#app')