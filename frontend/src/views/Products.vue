<template>
  <div class="products">
    <div class="container">
      <div class="row mb-4">
        <div class="col-md-6">
          <h2>Our Products</h2>
        </div>
        <div class="col-md-6 text-end">
          <select v-model="selectedCategory" class="form-select d-inline-block w-auto">
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
          </select>
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search products..." 
            class="form-control d-inline-block w-auto ms-2"
          >
        </div>
      </div>

      <div class="row" v-if="loading">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <div v-else-if="filteredProducts.length === 0" class="text-center py-5">
        <p>No products found.</p>
      </div>

      <div class="row" v-else>
        <div class="col-md-4 mb-4" v-for="product in filteredProducts" :key="product._id">
          <div class="card h-100 product-card">
            <img :src="product.image || 'https://via.placeholder.com/300x200'" class="card-img-top" :alt="product.name" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text">{{ truncateText(product.description, 100) }}</p>
              <p class="card-text fw-bold">${{ product.price }}</p>
              <p class="card-text">
                <small class="text-muted">Category: {{ product.category || 'Uncategorized' }}</small>
              </p>
              <p class="card-text">
                <small :class="{'text-success': product.stock > 0, 'text-danger': product.stock === 0}">
                  {{ product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock' }}
                </small>
              </p>
            </div>
            <div class="card-footer bg-white">
              <router-link :to="'/products/' + product._id" class="btn btn-primary me-2">View Details</router-link>
              <button 
                @click="addToCart(product)" 
                class="btn btn-outline-primary"
                :disabled="product.stock === 0"
              >
                {{ product.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
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
      searchQuery: ''
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
      
      return filtered
    }
  },
  async created() {
    try {
      const response = await this.$http.get('/api/products')
      this.products = response.data
    } catch (error) {
      console.error('Error fetching products:', error)
      this.$notify({
        type: 'error',
        title: 'Error',
        text: 'Failed to load products. Please try again later.'
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
    }
  }
}
</script>

<style scoped>
.product-card {
  transition: transform 0.2s;
}
.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}
</style>