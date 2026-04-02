<template>
  <div class="home">
    <!-- Hero Banner -->
    <section class="home-hero">
      <div class="container">
        <div class="hero-content">
          <span class="hero-badge">Premium Shopping Experience</span>
          <h1 class="hero-title">Discover Quality Products</h1>
          <p class="hero-subtitle">Explore our curated collection of premium products with exceptional quality and unbeatable prices.</p>
        </div>
      </div>
      <div class="hero-decoration"></div>
    </section>

    <!-- Category Grid -->
    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Browse Categories</h2>
          <p class="section-subtitle">Find exactly what you're looking for</p>
        </div>
        <div class="categories-grid">
          <button 
            v-for="category in categories" 
            :key="category.name"
            @click="goToCategory(category.name)"
            class="category-card"
            :class="{ 'active': selectedCategory === category.name }"
          >
            <div class="category-icon">
              <i :class="['bi', category.icon]"></i>
            </div>
            <span class="category-name">{{ category.name }}</span>
          </button>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section class="products-section">
      <div class="container">
        <!-- Filter Bar -->
        <div class="filter-bar">
          <div class="filter-info">
            <span class="product-count">
              <i class="bi bi-grid-3x3-gap-fill"></i>
              {{ filteredProducts.length }} Products
            </span>
            <span v-if="selectedCategory" class="active-filter">
              {{ selectedCategory }}
              <button @click="clearCategory" class="filter-remove">
                <i class="bi bi-x"></i>
              </button>
            </span>
          </div>
          <div class="filter-controls">
            <select v-model="sortBy" class="sort-select">
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="loading-state">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p>Loading products...</p>
        </div>

        <!-- Empty State -->
        <div v-else-if="filteredProducts.length === 0" class="empty-state">
          <div class="empty-icon">
            <i class="bi bi-search"></i>
          </div>
          <h3>No products found</h3>
          <p>Try adjusting your search or filter criteria</p>
          <button @click="clearFilters" class="btn btn-primary">
            <i class="bi bi-arrow-clockwise me-2"></i>
            Clear Filters
          </button>
        </div>

        <!-- Products Grid -->
        <div v-else class="products-grid">
          <article
            v-for="(product, index) in paginatedProducts"
            :key="product._id"
            class="product-card-wrapper"
            data-aos="fade-up"
            :data-aos-delay="50 * (index % 4)"
          >
            <div class="product-card" @click="$router.push('/products/' + product._id)">
              <!-- Product Image -->
              <div class="product-image">
                <img
                  :src="(product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'"
                  :alt="product.name"
                  loading="lazy"
                >
                <!-- Badges -->
                <div class="product-badges">
                  <span v-if="product.stock > 0" class="badge badge-stock in-stock">In Stock</span>
                  <span v-else class="badge badge-stock out-of-stock">Out of Stock</span>
                </div>
                <!-- Wishlist Button -->
                <button
                  class="wishlist-btn"
                  @click.stop="toggleWishlist(product)"
                  :class="{ 'active': isWishlisted(product._id) }"
                  :aria-label="isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'"
                >
                  <i :class="isWishlisted(product._id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                </button>
                <!-- Category Tag -->
                <span class="product-category">{{ product.category || 'Uncategorized' }}</span>
              </div>
              
              <!-- Product Info -->
              <div class="product-info">
                <h3 class="product-name">{{ product.name }}</h3>
                <p class="product-description">{{ truncateText(product.description, 80) }}</p>
                <div class="product-footer">
                  <span class="product-price">{{ getDisplayPrice(product) }}</span>
                  <span class="product-stock">{{ product.stock || 0 }} left</span>
                </div>
              </div>
            </div>
          </article>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="pagination-wrapper" aria-label="Products pagination">
          <ul class="pagination">
            <li>
              <button 
                class="page-btn" 
                @click="currentPage = 1" 
                :disabled="currentPage === 1"
                aria-label="First page"
              >
                <i class="bi bi-chevron-double-left"></i>
              </button>
            </li>
            <li>
              <button 
                class="page-btn" 
                @click="currentPage--" 
                :disabled="currentPage === 1"
                aria-label="Previous page"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>

            <li v-for="page in visiblePages" :key="page">
              <button 
                class="page-btn" 
                :class="{ active: page === currentPage }"
                @click="currentPage = page"
              >
                {{ page }}
              </button>
            </li>

            <li>
              <button 
                class="page-btn" 
                @click="currentPage++" 
                :disabled="currentPage === totalPages"
                aria-label="Next page"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
            <li>
              <button 
                class="page-btn" 
                @click="currentPage = totalPages" 
                :disabled="currentPage === totalPages"
                aria-label="Last page"
              >
                <i class="bi bi-chevron-double-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Why Choose ShopHub?</h2>
          <p class="section-subtitle">We're committed to providing the best shopping experience</p>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-truck"></i>
            </div>
            <h3>Fast Shipping</h3>
            <p>Get your orders delivered to your doorstep quickly with our express shipping options.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-shield-check"></i>
            </div>
            <h3>Secure Payments</h3>
            <p>Your transactions are protected with industry-leading encryption and security.</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="bi bi-headset"></i>
            </div>
            <h3>24/7 Support</h3>
            <p>Our dedicated support team is always here to help you with any questions.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Home',
  data() {
    return {
      loading: true,
      products: [],
      selectedCategory: '',
      sortBy: 'name',
      currentPage: 1,
      itemsPerPage: 12,
      wishlistIds: [],
      categories: [
        { name: 'Laptop', icon: 'bi-laptop' },
        { name: 'Mobile', icon: 'bi-phone' },
        { name: 'Headphone', icon: 'bi-headphones' },
        { name: 'Speaker', icon: 'bi-speaker' },
        { name: 'Watch', icon: 'bi-watch' },
        { name: 'Camera', icon: 'bi-camera' },
        { name: 'Appliances', icon: 'bi-house' },
        { name: 'Computing & Displays', icon: 'bi-display' }
      ]
    }
  },
  computed: {
    ...mapGetters(['searchQuery', 'isAuthenticated']),
    filteredProducts() {
      let filtered = this.products

      if (this.selectedCategory) {
        filtered = filtered.filter(product => product.category === this.selectedCategory)
      }

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(product =>
          product.name.toLowerCase().includes(query)
        )
      }

      filtered = this.sortProducts(filtered)

      return filtered
    },
    paginatedProducts() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredProducts.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredProducts.length / this.itemsPerPage)
    },
    visiblePages() {
      const pages = []
      const start = Math.max(1, this.currentPage - 2)
      const end = Math.min(this.totalPages, this.currentPage + 2)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    }
  },
  async created() {
    if (this.$route.query.category) {
      this.selectedCategory = this.$route.query.category
    }
    if (this.$route.query.q) {
      this.searchQuery = this.$route.query.q
    }
    try {
      const response = await this.$http.get('/api/products')
      this.products = response.data
      this.loadWishlist()
    } catch (error) {
      console.error('Error fetching products:', error)
      this.$toast.error('Failed to load products. Please try again later.', {
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['addToCart', 'updateSearchQuery']),
    goToCategory(category) {
      if (this.selectedCategory === category) {
        this.selectedCategory = ''
        this.$router.replace({ query: { ...this.$route.query, category: undefined } }).catch(() => {})
      } else {
        this.selectedCategory = category
        this.currentPage = 1
        this.$router.replace({ query: { ...this.$route.query, category } }).catch(() => {})
      }
    },
    clearCategory() {
      this.selectedCategory = ''
      this.currentPage = 1
      const query = { ...this.$route.query }
      delete query.category
      this.$router.replace({ query }).catch(() => {})
    },
    loadWishlist() {
      try {
        const raw = localStorage.getItem('wishlist')
        const items = raw ? JSON.parse(raw) : []
        this.wishlistIds = items.map(item => item._id)
      } catch (_) {
        this.wishlistIds = []
      }
    },
    saveWishlist(items) {
      localStorage.setItem('wishlist', JSON.stringify(items))
    },
    isWishlisted(productId) {
      return this.wishlistIds.includes(productId)
    },
    toggleWishlist(product) {
      if (!product) return
      let items = []
      try {
        items = JSON.parse(localStorage.getItem('wishlist') || '[]')
      } catch (_) {
        items = []
      }
      const index = items.findIndex(it => it._id === product._id)
      if (index >= 0) {
        items.splice(index, 1)
        this.$toast && this.$toast.info('Removed from wishlist', { position: 'top-right', timeout: 1800 })
      } else {
        const minimal = { _id: product._id, name: product.name, price: product.price, image: (product.images && product.images[0]) || product.image || '' }
        items.push(minimal)
        this.$toast && this.$toast.success('Added to wishlist', { position: 'top-right', timeout: 1800 })
      }
      this.saveWishlist(items)
      this.wishlistIds = items.map(it => it._id)
      window.dispatchEvent(new Event('wishlist-updated'))
    },
    truncateText(text, length) {
      if (!text) return ''
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
    },
    getDisplayPrice(product) {
      if (product.productCombinations && product.productCombinations.length > 0) {
        const prices = product.productCombinations.map(c => c.price)
        const minPrice = Math.min(...prices)
        const maxPrice = Math.max(...prices)
        if (minPrice === maxPrice) return `$${minPrice}`
        return `$${minPrice} - $${maxPrice}`
      }
      return `$${product.price}`
    },
    sortProducts(products) {
      const sorted = [...products]

      switch (this.sortBy) {
        case 'price-low':
          return sorted.sort((a, b) => a.price - b.price)
        case 'price-high':
          return sorted.sort((a, b) => b.price - a.price)
        case 'newest':
          return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        case 'name':
        default:
          return sorted.sort((a, b) => a.name.localeCompare(b.name))
      }
    },
    clearFilters() {
      this.selectedCategory = ''
      this.sortBy = 'name'
      this.currentPage = 1
      if (this.$route.query.q || this.$route.query.category) {
        this.$router.push({ name: 'Home' }).catch(() => {})
      }
    }
  },
  watch: {
    '$route.query.category'(newCategory) {
      this.selectedCategory = newCategory || ''
    },
    '$route.query.q'(newQuery) {
      this.searchQuery = newQuery || ''
    },
    selectedCategory() {
      this.currentPage = 1
    },
    searchQuery() {
      this.currentPage = 1
    },
    sortBy() {
      this.currentPage = 1
    }
  }
}
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   Home Page Premium Styles
   ═══════════════════════════════════════════════════════════════════════════ */

/* Hero Section */
.home-hero {
  position: relative;
  background: var(--gradient-hero);
  padding: 80px 0 100px;
  overflow: hidden;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.hero-badge {
  display: inline-block;
  padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 16px;
  backdrop-filter: blur(10px);
}

.hero-title {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 700;
  color: var(--white);
  line-height: 1.2;
  margin-bottom: 16px;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.7;
  margin: 0;
}

.hero-decoration {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

/* Section Styles */
.section-header {
  text-align: center;
  margin-bottom: 40px;
}

.section-title {
  font-family: var(--font-heading);
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.section-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

/* Categories Section */
.categories-section {
  padding: 60px 0;
  background: var(--bg-page);
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 16px;
  background: var(--bg-surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.category-card:hover {
  border-color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.category-card.active {
  border-color: var(--primary);
  background: var(--primary-light);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

.category-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gradient-primary);
  border-radius: var(--radius-md);
  color: var(--white);
  font-size: 1.25rem;
}

.category-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
}

/* Products Section */
.products-section {
  padding: 40px 0 80px;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.product-count i {
  color: var(--primary);
}

.active-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--white);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.filter-remove:hover {
  background: var(--primary-hover);
}

.sort-select {
  min-width: 180px;
  padding: 10px 36px 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--gray-50);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.sort-select:hover {
  background-color: var(--gray-100);
}

.sort-select:focus {
  border-color: var(--primary);
  background-color: var(--white);
  outline: none;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-state p,
.empty-state p {
  color: var(--text-secondary);
  margin-top: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-100);
  border-radius: var(--radius-full);
  font-size: 2rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

/* Product Card */
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
  border-color: transparent;
}

.product-image {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
  background: var(--gray-100);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.badge-stock {
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-stock.in-stock {
  background: var(--success-light);
  color: var(--success);
}

.badge-stock.out-of-stock {
  background: var(--danger-light);
  color: var(--danger);
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  z-index: 2;
}

.wishlist-btn:hover {
  transform: scale(1.1);
}

.wishlist-btn.active {
  color: var(--danger);
}

.product-category {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 12px;
  background: var(--gradient-primary);
  color: var(--white);
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  z-index: 2;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.product-name {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.product-price {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.product-stock {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.pagination {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: var(--white);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Features Section */
.features-section {
  padding: 80px 0;
  background: var(--gray-50);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 32px;
}

.feature-card {
  text-align: center;
  padding: 40px 32px;
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  transition: all var(--transition-smooth);
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  background: var(--gradient-primary);
  border-radius: var(--radius-lg);
  color: var(--white);
  font-size: 1.75rem;
}

.feature-card h3 {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.feature-card p {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Responsive */
@media (max-width: 992px) {
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-decoration {
    display: none;
  }
}

@media (max-width: 768px) {
  .home-hero {
    padding: 60px 0 80px;
    text-align: center;
  }
  
  .hero-content {
    max-width: 100%;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .filter-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .filter-info {
    justify-content: center;
  }
  
  .sort-select {
    width: 100%;
  }
  
  .categories-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 576px) {
  .categories-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .section-title {
    font-size: 1.5rem;
  }
  
  .pagination {
    gap: 4px;
  }
  
  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}
</style>