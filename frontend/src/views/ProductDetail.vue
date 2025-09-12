<template>
  <div class="product-detail">
    <div class="container py-5" v-if="loading">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>

    <div class="container py-5" v-else-if="product">
      <div class="row">
        <div class="col-md-6">
          <img :src="product.image || 'https://via.placeholder.com/500x400'" :alt="product.name" class="img-fluid rounded">
        </div>
        <div class="col-md-6">
          <nav aria-label="breadcrumb">
            <ol class="breadcrumb">
              <li class="breadcrumb-item">
                <router-link to="/products">Products</router-link>
              </li>
              <li class="breadcrumb-item active" aria-current="page">{{ product.name }}</li>
            </ol>
          </nav>
          
          <h1 class="display-5">{{ product.name }}</h1>
          <p class="text-muted">Category: {{ product.category || 'Uncategorized' }}</p>
          <p class="lead">${{ product.price }}</p>
          
          <div class="mb-4">
            <p>{{ product.description }}</p>
          </div>
          
          <div class="mb-4">
            <span :class="{'text-success': product.stock > 0, 'text-danger': product.stock === 0}">
              {{ product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock' }}
            </span>
          </div>
          
          <div class="d-flex align-items-center mb-4" v-if="product.stock > 0">
            <label for="quantity" class="me-3">Quantity:</label>
            <input 
              type="number" 
              id="quantity" 
              v-model.number="quantity" 
              min="1" 
              :max="product.stock" 
              class="form-control me-3" 
              style="width: 80px;"
            >
            <button @click="addToCart" class="btn btn-primary btn-lg">
              Add to Cart
            </button>
          </div>
          
          <div class="mt-4">
            <button @click="$router.back()" class="btn btn-outline-secondary me-2">
              ← Back to Products
            </button>
            <router-link to="/products" class="btn btn-outline-primary">
              Continue Shopping
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <div class="container py-5" v-else>
      <div class="text-center">
        <h2>Product not found</h2>
        <p>The product you're looking for doesn't exist.</p>
        <router-link to="/products" class="btn btn-primary">
          Browse Products
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ProductDetail',
  data() {
    return {
      loading: true,
      product: null,
      quantity: 1
    }
  },
  async created() {
    try {
      const productId = this.$route.params.id
      const response = await this.$http.get(`/api/products/${productId}`)
      this.product = response.data
    } catch (error) {
      console.error('Error fetching product:', error)
      this.$notify({
        type: 'error',
        title: 'Error',
        text: 'Failed to load product. Please try again later.'
      })
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    addToCart() {
      if (this.quantity < 1) {
        this.$notify({
          type: 'warning',
          title: 'Invalid Quantity',
          text: 'Please select at least 1 item.'
        })
        return
      }
      
      if (this.quantity > this.product.stock) {
        this.$notify({
          type: 'warning',
          title: 'Insufficient Stock',
          text: `Only ${this.product.stock} items available.`
        })
        return
      }
      
      // Add the product to cart with the selected quantity
      const productToAdd = { ...this.product }
      for (let i = 0; i < this.quantity; i++) {
        this.addToCart(productToAdd)
      }
      
      this.$notify({
        type: 'success',
        title: 'Added to Cart',
        text: `${this.quantity} ${this.product.name} added to your cart.`
      })
      
      this.quantity = 1
    }
  }
}
</script>

<style scoped>
.product-detail {
  min-height: 60vh;
}
</style>