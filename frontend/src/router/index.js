import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ProductDetail from '../views/ProductDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Profile from '../views/Profile.vue'
import Cart from '../views/Cart.vue'
import Checkout from '../views/Checkout.vue'
import AdminDashboard from '../views/AdminDashboard.vue'
import SellerDashboard from '../views/SellerDashboard.vue'
import Wishlist from '../views/Wishlist.vue'
import store from '../store'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/products',
    name: 'Products',
    redirect: to => ({ path: '/', query: to.query })
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: ProductDetail
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true, hideHeader: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true, hideHeader: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: Cart
  },
  {
    path: '/checkout',
    name: 'Checkout',
    component: Checkout,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, requiresRole: 'admin' }
  },
  {
    path: '/seller',
    name: 'SellerDashboard',
    component: SellerDashboard,
    meta: { requiresAuth: true, requiresRole: 'seller' }
  },
  {
    path: '/wishlist',
    name: 'Wishlist',
    component: Wishlist
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !store.getters.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && store.getters.isAuthenticated) {
    next('/')
  } else if (to.meta.requiresRole && store.getters.userRole !== to.meta.requiresRole) {
    // Redirect to appropriate dashboard based on user role
    if (store.getters.isAdmin) {
      next('/admin')
    } else if (store.getters.isSeller) {
      next('/seller')
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router
