<template>
  <div class="products">
    

    <!-- Hero Section -->
    <section v-if="!limit" class="products-hero bg-gradient-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-4 fw-bold mb-3" data-aos="fade-right">Our Products</h1>
            <p class="lead mb-0" data-aos="fade-right" data-aos-delay="100">
              Discover our extensive collection of high-quality products
            </p>
          </div>
          <div class="col-lg-4 text-lg-end" data-aos="fade-left">
            <div class="d-flex align-items-center justify-content-lg-end">
              <i class="bi bi-grid-3x3-gap fs-1 me-3"></i>
              <div>
                <h3 class="fw-bold mb-0">{{ filteredProducts.length }}</h3>
                <small class="opacity-75">Products Available</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Filters and Search -->
    <section v-if="!limit" class="py-4 bg-light border-bottom">
      <div class="container">
        <div class="row align-items-center">
          
          <div class="col-lg-3 ms-auto">
            <select v-model="sortBy" class="form-select" data-aos="fade-up" data-aos-delay="200">
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
            :class="viewMode === 'grid' ? 'col-lg-4 col-md-6' : 'col-12'"
            v-for="(product, index) in paginatedProducts" 
            :key="product._id"
            data-aos="fade-up"
            :data-aos-delay="100 * (index % 3)"
          >
            <!-- Grid View -->
            <div v-if="viewMode === 'grid'" class="card product-card h-100" @click="$router.push('/products/' + product._id)" style="cursor: pointer;">
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

            <!-- List View -->
            <div v-else class="card product-list-card" @click="$router.push('/products/' + product._id)" style="cursor: pointer;">
              <div class="row g-0">
                <div class="col-md-3">
                  <img 
                    :src="(product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'" 
                    class="img-fluid rounded-start" 
                    :alt="product.name"
                    style="height: 200px; object-fit: cover; width: 100%;"
                  >
                </div>
                <div class="col-md-9">
                  <div class="card-body h-100 d-flex flex-column">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                      <h5 class="card-title fw-bold mb-0">{{ product.name }}</h5>
                      <span class="badge bg-primary">{{ product.category || 'Uncategorized' }}</span>
                    </div>
                    <p class="card-text text-muted flex-grow-1">{{ product.description }}</p>
                    
                    <div class="d-flex align-items-center justify-content-between">
                      <div>
                        <span class="h4 fw-bold text-primary mb-0">{{ getDisplayPrice(product) }}</span>
                        <small class="text-muted d-block">Free shipping</small>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <small class="text-muted">Stock: {{ product.stock || 0 }}</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="!limit && totalPages > 1" class="row mt-5">
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
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'Products',
  props: {
    limit: {
      type: Number,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      products: [],
      selectedCategory: '',
      sortBy: 'name',
      viewMode: 'grid',
      currentPage: 1,
      itemsPerPage: 9,
      wishlistIds: []
    }
  },
  computed: {
    ...mapGetters(['searchQuery', 'isAuthenticated']),
    categories() {
      const categories = new Set()
      this.products.forEach(product => {
        if (product.category) {
          categories.add(product.category)
        }
      })
      return Array.from(categories).sort()
    },
    filteredProducts() {
      let filtered = this.products
      
      // Filter by category
      if (this.selectedCategory) {
        filtered = filtered.filter(product => product.category === this.selectedCategory)
      }
      
      // Filter by search query
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(product => 
          product.name.toLowerCase().includes(query)
        )
      }
      
      // Sort products
      filtered = this.sortProducts(filtered)
      
      return filtered
    },
    paginatedProducts() {
      if (this.limit) {
        return this.filteredProducts.slice(0, this.limit);
      }
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredProducts.slice(start, end);
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
      this.selectedCategory = this.$route.query.category;
    }
    if (this.$route.query.q) {
      this.searchQuery = this.$route.query.q;
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
    hasVariants(product) {
      return product && product.variants && product.variants.length > 0
    },
    handleAddToCart(product) {
      if (!product || product.stock === 0) return
      if (!this.isAuthenticated) {
        this.$toast.error('Please log in to add items to cart.', {
          position: 'top-right',
          timeout: 3000
        })
        this.$router.push('/login')
        return
      }
      if (this.hasVariants(product)) {
        this.$router.push('/products/' + product._id)
        return
      }
      this.addToCart(product)
      this.$toast && this.$toast.success('Added to cart', {
        position: 'top-right',
        timeout: 2000
      })
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
      // read current list
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
      this.searchQuery = ''
      this.sortBy = 'name'
      this.currentPage = 1
      if (this.$route.query.q || this.$route.query.category) {
        this.$router.push({ name: 'Products' });
      }
    }
  },
  watch: {
    '$route.query.category'(newCategory) {
      this.selectedCategory = newCategory || '';
    },
    '$route.query.q'(newQuery) {
      this.searchQuery = newQuery || '';
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
/* ===== Products Page - Premium Design System ===== */

/* Hero Section */
.products-hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  position: relative;
  overflow: hidden;
  padding: 4rem 0;
}

.products-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -25%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.products-hero::after {
  content: '';
  position: absolute;
  bottom: -25%;
  left: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
}

.products-hero .display-4 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.products-hero .lead {
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Filter Section */
.bg-light {
  background: var(--surface) !important;
  border-bottom: 1px solid var(--border) !important;
}

.form-select {
  background-color: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 0.75rem 2.5rem 0.75rem 1rem;
  font-family: var(--font-body);
  font-weight: 500;
  color: var(--text-primary);
  transition: var(--transition-base);
  cursor: pointer;
}

.form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

.form-select:hover {
  border-color: var(--primary-light);
}

/* Empty State */
.empty-state {
  padding: 4rem 2rem;
  text-align: center;
}

.empty-state i {
  display: block;
  font-size: 4rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state h4 {
  font-family: var(--font-heading);
  color: var(--text-primary);
  margin-bottom: 0.75rem;
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
}

/* Product Cards - Grid View */
.product-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: var(--transition-smooth);
  cursor: pointer;
  position: relative;
}

.product-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 0;
}

.product-card:hover::after {
  opacity: 0.03;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
  border-color: transparent;
}

.product-card .position-relative {
  z-index: 1;
}

.product-card .card-body {
  position: relative;
  z-index: 1;
  padding: 1.5rem;
}

.product-card .card-img-top {
  transition: var(--transition-smooth);
  aspect-ratio: 4/3;
  object-fit: cover;
}

.product-card:hover .card-img-top {
  transform: scale(1.05);
}

.product-card .card-title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.product-card .card-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Stock Badges */
.product-card .badge.bg-success {
  background: linear-gradient(135deg, var(--success), #059669) !important;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}

.product-card .badge.bg-danger {
  background: linear-gradient(135deg, var(--danger), #DC2626) !important;
  font-weight: 600;
  font-size: 0.75rem;
  padding: 0.5rem 0.875rem;
  border-radius: var(--radius-md);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.product-card .badge.bg-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
  font-weight: 500;
  font-size: 0.7rem;
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Wishlist Button */
.product-card .btn-light.rounded-circle {
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: var(--transition-fast);
}

.product-card .btn-light.rounded-circle:hover {
  transform: scale(1.1);
  background: var(--surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.product-card .btn-light.rounded-circle i {
  font-size: 1rem;
  transition: var(--transition-fast);
}

.product-card .btn-light.rounded-circle .bi-heart-fill {
  color: var(--danger);
}

/* Price Display */
.product-card .h4.text-primary {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--primary) !important;
  font-size: 1.25rem;
}

.product-card small.text-muted {
  font-size: 0.8rem;
  color: var(--text-muted) !important;
}

/* Product Cards - List View */
.product-list-card {
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  overflow: hidden;
  transition: var(--transition-smooth);
  cursor: pointer;
  margin-bottom: 1.5rem;
}

.product-list-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--primary-light);
}

.product-list-card img {
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
  transition: var(--transition-smooth);
}

.product-list-card:hover img {
  transform: scale(1.02);
}

.product-list-card .card-body {
  padding: 1.5rem;
}

.product-list-card .card-title {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
}

.product-list-card .card-text {
  color: var(--text-secondary);
  line-height: 1.7;
}

/* Pagination */
.pagination {
  gap: 0.5rem;
}

.pagination .page-item .page-link {
  border: none;
  background: var(--surface);
  color: var(--text-secondary);
  font-weight: 500;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  transition: var(--transition-fast);
  min-width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination .page-item .page-link:hover {
  background: var(--primary);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.25);
}

.pagination .page-item.active .page-link {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.pagination .page-item.disabled .page-link {
  background: var(--background);
  color: var(--text-muted);
  opacity: 0.6;
  cursor: not-allowed;
}

.pagination .page-link i {
  font-size: 0.875rem;
}

/* Loading State */
.spinner-border.text-primary {
  color: var(--primary) !important;
  width: 3rem;
  height: 3rem;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  font-family: var(--font-body);
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
  background: linear-gradient(135deg, var(--primary-dark), var(--primary));
}

/* View mode buttons */
.btn-group .btn {
  border-radius: var(--radius-md);
  padding: 0.5rem 1rem;
  transition: var(--transition-fast);
}

.btn-group .btn.active {
  background: var(--primary);
  border-color: var(--primary);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.btn-group .btn:not(.active) {
  background: var(--surface);
  border-color: var(--border);
  color: var(--text-secondary);
}

.btn-group .btn:not(.active):hover {
  background: var(--background);
  border-color: var(--primary-light);
  color: var(--primary);
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .products-hero {
    padding: 3rem 0;
    text-align: center;
  }

  .products-hero::before,
  .products-hero::after {
    display: none;
  }

  .products-hero .d-flex {
    justify-content: center !important;
    margin-top: 1.5rem;
  }
}

@media (max-width: 768px) {
  .products-hero .display-4 {
    font-size: 2rem;
  }

  .form-select {
    width: 100%;
    margin-bottom: 1rem;
  }

  .product-list-card .row {
    flex-direction: column;
  }

  .product-list-card .col-md-3,
  .product-list-card .col-md-9 {
    width: 100%;
  }

  .product-list-card img {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    height: 200px !important;
  }

  .product-card .card-body {
    padding: 1.25rem;
  }
}

@media (max-width: 576px) {
  .products-hero {
    padding: 2rem 0;
  }

  .products-hero .display-4 {
    font-size: 1.75rem;
  }

  .products-hero .lead {
    font-size: 1rem;
  }

  .product-card .card-title {
    font-size: 1rem;
  }

  .product-card .h4.text-primary {
    font-size: 1.1rem;
  }

  .pagination .page-link {
    padding: 0.5rem 0.75rem;
    min-width: 36px;
    font-size: 0.875rem;
  }

  .empty-state {
    padding: 2rem 1rem;
  }

  .empty-state i {
    font-size: 3rem;
  }
}
</style>