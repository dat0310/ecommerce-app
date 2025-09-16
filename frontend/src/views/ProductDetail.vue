<template>
  <div class="product-detail">
    <!-- Loading State -->
    <div v-if="loading" class="container py-5">
      <div class="text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-3 text-muted">Loading product details...</p>
      </div>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="container py-5">
      <!-- Breadcrumb -->
      <nav aria-label="breadcrumb" class="mb-4" data-aos="fade-up">
        <ol class="breadcrumb">
          <li class="breadcrumb-item">
            <router-link to="/" class="text-decoration-none">
              <i class="bi bi-house me-1"></i>Home
            </router-link>
          </li>
          <li class="breadcrumb-item">
            <router-link to="/products" class="text-decoration-none">Products</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ product.name }}</li>
        </ol>
      </nav>

      <div class="row g-5">
        <!-- Product Images -->
        <div class="col-lg-6" data-aos="fade-right">
          <div class="product-image-container">
            <div class="main-image mb-3">
              <img 
                :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'" 
                :alt="product.name" 
                class="img-fluid rounded-custom shadow-lg"
              >
            </div>
            <div class="image-thumbnails d-flex gap-2">
              <img 
                :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'" 
                :alt="product.name + ' thumbnail'" 
                class="img-thumbnail active"
              >
              <img 
                :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'" 
                :alt="product.name + ' thumbnail 2'" 
                class="img-thumbnail"
              >
              <img 
                :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'" 
                :alt="product.name + ' thumbnail 3'" 
                class="img-thumbnail"
              >
            </div>
          </div>
        </div>

        <!-- Product Info -->
        <div class="col-lg-6" data-aos="fade-left">
          <div class="product-info">
            <!-- Category Badge -->
            <div class="mb-3">
              <span class="badge bg-primary fs-6">{{ product.category || 'Uncategorized' }}</span>
            </div>

            <!-- Product Title -->
            <h1 class="display-5 fw-bold mb-3">{{ product.name }}</h1>

            <!-- Rating -->
            <div class="d-flex align-items-center mb-3">
              <div class="text-warning me-2">
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
                <i class="bi bi-star-fill"></i>
              </div>
              <span class="text-muted">(4.8) • 1,234 reviews</span>
            </div>

            <!-- Price -->
            <div class="price-section mb-4">
              <h2 class="display-4 fw-bold text-primary mb-2">${{ product.price }}</h2>
              <p class="text-success mb-0">
                <i class="bi bi-truck me-1"></i>
                Free shipping on orders over $50
              </p>
            </div>

            <!-- Stock Status -->
            <div class="stock-status mb-4">
              <div class="d-flex align-items-center">
                <i :class="product.stock > 0 ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                <span :class="{'text-success': product.stock > 0, 'text-danger': product.stock === 0}" class="ms-2 fw-semibold">
                  {{ product.stock > 0 ? `In stock (${product.stock} available)` : 'Out of stock' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="description mb-4">
              <h5 class="fw-bold mb-3">Description</h5>
              <p class="text-muted">{{ product.description }}</p>
            </div>

            <!-- Quantity and Add to Cart -->
            <div v-if="product.stock > 0" class="add-to-cart-section mb-4">
              <div class="row g-3 align-items-center">
                <div class="col-auto">
                  <label for="quantity" class="form-label fw-semibold">Quantity:</label>
                </div>
                <div class="col-auto">
                  <div class="quantity-controls d-flex align-items-center">
                    <button 
                      @click="quantity > 1 ? quantity-- : null"
                      class="btn btn-outline-secondary"
                      :disabled="quantity <= 1"
                    >
                      <i class="bi bi-dash"></i>
                    </button>
                    <input 
                      type="number" 
                      id="quantity" 
                      v-model.number="quantity" 
                      min="1" 
                      :max="product.stock" 
                      class="form-control text-center mx-2" 
                      style="width: 80px;"
                    >
                    <button 
                      @click="quantity < product.stock ? quantity++ : null"
                      class="btn btn-outline-secondary"
                      :disabled="quantity >= product.stock"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="col-auto">
                  <small class="text-muted">Max: {{ product.stock }}</small>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons mb-4">
              <div class="d-grid gap-2 d-md-flex">
                <button 
                  @click="addToCart" 
                  class="btn btn-primary btn-lg flex-md-fill hover-lift"
                  :disabled="product.stock === 0"
                >
                  <i class="bi bi-cart-plus me-2"></i>
                  {{ product.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                </button>
                <button class="btn btn-outline-primary btn-lg flex-md-fill hover-lift">
                  <i class="bi bi-heart me-2"></i>
                  Add to Wishlist
                </button>
              </div>
            </div>

            <!-- Navigation Buttons -->
            <div class="navigation-buttons">
              <div class="d-flex gap-2 flex-wrap">
                <button @click="$router.back()" class="btn btn-outline-secondary hover-lift">
                  <i class="bi bi-arrow-left me-2"></i>
                  Back to Products
                </button>
                <router-link to="/products" class="btn btn-outline-primary hover-lift">
                  <i class="bi bi-grid me-2"></i>
                  Continue Shopping
                </router-link>
              </div>
            </div>

            <!-- Product Features -->
            <div class="product-features mt-5">
              <div class="row g-3">
                <div class="col-md-6">
                  <div class="feature-item d-flex align-items-center">
                    <i class="bi bi-shield-check text-success fs-4 me-3"></i>
                    <div>
                      <h6 class="mb-0 fw-semibold">Secure Payment</h6>
                      <small class="text-muted">100% secure checkout</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="feature-item d-flex align-items-center">
                    <i class="bi bi-truck text-primary fs-4 me-3"></i>
                    <div>
                      <h6 class="mb-0 fw-semibold">Fast Delivery</h6>
                      <small class="text-muted">2-3 business days</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="feature-item d-flex align-items-center">
                    <i class="bi bi-arrow-clockwise text-info fs-4 me-3"></i>
                    <div>
                      <h6 class="mb-0 fw-semibold">Easy Returns</h6>
                      <small class="text-muted">30-day return policy</small>
                    </div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="feature-item d-flex align-items-center">
                    <i class="bi bi-headset text-warning fs-4 me-3"></i>
                    <div>
                      <h6 class="mb-0 fw-semibold">24/7 Support</h6>
                      <small class="text-muted">Always here to help</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else class="container py-5">
      <div class="text-center" data-aos="fade-up">
        <div class="error-icon mb-4">
          <i class="bi bi-exclamation-triangle"></i>
        </div>
        <h2 class="fw-bold mb-3">Product not found</h2>
        <p class="text-muted mb-4">The product you're looking for doesn't exist or has been removed.</p>
        <router-link to="/products" class="btn btn-primary btn-lg hover-lift">
          <i class="bi bi-grid me-2"></i>
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
      this.$toast.error('Failed to load product. Please try again later.', {
        position: 'top-right',
        timeout: 3000
      })
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions(['addToCart']),
    addToCart() {
      if (this.quantity < 1) {
        this.$toast.warning('Please select at least 1 item.', {
          position: 'top-right',
          timeout: 3000
        })
        return
      }
      
      if (this.quantity > this.product.stock) {
        this.$toast.warning(`Only ${this.product.stock} items available.`, {
          position: 'top-right',
          timeout: 3000
        })
        return
      }
      
      // Add the product to cart with the selected quantity
      const productToAdd = { ...this.product }
      for (let i = 0; i < this.quantity; i++) {
        this.addToCart(productToAdd)
      }
      
      this.$toast.success(`${this.quantity} ${this.product.name} added to your cart.`, {
        position: 'top-right',
        timeout: 3000
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

.product-image-container {
  position: relative;
}

.main-image img {
  width: 100%;
  height: 500px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.main-image:hover img {
  transform: scale(1.02);
}

.image-thumbnails {
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.img-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--border-color);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.img-thumbnail:hover,
.img-thumbnail.active {
  border-color: var(--primary-color);
  transform: scale(1.05);
}

.quantity-controls .btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.quantity-controls .btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
}

.quantity-controls .form-control {
  border-radius: 8px;
  border: 2px solid var(--border-color);
  font-weight: 600;
  text-align: center;
}

.quantity-controls .form-control:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.price-section h2 {
  font-size: 3rem;
  font-weight: 800;
}

.stock-status {
  padding: 1rem;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 12px;
  border-left: 4px solid var(--primary-color);
}

.feature-item {
  padding: 1rem;
  background: rgba(99, 102, 241, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-2px);
}

.error-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.error-icon i {
  font-size: 4rem;
  color: var(--danger-color);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .price-section h2 {
    font-size: 2.5rem;
  }
  
  .main-image img {
    height: 300px;
  }
  
  .img-thumbnail {
    width: 60px;
    height: 60px;
  }
  
  .action-buttons .d-grid {
    grid-template-columns: 1fr;
  }
  
  .navigation-buttons .d-flex {
    flex-direction: column;
  }
  
  .navigation-buttons .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}

@media (max-width: 576px) {
  .price-section h2 {
    font-size: 2rem;
  }
  
  .main-image img {
    height: 250px;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .feature-item {
    text-align: center;
  }
}
</style>