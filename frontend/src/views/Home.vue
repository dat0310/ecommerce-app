<template>
  <div class="home">
    <!-- Modern Hero Section -->
    <section class="hero-section">
      <div class="container">
        <div class="row align-items-center min-vh-75">
          <div class="col-lg-6" data-aos="fade-right">
            <h1 class="display-3 fw-bold mb-4">
              Welcome to 
              <span class="gradient-text">ShopHub</span>
            </h1>
            <p class="lead mb-4 text-white-75">
              Discover amazing products at unbeatable prices. Experience the future of online shopping with our cutting-edge platform.
            </p>
            <div class="d-flex flex-wrap gap-3">
              <router-link to="/products" class="btn btn-primary btn-lg hover-lift">
                <i class="bi bi-bag me-2"></i>
                Shop Now
              </router-link>
              <button class="btn btn-outline-light btn-lg hover-lift">
                <i class="bi bi-play-circle me-2"></i>
                Watch Demo
              </button>
            </div>
            
            <!-- Stats -->
            <div class="row mt-5">
              <div class="col-4">
                <div class="text-center">
                  <h3 class="fw-bold text-white mb-1">10K+</h3>
                  <p class="text-white-75 mb-0">Happy Customers</p>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center">
                  <h3 class="fw-bold text-white mb-1">500+</h3>
                  <p class="text-white-75 mb-0">Products</p>
                </div>
              </div>
              <div class="col-4">
                <div class="text-center">
                  <h3 class="fw-bold text-white mb-1">99%</h3>
                  <p class="text-white-75 mb-0">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-6" data-aos="fade-left">
            <div class="hero-image-container position-relative">
              <div class="hero-image-bg"></div>
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Modern Shopping Experience" 
                class="img-fluid rounded-custom shadow-xl"
              >
              <div class="floating-card position-absolute">
                <div class="card glass">
                  <div class="card-body p-3">
                    <div class="d-flex align-items-center">
                      <div class="flex-shrink-0">
                        <i class="bi bi-star-fill text-warning fs-5"></i>
                      </div>
                      <div class="flex-grow-1 ms-2">
                        <h6 class="mb-0">5.0 Rating</h6>
                        <small class="text-muted">Based on 1000+ reviews</small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="row text-center mb-5">
          <div class="col-lg-8 mx-auto">
            <h2 class="display-5 fw-bold mb-3" data-aos="fade-up">Why Choose ShopHub?</h2>
            <p class="lead text-muted" data-aos="fade-up" data-aos-delay="100">
              We provide the best shopping experience with modern features and exceptional service.
            </p>
          </div>
        </div>
        
        <div class="row g-4">
          <div class="col-md-4" data-aos="fade-up" data-aos-delay="100">
            <div class="text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-truck fs-1 text-primary"></i>\
              </div>
              <h5 class="fw-bold mb-3">Free Shipping</h5>
              <p class="text-muted">Free shipping on orders over $50. Fast and reliable delivery to your doorstep.</p>
            </div>
          </div>
          
          <div class="col-md-4" data-aos="fade-up" data-aos-delay="200">
            <div class="text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-shield-check fs-1 text-success"></i>
              </div>
              <h5 class="fw-bold mb-3">Secure Payment</h5>
              <p class="text-muted">Your payment information is encrypted and secure. Shop with confidence.</p>
            </div>
          </div>
          
          <div class="col-md-4" data-aos="fade-up" data-aos-delay="300">
            <div class="text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-arrow-clockwise fs-1 text-info"></i>
              </div>
              <h5 class="fw-bold mb-3">Easy Returns</h5>
              <p class="text-muted">30-day return policy. Not satisfied? Return it hassle-free.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-5">
      <div class="container">
        <div class="row mb-5">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="display-5 fw-bold mb-3" data-aos="fade-up">Featured Products</h2>
            <p class="lead text-muted" data-aos="fade-up" data-aos-delay="100">
              Discover our handpicked selection of trending products
            </p>
          </div>
        </div>
        
        <div v-if="loading" class="row">
          <div class="col-12 text-center">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        
        <div v-else class="row g-4">
          <div 
            class="col-lg-4 col-md-6" 
            v-for="(product, index) in featuredProducts" 
            :key="product._id"
            data-aos="fade-up"
            :data-aos-delay="100 * (index + 1)"
          >
            <div class="card product-card h-100">
              <div class="position-relative overflow-hidden">
                <img 
                  :src="product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'" 
                  class="card-img-top" 
                  :alt="product.name"
                  style="height: 250px; object-fit: cover;"
                >
                <div class="position-absolute top-0 end-0 p-2">
                  <span class="badge bg-success">Featured</span>
                </div>
                <div class="position-absolute top-0 start-0 p-2">
                  <button class="btn btn-sm btn-light rounded-circle">
                    <i class="bi bi-heart"></i>
                  </button>
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
                  <div class="text-warning">
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <i class="bi bi-star-fill"></i>
                    <small class="text-muted ms-1">(4.8)</small>
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
                  >
                    <i class="bi bi-cart-plus me-2"></i>
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="text-center mt-5" data-aos="fade-up">
          <router-link to="/products" class="btn btn-primary btn-lg">
            View All Products
            <i class="bi bi-arrow-right ms-2"></i>
          </router-link>
        </div>
      </div>
    </section>
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
    ,
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
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
  min-height: 80vh;
}

.hero-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
  background-size: cover;
}

.min-vh-75 {
  min-height: 75vh;
}

.text-white-75 {
  color: rgba(255, 255, 255, 0.85);
}

.hero-image-container {
  position: relative;
}

.hero-image-bg {
  position: absolute;
  top: -20px;
  left: -20px;
  right: -20px;
  bottom: -20px;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
  border-radius: 30px;
  z-index: -1;
}

.floating-card {
  top: 20px;
  right: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.feature-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  transition: transform 0.3s ease;
}

.feature-icon:hover {
  transform: scale(1.1);
}

.product-card {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  overflow: hidden;
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

/* Responsive adjustments */
@media (max-width: 768px) {
  .hero-section {
    min-height: 60vh;
    text-align: center;
  }
  
  .display-3 {
    font-size: 2.5rem;
  }
  
  .floating-card {
    position: relative !important;
    top: auto !important;
    right: auto !important;
    margin-top: 1rem;
  }
  
  .hero-image-container {
    margin-top: 2rem;
  }
}

@media (max-width: 576px) {
  .display-3 {
    font-size: 2rem;
  }
  
  .btn-lg {
    width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>