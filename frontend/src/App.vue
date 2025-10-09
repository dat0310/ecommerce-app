<template>
  <div id="app">
    <!-- Modern Navigation -->
    <nav class="navbar navbar-expand-lg fixed-top">
      <div class="container">
        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <i class="bi bi-shop me-2"></i>
          <span class="gradient-text">ShopHub</span>
        </router-link>
        
        <button 
          class="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">


          </ul>
          <div class="d-flex mx-auto w-50">
            <div class="input-group">
              <input type="text" class="form-control" v-model="searchQueryModel" @keyup.enter="executeSearch" placeholder="Search products...">
              <button class="btn btn-primary" type="button" @click="executeSearch">Search</button>
            </div>
          </div>
          
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/cart" class="nav-link position-relative d-flex align-items-center">
                <i class="bi bi-cart3 me-1"></i>
                Cart
                <span v-if="cartItemCount > 0" class="badge bg-primary position-absolute top-0 start-100 translate-middle">
                  {{ cartItemCount }}
                </span>
              </router-link>
            </li>
            
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/login" class="nav-link d-flex align-items-center">
                <i class="bi bi-box-arrow-in-right me-1"></i>
                Login
              </router-link>
            </li>
            
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/register" class="nav-link d-flex align-items-center">
                <i class="bi bi-person-plus me-1"></i>
                Register
              </router-link>
            </li>
            
            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a 
                class="nav-link dropdown-toggle d-flex align-items-center" 
                href="#" 
                role="button" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
              >
                <i class="bi bi-person-circle me-1"></i>
                {{ userDisplayName }}
                <span class="badge bg-secondary ms-2">{{ currentUser?.role }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end wishlist-dropdown">
                <li>
                  <router-link to="/profile" class="dropdown-item d-flex align-items-center">
                    <i class="bi bi-person me-2"></i>
                    Profile
                  </router-link>
                </li>
                <li v-if="isAdmin">
                  <router-link to="/admin" class="dropdown-item d-flex align-items-center">
                    <i class="bi bi-shield-check me-2"></i>
                    Admin Dashboard
                  </router-link>
                </li>
                <li v-if="isSeller">
                  <router-link to="/seller" class="dropdown-item d-flex align-items-center">
                    <i class="bi bi-shop me-2"></i>
                    Seller Dashboard
                  </router-link>
                </li>
                <li>
                  <router-link to="/wishlist" class="dropdown-item d-flex align-items-center justify-content-between">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-heart me-2"></i>
                      Wishlist
                    </div>
                    <span class="badge bg-danger ms-auto">{{ wishlistCount }}</span>
                  </router-link>
                </li>
                <li><hr class="dropdown-divider"></li>
                <li>
                  <a href="#" @click="logout" class="dropdown-item d-flex align-items-center text-danger">
                    <i class="bi bi-box-arrow-right me-2"></i>
                    Logout
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Main Content with proper spacing for fixed navbar -->
    <main class="main-content">
      <router-view/>
    </main>

    <!-- Modern Footer -->
    <footer class="footer bg-dark text-light py-5 mt-5">
      <div class="container">
        <div class="row">
          <div class="col-md-4 mb-4">
            <h5 class="gradient-text mb-3">ShopHub</h5>
            <p class="text-muted">Your one-stop destination for amazing products at great prices. Experience modern shopping with our cutting-edge e-commerce platform.</p>
            <div class="d-flex gap-3">
              <a href="#" class="text-light"><i class="bi bi-facebook fs-5"></i></a>
              <a href="#" class="text-light"><i class="bi bi-twitter fs-5"></i></a>
              <a href="#" class="text-light"><i class="bi bi-instagram fs-5"></i></a>
              <a href="#" class="text-light"><i class="bi bi-linkedin fs-5"></i></a>
            </div>
          </div>
          
          <div class="col-md-2 mb-4">
            <h6 class="fw-bold mb-3">Quick Links</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><router-link to="/" class="text-muted text-decoration-none">Home</router-link></li>

              <li class="mb-2"><router-link to="/cart" class="text-muted text-decoration-none">Cart</router-link></li>
            </ul>
          </div>
          
          <div class="col-md-2 mb-4">
            <h6 class="fw-bold mb-3">Account</h6>
            <ul class="list-unstyled">
              <li class="mb-2"><router-link to="/login" class="text-muted text-decoration-none">Login</router-link></li>
              <li class="mb-2"><router-link to="/register" class="text-muted text-decoration-none">Register</router-link></li>
              <li class="mb-2"><router-link to="/profile" class="text-muted text-decoration-none">Profile</router-link></li>
            </ul>
          </div>
          
          <div class="col-md-4 mb-4">
            <h6 class="fw-bold mb-3">Newsletter</h6>
            <p class="text-muted mb-3">Subscribe to get updates on new products and exclusive offers!</p>
            <div class="input-group">
              <input type="email" class="form-control" placeholder="Enter your email">
              <button class="btn btn-primary" type="button">
                <i class="bi bi-envelope"></i>
              </button>
            </div>
          </div>
        </div>
        
        <hr class="my-4">
        
        <div class="row align-items-center">
          <div class="col-md-6">
            <p class="text-muted mb-0">&copy; 2024 ShopHub. All rights reserved.</p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="d-flex justify-content-md-end gap-4">
              <a href="#" class="text-muted text-decoration-none">Privacy Policy</a>
              <a href="#" class="text-muted text-decoration-none">Terms of Service</a>
              <a href="#" class="text-muted text-decoration-none">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  data() {
    return {
      wishlistItems: []
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'cartItemCount', 'currentUser', 'isAdmin', 'isSeller']),
    userDisplayName() {
      if (this.currentUser && this.currentUser.firstName && this.currentUser.lastName) {
        return `${this.currentUser.firstName} ${this.currentUser.lastName}`
      } else if (this.currentUser && this.currentUser.name) {
        return this.currentUser.name
      } else if (this.currentUser && this.currentUser.email) {
        return this.currentUser.email.split('@')[0]
      }
      return 'User'
    },
    wishlistCount() {
      return this.wishlistItems.length
    }
  },
  methods: {
    ...mapActions(['logoutUser', 'fetchUserProfile', 'updateSearchQuery']),
    executeSearch() {
      if (this.$route.path !== '/products') {
        this.$router.push('/products');
      }
    },
    async logout() {
      await this.logoutUser()
      this.$router.push('/login')
    },
    loadWishlist() {
      try {
        const raw = localStorage.getItem('wishlist')
        this.wishlistItems = raw ? JSON.parse(raw) : []
      } catch (_) {
        this.wishlistItems = []
      }
    },
    removeFromWishlist(productId) {
      const next = this.wishlistItems.filter(i => i._id !== productId)
      localStorage.setItem('wishlist', JSON.stringify(next))
      this.wishlistItems = next
      this.$toast && this.$toast.info('Removed from wishlist', { position: 'top-right', timeout: 1500 })
    }
  },
  async created() {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    if (token) {
      this.$store.commit('SET_TOKEN', token)
      // Fetch user profile to get firstName and lastName
      try {
        await this.fetchUserProfile()
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        // If profile fetch fails, clear the token
        this.$store.commit('CLEAR_AUTH')
      }
    }
    // init wishlist
    this.loadWishlist()
    // react to cross-tab changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'wishlist') {
        this.loadWishlist()
      }
    })
    // react to in-tab updates from components
    window.addEventListener('wishlist-updated', this.loadWishlist)
  }
}
</script>

<style scoped>
.main-content {
  padding-top: 80px; /* Account for fixed navbar */
  min-height: calc(100vh - 80px);
}

.navbar {
  transition: all 0.3s ease;
}

.navbar-brand {
  font-size: 1.75rem;
  font-weight: 800;
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: 12px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  max-width: 100vw;
  overflow-x: hidden;
}

.wishlist-dropdown {
  width: 280px;
  max-height: 360px;
  overflow-y: auto;
  overflow-x: hidden;
}

.dropdown-menu::-webkit-scrollbar {
  width: 8px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.wishlist-item {
  padding: 6px 4px;
}

.wishlist-thumb {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 8px;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: calc(100% - 1rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item:hover {
  background: var(--secondary-color);
  color: var(--primary-color);
}

.footer {
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
}

.footer a:hover {
  color: var(--primary-color) !important;
  transition: color 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }
  
  .navbar-brand {
    font-size: 1.5rem;
  }
  
  .footer .row > div {
    text-align: center;
  }
  
  .footer .text-md-end {
    text-align: center !important;
  }
}

.dropdown-menu {
  border: none;
  box-shadow: var(--shadow-lg);
  border-radius: 12px;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
  width: 280px;
  max-width: 100vw;
  overflow-x: hidden;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
  border-radius: 8px;
  margin: 0 0.5rem;
  display: flex;
  align-items: center;
  width: calc(100% - 1rem);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dropdown-item i {
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.dropdown-item .badge {
  margin-left: auto;
  flex-shrink: 0;
}

.dropdown-menu::-webkit-scrollbar {
  width: 8px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: transparent;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.dropdown-item:hover {
  background: var(--bs-dropdown-link-hover-bg);
  color: var(--bs-dropdown-link-hover-color);
}
</style>