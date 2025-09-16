<template>
  <div class="products">
    <!-- Hero Section -->
    <section class="products-hero bg-gradient-primary text-white py-5">
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
    <section class="py-4 bg-light border-bottom">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-4 mb-3 mb-lg-0">
            <div class="search-box position-relative">
              <i class="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
              <input 
                type="text" 
                v-model="searchQuery" 
                placeholder="Search products..." 
                class="form-control ps-5"
                data-aos="fade-up"
              >
            </div>
          </div>
          
          <div class="col-lg-3 mb-3 mb-lg-0">
            <select v-model="selectedCategory" class="form-select" data-aos="fade-up" data-aos-delay="100">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">
                {{ category }}
              </option>
            </select>
          </div>
          
          <div class="col-lg-3 mb-3 mb-lg-0">
            <select v-model="sortBy" class="form-select" data-aos="fade-up" data-aos-delay="200">
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
          
          <div class="col-lg-2 text-lg-end">
            <div class="btn-group" role="group" data-aos="fade-up" data-aos-delay="300">
              <button 
                type="button" 
                class="btn btn-outline-primary"
                :class="{ 'active': viewMode === 'grid' }"
                @click="viewMode = 'grid'"
              >
                <i class="bi bi-grid-3x3-gap"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-outline-primary"
                :class="{ 'active': viewMode === 'list' }"
                @click="viewMode = 'list'"
              >
                <i class="bi bi-list"></i>
              </button>
            </div>
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
            <div v-if="viewMode === 'grid'" class="card product-card h-100">
              <div class="position-relative overflow-hidden">
                <img 
                  :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'" 
                  class="card-img-top" 
                  :alt="product.name" 
                  style="height: 250px; object-fit: cover;"
                >
                <div class="position-absolute top-0 end-0 p-2">
                  <span v-if="product.stock > 0" class="badge bg-success">In Stock</span>
                  <span v-else class="badge bg-danger">Out of Stock</span>
                </div>
                <div class="position-absolute top-0 start-0 p-2">
                  <button class="btn btn-sm btn-light rounded-circle">
                    <i class="bi bi-heart"></i>
                  </button>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 p-3">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="badge bg-primary">{{ product.category || 'Uncategorized' }}</span>
                    <div class="text-warning">
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                      <i class="bi bi-star-fill"></i>
                    </div>
                  </div>
                </div>
              </div>
              
              <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">{{ product.name }}</h5>
                <p class="card-text text-muted flex-grow-1">{{ truncateText(product.description, 100) }}</p>
                
                <div class="d-flex align-items-center justify-content-between mb-3">
                  <div>
                    <span class="h4 fw-bold text-primary mb-0">${{ product.price }}</span>
                    <small class="text-muted d-block">Free shipping</small>
                  </div>
                  <div class="text-end">
                    <small class="text-muted d-block">Stock: {{ product.stock || 0 }}</small>
                  </div>
                </div>
              </div>
              
              <div class="card-footer bg-transparent border-0 p-3">
                <div class="d-grid gap-2">
                  <router-link 
                    :to="'/products/' + product._id" 
                    class="btn btn-primary hover-lift"
                  >
                    <i class="bi bi-eye me-2"></i>
                    View Details
                  </router-link>
                  <button 
                    @click="addToCart(product)" 
                    class="btn btn-outline-primary hover-lift"
                    :disabled="product.stock === 0"
                  >
                    <i class="bi bi-cart-plus me-2"></i>
                    {{ product.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                  </button>
                </div>
              </div>
            </div>

            <!-- List View -->
            <div v-else class="card product-list-card">
              <div class="row g-0">
                <div class="col-md-3">
                  <img 
                    :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'" 
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
                        <span class="h4 fw-bold text-primary mb-0">${{ product.price }}</span>
                        <small class="text-muted d-block">Free shipping</small>
                      </div>
                      <div class="d-flex align-items-center gap-3">
                        <div class="text-warning">
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <small class="text-muted ms-1">(4.8)</small>
                        </div>
                        <div class="d-flex gap-2">
                          <router-link 
                            :to="'/products/' + product._id" 
                            class="btn btn-primary btn-sm"
                          >
                            <i class="bi bi-eye me-1"></i>
                            View
                          </router-link>
                          <button 
                            @click="addToCart(product)" 
                            class="btn btn-outline-primary btn-sm"
                            :disabled="product.stock === 0"
                          >
                            <i class="bi bi-cart-plus me-1"></i>
                            Add
                          </button>
                        </div>
                      </div>
                    </div>
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
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Products',
  data() {
    return {
      loading: true,
      products: [],
      selectedCategory: '',
      searchQuery: '',
      sortBy: 'name',
      viewMode: 'grid',
      currentPage: 1,
      itemsPerPage: 9
    }
  },
  computed: {
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
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query) ||
          (product.category && product.category.toLowerCase().includes(query))
        )
      }
      
      // Sort products
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
    try {
      const response = await this.$http.get('/api/products')
      this.products = response.data
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
    ...mapActions(['addToCart']),
    truncateText(text, length) {
      if (!text) return ''
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
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
    }
  },
  watch: {
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
.products-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.products-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
  background-size: cover;
}

.search-box {
  position: relative;
}

.search-box .form-control {
  padding-left: 3rem;
  border-radius: 50px;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.search-box .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.btn-group .btn {
  border-radius: 8px;
  margin-right: 0.25rem;
}

.btn-group .btn.active {
  background: var(--primary-color);
  border-color: var(--primary-color);
  color: white;
}

.empty-state {
  padding: 3rem 1rem;
}

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
}

.product-card:hover::before {
  opacity: 0.05;
}

.product-card:hover {
  transform: translateY(-12px) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.product-card .card-img-top {
  transition: transform 0.4s ease;
}

.product-card:hover .card-img-top {
  transform: scale(1.1);
}

.product-list-card {
  transition: all 0.3s ease;
  border: none;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1rem;
}

.product-list-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

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

/* Responsive adjustments */
@media (max-width: 768px) {
  .products-hero {
    text-align: center;
  }
  
  .products-hero .display-4 {
    font-size: 2rem;
  }
  
  .search-box,
  .form-select {
    margin-bottom: 1rem;
  }
  
  .btn-group {
    width: 100%;
  }
  
  .btn-group .btn {
    flex: 1;
  }
  
  .product-list-card .row {
    flex-direction: column;
  }
  
  .product-list-card .col-md-3 {
    width: 100%;
  }
  
  .product-list-card .col-md-9 {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .products-hero .display-4 {
    font-size: 1.75rem;
  }
  
  .pagination .page-link {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>