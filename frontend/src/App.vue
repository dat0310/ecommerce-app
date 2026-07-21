<template>
  <div id="app">
    <!-- Premium Glass Navigation -->
    <nav v-if="showHeader" class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <router-link to="/" class="navbar-brand">
          <i class="bi bi-bag-heart-fill"></i>
          <span class="gradient-text">ShopHub</span>
        </router-link>
        
        <button 
          class="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <i class="bi bi-list"></i>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Search Bar - Centered -->
          <div class="search-container mx-auto">
            <div class="search-box">
              <i class="bi bi-search search-icon"></i>
              <input 
                type="text" 
                class="search-input" 
                v-model="searchQueryModel" 
                @keyup.enter="executeSearch" 
                placeholder="Search products..."
              >
              <button class="search-btn" type="button" @click="executeSearch">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
          
          <!-- Right Nav Items -->
          <ul class="navbar-nav ms-auto align-items-center">
            <!-- Cart -->
            <li class="nav-item">
              <router-link to="/cart" class="nav-link nav-icon-link">
                <div class="nav-icon-wrapper">
                  <i class="bi bi-bag"></i>
                  <span v-if="cartItemCount > 0" class="nav-badge">{{ cartItemCount }}</span>
                </div>
                <span class="nav-label">Cart</span>
              </router-link>
            </li>
            
            <!-- Auth Links (Not Logged In) -->
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/login" class="nav-link">
                <i class="bi bi-person"></i>
                <span>Login</span>
              </router-link>
            </li>
            
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/register" class="btn btn-primary btn-sm ms-2">
                Get Started
              </router-link>
            </li>
            
            <!-- User Dropdown (Logged In) -->
            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a 
                class="nav-link user-dropdown-toggle" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <div class="user-avatar">
                  <i class="bi bi-person-fill"></i>
                </div>
                <span class="user-name">{{ userDisplayName }}</span>
                <span class="user-role-badge">{{ currentUser?.role }}</span>
                <i class="bi bi-chevron-down dropdown-arrow"></i>
              </a>
              <ul class="dropdown-menu dropdown-menu-end user-dropdown">
                <li class="dropdown-header">
                  <span class="header-name">{{ userDisplayName }}</span>
                  <span class="header-email">{{ currentUser?.email }}</span>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="bi bi-person"></i>
                    My Profile
                  </router-link>
                </li>
                <li>
                  <router-link to="/wishlist" class="dropdown-item">
                    <i class="bi bi-heart"></i>
                    Wishlist
                    <span class="item-count" v-if="wishlistCount > 0">{{ wishlistCount }}</span>
                  </router-link>
                </li>
                <li v-if="isAdmin">
                  <router-link to="/admin" class="dropdown-item">
                    <i class="bi bi-speedometer2"></i>
                    Admin Dashboard
                  </router-link>
                </li>
                <li v-if="isSeller">
                  <router-link to="/seller" class="dropdown-item">
                    <i class="bi bi-shop-window"></i>
                    Seller Dashboard
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a href="#" @click.prevent="logout" class="dropdown-item logout-item">
                    <i class="bi bi-box-arrow-right"></i>
                    Sign Out
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main :class="['main-content', { 'main-content--no-header': !showHeader }]">
      <router-view/>
    </main>

    <!-- Chat Widget -->
    <ChatWidget v-if="isAuthenticated" ref="globalChat" />

    <!-- Premium Footer -->
    <footer :class="['footer', { 'footer--no-margin': !showHeader }]">
      <div class="container">
        <div class="row g-4">
          <!-- Brand Column -->
          <div class="col-lg-4 col-md-6">
            <div class="footer-brand">
              <i class="bi bi-bag-heart-fill"></i>
              <span>ShopHub</span>
            </div>
            <p class="footer-desc">
              Your premium destination for quality products. Experience modern shopping with our cutting-edge e-commerce platform.
            </p>
            <div class="footer-social">
              <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a>
              <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="bi bi-linkedin"></i></a>
            </div>
          </div>
          
          <!-- Quick Links -->
          <div class="col-lg-2 col-md-6">
            <h6 class="footer-heading">Shop</h6>
            <ul class="footer-links">
              <li><router-link to="/">All Products</router-link></li>
              <li><router-link to="/cart">Shopping Cart</router-link></li>
              <li><router-link to="/wishlist">Wishlist</router-link></li>
            </ul>
          </div>
          
          <!-- Account Links -->
          <div class="col-lg-2 col-md-6">
            <h6 class="footer-heading">Account</h6>
            <ul class="footer-links">
              <li><router-link to="/login">Sign In</router-link></li>
              <li><router-link to="/register">Create Account</router-link></li>
              <li><router-link to="/profile">My Profile</router-link></li>
            </ul>
          </div>
          
          <!-- Newsletter -->
          <div class="col-lg-4 col-md-6">
            <h6 class="footer-heading">Stay Updated</h6>
            <p class="footer-newsletter-text">Subscribe for exclusive deals and new arrivals.</p>
            <div class="newsletter-form">
              <input type="email" class="newsletter-input" placeholder="Your email address">
              <button class="newsletter-btn" type="button">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
        
        <!-- Footer Bottom -->
        <div class="footer-bottom">
          <div class="row align-items-center">
            <div class="col-md-6">
              <p class="copyright">&copy; 2024 ShopHub. All rights reserved.</p>
            </div>
            <div class="col-md-6">
              <div class="footer-bottom-links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import ChatWidget from './components/ChatWidget.vue'
import { useToast } from 'vue-toastification'
import { queryClient } from '@/plugins/vue-query'

const store = useStore()
const route = useRoute()
const router = useRouter()
const toast = useToast()

const globalChat = ref(null)
const searchQueryModel = ref('')
const wishlistItems = ref([])

const isAuthenticated = computed(() => store.getters.isAuthenticated)
const cartItemCount = computed(() => store.getters.cartItemCount)
const currentUser = computed(() => store.getters.currentUser)
const isAdmin = computed(() => store.getters.isAdmin)
const isSeller = computed(() => store.getters.isSeller)

const showHeader = computed(() => !route.meta?.hideHeader)

const userDisplayName = computed(() => {
  if (currentUser.value?.firstName && currentUser.value?.lastName) {
    return `${currentUser.value.firstName} ${currentUser.value.lastName}`
  } else if (currentUser.value?.name) {
    return currentUser.value.name
  } else if (currentUser.value?.email) {
    return currentUser.value.email.split('@')[0]
  }
  return 'User'
})

const wishlistCount = computed(() => wishlistItems.value.length)

const executeSearch = () => {
  store.dispatch('updateSearchQuery', searchQueryModel.value)
  if (route.name !== 'Home' || route.query.q !== searchQueryModel.value) {
    router.push({ name: 'Home', query: { q: searchQueryModel.value } }).catch(err => {
      if (err.name !== 'NavigationDuplicated') throw err
    })
  }
}

const logout = async () => {
  queryClient.clear()
  await store.dispatch('logoutUser')
  router.push('/login')
}

const loadWishlist = () => {
  try {
    const raw = localStorage.getItem('wishlist')
    wishlistItems.value = raw ? JSON.parse(raw) : []
  } catch (_) {
    wishlistItems.value = []
  }
}

const removeFromWishlist = (productId) => {
  const next = wishlistItems.value.filter(i => i._id !== productId)
  localStorage.setItem('wishlist', JSON.stringify(next))
  wishlistItems.value = next
  toast.info('Removed from wishlist', { position: 'top-right', timeout: 1500 })
}

const handleOpenSellerChat = (e) => {
  const { sellerId, sellerName, productContext } = e.detail
  const chat = globalChat.value
  if (chat) {
    chat.currentProductContext = productContext || null
    chat.showProductCard = !!productContext
    chat.isOpen = true
    chat.startConversationWith(sellerId, sellerName)
  }
}

watch(() => route.query.q, (newQuery) => {
  searchQueryModel.value = newQuery || ''
  store.dispatch('updateSearchQuery', searchQueryModel.value)
})

onMounted(async () => {
  searchQueryModel.value = route.query.q || ''
  store.dispatch('updateSearchQuery', searchQueryModel.value)
  
  const token = localStorage.getItem('token')
  if (token) {
    store.commit('SET_TOKEN', token)
    try {
      await store.dispatch('fetchUserProfile')
    } catch (error) {
      console.error('Failed to fetch user profile:', error)
      store.commit('CLEAR_AUTH')
    }
  }
  
  loadWishlist()
  
  window.addEventListener('storage', (e) => {
    if (e.key === 'wishlist') {
      loadWishlist()
    }
  })
  window.addEventListener('wishlist-updated', loadWishlist)
  window.addEventListener('open-seller-chat', handleOpenSellerChat)
})

onBeforeUnmount(() => {
  window.removeEventListener('open-seller-chat', handleOpenSellerChat)
  window.removeEventListener('wishlist-updated', loadWishlist)
})
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   App.vue Premium Scoped Styles
   ═══════════════════════════════════════════════════════════════════════════ */

/* Main Content */
.main-content {
  padding-top: 76px;
  min-height: calc(100vh - 76px);
}

.main-content--no-header {
  padding-top: 0;
  min-height: 100vh;
}

/* ─────────────────────────────────────────────────────────────────────────────
   NAVBAR
   ───────────────────────────────────────────────────────────────────────────── */
.navbar {
  padding: 12px 0;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  text-decoration: none;
}

.navbar-brand i {
  font-size: 1.75rem;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.navbar-toggler {
  border: none;
  padding: 8px;
  font-size: 1.5rem;
  color: var(--text-primary);
}

.navbar-toggler:focus {
  box-shadow: none;
}

/* Search Container */
.search-container {
  flex: 1;
  max-width: 480px;
  margin: 0 24px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 1rem;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 10px 48px 10px 44px;
  font-size: 0.875rem;
  background: var(--gray-50);
  border: 2px solid transparent;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.search-input:hover {
  background: var(--gray-100);
}

.search-input:focus {
  background: var(--white);
  border-color: var(--primary);
  outline: none;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.search-btn {
  position: absolute;
  right: 4px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--white);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-btn:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

/* Nav Links */
.nav-icon-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 16px !important;
}

.nav-icon-wrapper {
  position: relative;
  font-size: 1.25rem;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  background: var(--gradient-primary);
  color: var(--white);
  border-radius: var(--radius-full);
  padding: 0 5px;
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: var(--text-secondary);
}

/* User Dropdown Toggle */
.user-dropdown-toggle {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px !important;
  background: var(--gray-50);
  border-radius: var(--radius-full);
  margin-left: 8px;
}

.user-dropdown-toggle::after {
  display: none;
}

.user-avatar {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-full);
  color: var(--white);
  font-size: 0.875rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-role-badge {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 8px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
}

.dropdown-arrow {
  font-size: 0.75rem;
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.user-dropdown-toggle[aria-expanded="true"] .dropdown-arrow {
  transform: rotate(180deg);
}

/* User Dropdown Menu */
.user-dropdown {
  min-width: 240px;
  padding: 8px;
}

.dropdown-header {
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
}

.header-name {
  font-weight: 600;
  color: var(--text-primary);
}

.header-email {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  margin: 2px 0;
}

.dropdown-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.dropdown-item:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.dropdown-item .item-count {
  margin-left: auto;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  background: var(--danger-light);
  color: var(--danger);
  border-radius: var(--radius-full);
}

.logout-item {
  color: var(--danger);
}

.logout-item:hover {
  background: var(--danger-light);
  color: var(--danger);
}

.dropdown-divider {
  margin: 8px 0;
  border-color: var(--border-light);
}

/* ─────────────────────────────────────────────────────────────────────────────
   FOOTER
   ───────────────────────────────────────────────────────────────────────────── */
.footer {
  background: linear-gradient(135deg, #1E293B 0%, #0F172A 100%);
  color: var(--gray-300);
  padding: 64px 0 24px;
  margin-top: 80px;
}

.footer--no-margin {
  margin-top: 0;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 16px;
}

.footer-brand i {
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-desc {
  font-size: 0.875rem;
  color: var(--gray-400);
  line-height: 1.7;
  margin-bottom: 24px;
}

.footer-social {
  display: flex;
  gap: 12px;
}

.footer-social a {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-full);
  color: var(--gray-400);
  font-size: 1.1rem;
  transition: all var(--transition-fast);
}

.footer-social a:hover {
  background: var(--primary);
  color: var(--white);
  transform: translateY(-3px);
}

.footer-heading {
  font-family: var(--font-heading);
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--white);
  margin-bottom: 20px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-links li {
  margin-bottom: 12px;
}

.footer-links a {
  font-size: 0.875rem;
  color: var(--gray-400);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-links a:hover {
  color: var(--white);
}

.footer-newsletter-text {
  font-size: 0.875rem;
  color: var(--gray-400);
  margin-bottom: 16px;
}

.newsletter-form {
  display: flex;
  position: relative;
}

.newsletter-input {
  flex: 1;
  padding: 12px 50px 12px 16px;
  font-size: 0.875rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-full);
  color: var(--white);
  transition: all var(--transition-fast);
}

.newsletter-input::placeholder {
  color: var(--gray-500);
}

.newsletter-input:focus {
  outline: none;
  background: rgba(255, 255, 255, 0.12);
  border-color: var(--primary);
}

.newsletter-btn {
  position: absolute;
  right: 4px;
  top: 50%;
  transform: translateY(-50%);
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--white);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.newsletter-btn:hover {
  transform: translateY(-50%) scale(1.05);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  margin-top: 48px;
  padding-top: 24px;
}

.copyright {
  font-size: 0.875rem;
  color: var(--gray-500);
  margin: 0;
}

.footer-bottom-links {
  display: flex;
  justify-content: flex-end;
  gap: 24px;
}

.footer-bottom-links a {
  font-size: 0.875rem;
  color: var(--gray-500);
  text-decoration: none;
  transition: color var(--transition-fast);
}

.footer-bottom-links a:hover {
  color: var(--white);
}

/* ─────────────────────────────────────────────────────────────────────────────
   RESPONSIVE
   ───────────────────────────────────────────────────────────────────────────── */
@media (max-width: 991px) {
  .search-container {
    order: 3;
    max-width: 100%;
    width: 100%;
    margin: 16px 0 8px;
  }
  
  .navbar-nav {
    padding: 8px 0;
  }
  
  .nav-icon-link {
    flex-direction: row;
    gap: 8px;
  }
  
  .user-dropdown-toggle {
    width: 100%;
    margin-left: 0;
    margin-top: 8px;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }
  
  .footer {
    text-align: center;
    padding: 48px 0 24px;
  }
  
  .footer-brand {
    justify-content: center;
  }
  
  .footer-social {
    justify-content: center;
  }
  
  .footer-heading {
    margin-top: 32px;
  }
  
  .footer-bottom-links {
    justify-content: center;
    margin-top: 16px;
  }
}

@media (max-width: 576px) {
  .navbar-brand span {
    display: none;
  }
  
  .user-name,
  .user-role-badge {
    display: none;
  }
}
</style>
