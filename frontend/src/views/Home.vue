<template>
  <div class="home">
    <div class="hero-section bg-light py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h1 class="display-4 fw-bold">Welcome to Our E-Commerce Store</h1>
            <p class="lead">Discover amazing products at great prices.</p>
            <router-link to="/products" class="btn btn-primary btn-lg">Shop Now</router-link>
          </div>
          <div class="col-md-6">
            <img src="https://via.placeholder.com/500x300" alt="Hero Image" class="img-fluid rounded">
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <h2 class="mb-4">Featured Products</h2>
      <div class="row" v-if="loading">
        <div class="col-12 text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
      <div class="row" v-else>
        <div class="col-md-4 mb-4" v-for="product in featuredProducts" :key="product._id">
          <div class="card h-100">
            <img :src="product.image || 'https://via.placeholder.com/300x200'" class="card-img-top" :alt="product.name">
            <div class="card-body">
              <h5 class="card-title">{{ product.name }}</h5>
              <p class="card-text">{{ product.description | truncate(100) }}</p>
              <p class="card-text fw-bold">${{ product.price }}</p>
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
  name: 'Home',
  data() {
    return {
      loading: true,
      products: []
    }
  },
  computed: {
    featuredProducts() {
      return this.products.slice(0, 3) // Show first 3 products as featured
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