<template>
  <div class="home">
    <!-- Category Grid -->
    <section class="category-grid py-5">
      <div class="container">
        <h2 class="text-center mb-4">Categories</h2>
        <div class="row row-cols-2 row-cols-md-4 g-4">
          <div class="col" v-for="category in categories" :key="category.name">
            <a href="#" @click.prevent="goToCategory(category.name)" class="text-decoration-none text-dark">
              <div class="card text-center category-card h-100" :class="{ 'active-category': selectedCategory === category.name }">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                  <i :class="['bi', category.icon, 'fs-1', 'mb-3', 'text-primary']"></i>
                  <h6 class="mb-0">{{ category.name }}</h6>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Sort & Filter Bar -->
    <section class="py-4 bg-light border-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="d-flex align-items-center gap-3">
              <h5 class="mb-0 fw-bold">
                <i class="bi bi-grid-3x3-gap me-2"></i>
                {{ filteredProducts.length }} Products
                <span v-if="selectedCategory" class="badge bg-primary ms-2">{{ selectedCategory }}
                  <button class="btn-close btn-close-white ms-1" style="font-size: 0.5rem;" @click="clearCategory"></button>
                </span>
              </h5>
            </div>
          </div>
          <div class="col-lg-3 ms-auto">
            <select v-model="sortBy" class="form-select">
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Grid -->
    <section class="py-5">
      <div class="container">
        <!-- Loading State -->
        <div v-if="loading" class="row">
          <div class="col-12 text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-3 text-muted">Loading products...</p>
          </div>
        </div>

        <!-- No Products Found -->
        <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="bi bi-search fs-1 text-muted mb-3"></i>
            <h4 class="fw-bold mb-3">No products found</h4>
            <p class="text-muted mb-4">Try adjusting your search or filter criteria</p>
            <button @click="clearFilters" class="btn btn-primary">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Clear Filters
            </button>
          </div>
        </div>

        <!-- Products Grid -->
        <div v-else class="row g-4">
          <div
            class="col-lg-4 col-md-6"
            v-for="(product, index) in paginatedProducts"
            :key="product._id"
            data-aos="fade-up"
            :data-aos-delay="100 * (index % 3)"
          >
            <div class="card product-card h-100" @click="$router.push('/products/' + product._id)" style="cursor: pointer;">
              <div class="position-relative overflow-hidden">
                <img
                  :src="(product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'"
                  class="card-img-top"
                  :alt="product.name"
                  style="height: 250px; object-fit: cover;"
                >
                <div class="position-absolute top-0 end-0 p-2">
                  <span v-if="product.stock > 0" class="badge bg-success">In Stock</span>
                  <span v-else class="badge bg-danger">Out of Stock</span>
                </div>
                <div class="position-absolute top-0 start-0 p-2">
                  <button
                    class="btn btn-sm btn-light rounded-circle"
                    @click.stop="toggleWishlist(product)"
                    :aria-pressed="isWishlisted(product._id) ? 'true' : 'false'"
                    :title="isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'"
                  >
                    <i :class="isWishlisted(product._id) ? 'bi bi-heart-fill text-danger' : 'bi bi-heart'"></i>
                  </button>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 p-3">
                  <span class="badge bg-primary">{{ product.category || 'Uncategorized' }}</span>
                </div>
              </div>

              <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">{{ product.name }}</h5>
                <p class="card-text text-muted flex-grow-1">{{ truncateText(product.description, 100) }}</p>

                <div class="d-flex align-items-center justify-content-between">
                  <div>
                    <span class="h4 fw-bold text-primary mb-0">{{ getDisplayPrice(product) }}</span>
                  </div>
                  <div class="text-end">
                    <small class="text-muted d-block">Stock: {{ product.stock || 0 }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="row mt-5">
          <div class="col-12">
            <nav aria-label="Products pagination">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-double-left"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                    <i class="bi bi-chevron-left"></i>
                  </button>
                </li>

                <li
                  v-for="page in visiblePages"
                  :key="page"
                  class="page-item"
                  :class="{ active: page === currentPage }"
                >
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>

                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-right"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                    <i class="bi bi-chevron-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-us py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-4">Why Choose Us?</h2>
        <div class="row">
          <div class="col-md-4 text-center">
            <i class="bi bi-truck fs-1 text-primary"></i>
            <h5 class="mt-3">Fast Shipping</h5>
            <p>Get your orders delivered to your doorstep in no time.</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="bi bi-shield-check fs-1 text-primary"></i>
            <h5 class="mt-3">Secure Payments</h5>
            <p>Your payments are processed securely with our top-notch security.</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="bi bi-headset fs-1 text-primary"></i>
            <h5 class="mt-3">24/7 Support</h5>
            <p>Our team is here to help you with any questions you may have.</p>
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
/* Category Grid */
.category-grid .category-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid #e9ecef;
}

.category-grid .category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  border-color: #0d6efd;
}

.category-grid .category-card.active-category {
  border-color: #0d6efd;
  background: rgba(13, 110, 253, 0.05);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.2);
}

.empty-state {
  padding: 3rem 1rem;
}

/* Product Card */
.product-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
  position: relative;
}

.product-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--gradient-primary);
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
  pointer-events: none;
}

.product-card:hover::before {
  opacity: 0.05;
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.product-card .card-body,
.product-card .card-footer {
  position: relative;
  z-index: 2;
}

.product-card .card-img-top {
  transition: transform 0.4s ease;
}

.product-card:hover .card-img-top {
  transform: scale(1.1);
}

/* Pagination */
.pagination {
  margin-bottom: 0;
}

.pagination .page-link {
  border: none;
  color: var(--primary-color);
  padding: 0.75rem 1rem;
  margin: 0 0.25rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.pagination .page-link:hover {
  background: var(--primary-color);
  color: white;
  transform: translateY(-2px);
}

.pagination .page-item.active .page-link {
  background: var(--primary-color);
  color: white;
  box-shadow: var(--shadow-md);
}

.pagination .page-item.disabled .page-link {
  color: var(--text-muted);
  background: transparent;
}

/* Responsive */
@media (max-width: 768px) {
  .category-grid .row {
    row-gap: 0.5rem;
  }
}

@media (max-width: 576px) {
  .pagination .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>