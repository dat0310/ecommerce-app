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
                :src="selectedImage || productImages[0]" 
                :alt="product.name" 
                class="img-fluid rounded-custom shadow-lg"
              >
            </div>
            <div v-if="productImages.length > 1" class="image-thumbnails d-flex gap-2">
              <img 
                v-for="(img, index) in productImages"
                :key="index"
                :src="img" 
                :alt="product.name + ' image ' + (index + 1)" 
                class="img-thumbnail"
                :class="{ active: selectedImage === img }"
                @click="selectedImage = img"
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
            <h1 class="display-5 fw-bold mb-1">{{ product.name }}</h1>
            <div class="mb-3">
              <small class="text-muted">Sold by: {{ shopDisplayName }}</small>
            </div>

            <!-- Rating -->
            <div class="d-flex align-items-center mb-3">
              <div class="text-warning me-2">
                <i v-for="n in 5" :key="n" :class="n <= Math.round(averageRating) ? 'bi bi-star-fill' : 'bi bi-star'" class="me-1"></i>
              </div>
              <span class="text-muted">({{ averageRating }}) • {{ totalReviews }} reviews</span>
            </div>

            <!-- Price -->
            <div class="price-section mb-4">
              <h2 class="display-4 fw-bold text-primary mb-2">{{ displayPrice }}</h2>
              <p v-if="hasVariants && !allOptionsSelected" class="text-muted small mb-1">
                <i class="bi bi-info-circle me-1"></i>Select all options to see exact price
              </p>
              <p class="text-success mb-0">
                <i class="bi bi-truck me-1"></i>
                Free shipping on orders over $50
              </p>
            </div>

            <!-- Variant Selection -->
            <div v-if="hasVariants" class="variant-selection mb-4">
              <div v-for="variant in product.variants" :key="variant.name" class="mb-3">
                <label class="form-label fw-semibold">{{ variant.name }}: <span v-if="selectedVariants[variant.name]" class="text-primary">{{ selectedVariants[variant.name] }}</span></label>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="opt in variant.options"
                    :key="opt.value"
                    type="button"
                    class="btn btn-sm variant-option-btn d-flex align-items-center gap-1"
                    :class="selectedVariants[variant.name] === opt.value ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="selectVariant(variant.name, opt.value, opt.image)"
                  >
                    <img v-if="opt.image" :src="opt.image" :alt="opt.value" class="rounded" style="width: 24px; height: 24px; object-fit: cover;">
                    {{ opt.value }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Stock Status -->
            <div class="stock-status mb-4">
              <div class="d-flex align-items-center">
                <i :class="availableStock > 0 ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                <span :class="{'text-success': availableStock > 0, 'text-danger': availableStock === 0}" class="ms-2 fw-semibold">
                  {{ availableStock > 0 ? `In stock (${availableStock} available)` : 'Out of stock' }}
                </span>
              </div>
            </div>

            <!-- Description -->
            <div class="description mb-4">
              <h5 class="fw-bold mb-3">Description</h5>
              <p class="text-muted">{{ product.description }}</p>
            </div>

            <!-- Quantity and Add to Cart -->
            <div v-if="product.stock > 0 && (!hasVariants || allOptionsSelected)" class="add-to-cart-section mb-4">
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
                  @click="handleAddToCart"
                  class="btn btn-primary btn-lg flex-md-fill hover-lift"
                  :disabled="product.stock === 0"
                >
                  <i class="bi bi-cart-plus me-2"></i>
                  {{ product.stock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                </button>
                <button
                  @click="handleBuyNow"
                  class="btn btn-success btn-lg flex-md-fill hover-lift"
                  :disabled="product.stock === 0"
                >
                  Buy
                </button>
                <button @click="handleAddToWishlist" class="btn btn-outline-primary btn-lg flex-md-fill hover-lift">
                  <i :class="isWishlisted ? 'bi bi-heart-fill me-2 text-danger' : 'bi bi-heart me-2'"></i>
                  {{ isWishlisted ? 'Wishlisted' : 'Add to Wishlist' }}
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

      <!-- Reviews Section -->
      <div class="row mt-5">
        <div class="col-12">
          <div class="card" data-aos="fade-up">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h5 class="mb-0"><i class="bi bi-chat-left-text me-2"></i>Customer Reviews ({{ totalReviews }})</h5>
              <div class="d-flex align-items-center">
                <div class="text-warning me-2">
                  <i v-for="n in 5" :key="'avg-'+n" :class="n <= Math.round(averageRating) ? 'bi bi-star-fill' : 'bi bi-star'" class="me-1"></i>
                </div>
                <span class="fw-bold">{{ averageRating }} / 5</span>
              </div>
            </div>
            <div class="card-body">
              <!-- User's Reviews Section -->
              <div v-if="isAuthenticated" class="mb-4 p-3 bg-light rounded">
                <div v-if="myExistingReviews.length > 0">
                  <h6 class="fw-bold mb-3"><i class="bi bi-check-circle-fill text-success me-2"></i>Your Reviews ({{ myExistingReviews.length }})</h6>
                  <div v-for="myReview in myExistingReviews" :key="myReview._id" class="border-bottom pb-2 mb-2">
                    <div class="d-flex align-items-center mb-1">
                      <div class="text-warning me-2">
                        <i v-for="n in 5" :key="'my-'+myReview._id+'-'+n" :class="n <= myReview.rating ? 'bi bi-star-fill' : 'bi bi-star'" class="me-1"></i>
                      </div>
                      <small class="text-muted">{{ formatDate(myReview.createdAt) }}</small>
                    </div>
                    <p class="text-muted mb-0 small">{{ myReview.comment || 'No comment provided.' }}</p>
                  </div>
                  <p class="text-muted small mb-0 mt-2"><i class="bi bi-info-circle me-1"></i>You can review each delivered order from your <router-link to="/profile">Profile → My Purchase</router-link> page.</p>
                </div>
                <div v-else class="text-center">
                  <p class="text-muted mb-2">Purchased this product? Leave a review from your orders!</p>
                  <router-link to="/profile" class="btn btn-outline-primary btn-sm"><i class="bi bi-bag-check me-1"></i>Go to My Purchase</router-link>
                </div>
              </div>
              <div v-else class="mb-4 p-3 bg-light rounded text-center">
                <p class="text-muted mb-2">Please log in to write a review.</p>
                <router-link to="/login" class="btn btn-outline-primary btn-sm">Log In</router-link>
              </div>

              <!-- Reviews List -->
              <div v-if="reviews.length === 0" class="text-center py-4">
                <i class="bi bi-chat-left-text fs-1 text-muted"></i>
                <p class="text-muted mt-2">No reviews yet. Be the first to review this product!</p>
              </div>
              <div v-else>
                <div v-for="review in reviews" :key="review._id" class="review-item border-bottom py-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <div class="text-warning mb-1">
                        <i v-for="n in 5" :key="'r-'+review._id+'-'+n" :class="n <= review.rating ? 'bi bi-star-fill' : 'bi bi-star'" class="me-1"></i>
                      </div>
                      <strong>{{ review.userName }}</strong>
                    </div>
                    <small class="text-muted">{{ formatDate(review.createdAt) }}</small>
                  </div>
                  <p class="text-muted mb-0">{{ review.comment || 'No comment provided.' }}</p>
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
import { mapActions, mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'ProductDetail',
  data() {
    return {
      loading: true,
      product: null,
      quantity: 1,
      isWishlisted: false,
      selectedImage: null,
      selectedVariants: {},
      // Reviews
      reviews: [],
      averageRating: 0,
      totalReviews: 0,
      Math: Math
    }
  },
  computed: {
    ...mapGetters(['isAuthenticated', 'currentUser']),
    shopDisplayName() {
      return (
        this.product?.sellerName ||
        this.product?.shopName ||
        this.product?.seller?.name ||
        this.product?.seller?.shopName ||
        'Unknown shop'
      )
    },
    productImages() {
      if (!this.product) return []
      if (this.product.images && this.product.images.length > 0) {
        return this.product.images
      }
      if (this.product.image) {
        return [this.product.image]
      }
      return ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80']
    },
    hasVariants() {
      return this.product && this.product.variants && this.product.variants.length > 0
    },
    hasCombinations() {
      return this.product && this.product.productCombinations && this.product.productCombinations.length > 0
    },
    allOptionsSelected() {
      if (!this.hasVariants) return true
      return this.product.variants.every(v => !!this.selectedVariants[v.name])
    },
    matchingCombinations() {
      if (!this.hasCombinations) return []
      return this.product.productCombinations.filter(c => {
        const opts = c.options instanceof Map ? Object.fromEntries(c.options) : (c.options || {})
        return Object.entries(this.selectedVariants).every(([k, v]) => opts[k] === v)
      })
    },
    displayPrice() {
      if (!this.product) return '$0'

      if (!this.hasCombinations) return `$${this.product.price}`

      const combos = this.matchingCombinations
      if (combos.length === 0) {
        const allPrices = this.product.productCombinations.map(c => c.price)
        const min = Math.min(...allPrices)
        const max = Math.max(...allPrices)
        return min === max ? `$${min}` : `$${min} - $${max}`
      }

      const prices = combos.map(c => c.price)
      const min = Math.min(...prices)
      const max = Math.max(...prices)
      return min === max ? `$${min}` : `$${min} - $${max}`
    },
    availableStock() {
      if (!this.product) return 0
      if (!this.hasCombinations) return this.product.stock

      if (this.allOptionsSelected && this.matchingCombinations.length > 0) {
        return this.matchingCombinations[0].stock
      }
      return this.product.stock
    },
    myExistingReviews() {
      if (!this.currentUser || !this.reviews.length) return []
      const userId = this.currentUser._id || this.currentUser.id
      return this.reviews.filter(r => r.userId === userId)
    }
  },
  async created() {
    try {
      const productId = this.$route.params.id
      const response = await this.$http.get(`/api/products/${productId}`)
      this.product = response.data
      this.syncWishlistState()
      this.initVariantSelection()
      await this.fetchReviews()
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
    selectVariant(groupName, value, optImage) {
      if (this.selectedVariants[groupName] === value) {
        const updated = { ...this.selectedVariants }
        delete updated[groupName]
        this.selectedVariants = updated
        // Find image from remaining selected options
        let fallbackImage = null
        if (this.product && this.product.variants) {
          for (const variant of this.product.variants) {
            const selectedValue = updated[variant.name]
            if (selectedValue) {
              const opt = variant.options.find(o => o.value === selectedValue)
              if (opt && opt.image) {
                fallbackImage = opt.image
                break
              }
            }
          }
        }
        this.selectedImage = fallbackImage
      } else {
        this.selectedVariants = { ...this.selectedVariants, [groupName]: value }
        if (optImage) {
          this.selectedImage = optImage
        }
      }
    },
    initVariantSelection() {
      this.selectedVariants = {}
    },
    async handleBuyNow() {
      if (!this.isAuthenticated) {
        this.$toast.error('Please log in to proceed with purchase.', { position: 'top-right', timeout: 3000 })
        this.$router.push('/login')
        return
      }
      if (!this.product) return
      if (this.hasVariants && !this.allOptionsSelected) {
        this.$toast.warning('Please select all options before buying.', { position: 'top-right', timeout: 3000 })
        return
      }
      const productToAdd = {
        ...this.product,
        price: this.hasCombinations && this.matchingCombinations.length > 0 ? this.matchingCombinations[0].price : this.product.price,
        selectedOptions: { ...this.selectedVariants }
      }
      for (let i = 0; i < this.quantity; i++) {
        await this.addToCart(productToAdd)
      }
      this.$router.push({ path: '/cart', query: { select: this.product._id } })
    },
    handleAddToCart() {
      if (!this.isAuthenticated) {
        this.$toast.error('Please log in to add items to cart.', { position: 'top-right', timeout: 3000 })
        this.$router.push('/login')
        return
      }
      if (this.hasVariants && !this.allOptionsSelected) {
        this.$toast.warning('Please select all options before adding to cart.', { position: 'top-right', timeout: 3000 })
        return
      }
      if (this.quantity < 1) {
        this.$toast.warning('Please select at least 1 item.', { position: 'top-right', timeout: 3000 })
        return
      }
      if (this.quantity > this.availableStock) {
        this.$toast.warning(`Only ${this.availableStock} items available.`, { position: 'top-right', timeout: 3000 })
        return
      }

      const productToAdd = {
        ...this.product,
        price: this.hasCombinations && this.matchingCombinations.length > 0 ? this.matchingCombinations[0].price : this.product.price,
        selectedOptions: { ...this.selectedVariants }
      }
      for (let i = 0; i < this.quantity; i++) {
        this.addToCart(productToAdd)
      }

      this.$toast.success(`${this.quantity} ${this.product.name} added to your cart.`, { position: 'top-right', timeout: 3000 })
      this.quantity = 1
    },
    handleAddToWishlist() {
      if (!this.product) return
      const key = 'wishlist'
      const stored = localStorage.getItem(key)
      let wishlist = []
      try {
        wishlist = stored ? JSON.parse(stored) : []
      } catch (_) {
        wishlist = []
      }
      const index = wishlist.findIndex(item => item._id === this.product._id)
      if (index >= 0) {
        wishlist.splice(index, 1)
        this.$toast && this.$toast.info('Removed from your wishlist.', {
          position: 'top-right',
          timeout: 2000
        })
      } else {
        const minimal = {
          _id: this.product._id,
          name: this.product.name,
          price: this.product.price,
          image: (this.product.images && this.product.images[0]) || this.product.image || '',
          sellerName: this.shopDisplayName
        }
        wishlist.push(minimal)
        this.$toast && this.$toast.success('Added to your wishlist.', {
          position: 'top-right',
          timeout: 2000
        })
      }
      localStorage.setItem(key, JSON.stringify(wishlist))
      this.syncWishlistState()
      window.dispatchEvent(new Event('wishlist-updated'))
    }
    ,
    async fetchReviews() {
      try {
        const productId = this.$route.params.id
        const response = await axios.get(`/api/products/${productId}/reviews`)
        this.reviews = response.data.reviews || []
        this.averageRating = response.data.averageRating || 0
        this.totalReviews = response.data.totalReviews || 0
      } catch (error) {
        console.error('Error fetching reviews:', error)
      }
    },
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      })
    },
    syncWishlistState() {
      if (!this.product) {
        this.isWishlisted = false
        return
      }
      try {
        const items = JSON.parse(localStorage.getItem('wishlist') || '[]')
        this.isWishlisted = items.some(i => i._id === this.product._id)
      } catch (_) {
        this.isWishlisted = false
      }
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

.variant-selection {
  padding: 1rem;
  background: rgba(99, 102, 241, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(99, 102, 241, 0.1);
}

.variant-option-btn {
  border-radius: 20px;
  padding: 0.35rem 1rem;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.variant-option-btn:not(:disabled):hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.variant-option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>