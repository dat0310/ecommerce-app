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
        </div>
      </div>

      <div class="row" v-if="loading">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>

      <div class="row" v-else>
        <div class="col-md-4 mb-4" v-for="product in filteredProducts" :key="product._id">
          <div class="card h-100">
            <img :src="product.image || 'https://via.placeholder.com/300x200'" class="card-img-top" :alt="product.name">
            <div class="card-body">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text">{{ product.description | truncate(100) }}</p>
              <p class="card-text fw-bold">${{ product.price }}</p>
              <p class="card-text">
                <small class="text-muted">Category: {{ product.category }}</small>
              </p>
            </div>
            <div class="card-footer bg-white">
              <router-link :to="'/products/' + product._id" class="btn btn-primary me-2">View Details</router-link>
              <button @click="addToCart(product)" class="btn btn-outline-primary">Add to Cart</button>
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
      selectedCategory: ''
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
      return Array.from(categories)
    },
    filteredProducts() {
      if (!this.selectedCategory) {
        return this.products
      }
      return this.products.filter(product => product.category === this.selectedCategory)
    }
  },
  filters: {
    truncate(text, length) {
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
    }
  },
  async created() {
    try {
      const response = await this.$http.get('/api/products')
      this.products = response.data
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['addToCart'])
  }
}
</script>