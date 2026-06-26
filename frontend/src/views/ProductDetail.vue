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
            <router-link to="/" class="text-decoration-none">Products</router-link>
          </li>
          <li class="breadcrumb-item active" aria-current="page">{{ product.name }}</li>
        </ol>
      </nav>

      <div class="row g-5">
        <!-- Product Images -->
        <div class="col-lg-6" data-aos="fade-right">
          <div class="product-image-container">
            <div class="main-image mb-3">
              <button 
                v-if="productImages.length > 1" 
                class="image-nav-btn prev-btn"
                @click="prevImage"
              >
                <i class="bi bi-chevron-left"></i>
              </button>
              <img 
                :src="selectedImage || productImages[0]" 
                :alt="product.name" 
                class="img-fluid rounded-custom shadow-lg"
              >
              <button 
                v-if="productImages.length > 1" 
                class="image-nav-btn next-btn"
                @click="nextImage"
              >
                <i class="bi bi-chevron-right"></i>
              </button>
              <div v-if="productImages.length > 1" class="image-counter">
                {{ currentImageIndex + 1 }} / {{ productImages.length }}
              </div>
            </div>
            <div v-if="productImages.length > 1" class="image-thumbnails d-flex gap-2">
              <img 
                v-for="(img, index) in productImages"
                :key="index"
                :src="img" 
                :alt="product.name + ' image ' + (index + 1)" 
                class="img-thumbnail"
                :class="{ active: (selectedImage || productImages[0]) === img }"
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
              <div v-for="variant in filteredVariants" :key="variant.name" class="mb-3">
                <label class="form-label fw-semibold">{{ variant.name }}: <span v-if="selectedVariants[variant.name]" class="text-primary">{{ selectedVariants[variant.name] }}</span></label>
                <div class="d-flex flex-wrap gap-2">
                  <button
                    v-for="opt in variant.options"
                    :key="opt.value"
                    type="button"
                    class="btn btn-sm variant-option-btn"
                    :class="selectedVariants[variant.name] === opt.value ? 'btn-primary' : 'btn-outline-secondary'"
                    @click="selectVariant(variant.name, opt.value, opt.image)"
                  >
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
            <div v-if="availableStock > 0 && (!hasVariants || allOptionsSelected) && !isOwnProduct" class="add-to-cart-section mb-4">
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
                      :max="availableStock" 
                      class="form-control text-center mx-2" 
                      style="width: 80px;"
                    >
                    <button 
                      @click="quantity < availableStock ? quantity++ : null"
                      class="btn btn-outline-secondary"
                      :disabled="quantity >= availableStock"
                    >
                      <i class="bi bi-plus"></i>
                    </button>
                  </div>
                </div>
                <div class="col-auto">
                  <small class="text-muted">Max: {{ availableStock }}</small>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons mb-4">
              <!-- Seller Warning -->
              <div v-if="isOwnProduct" class="alert alert-info d-flex align-items-center" role="alert">
                <i class="bi bi-info-circle me-2"></i>
                This is your own product. You cannot purchase it.
              </div>
              <div v-else class="d-grid gap-2 d-md-flex">
                <button
                  @click="handleAddToCart"
                  class="btn btn-primary btn-lg flex-md-fill hover-lift"
                  :disabled="availableStock === 0"
                >
                  <i class="bi bi-cart-plus me-2"></i>
                  {{ availableStock > 0 ? 'Add to Cart' : 'Out of Stock' }}
                </button>
                <button
                  @click="handleBuyNow"
                  class="btn btn-success btn-lg flex-md-fill hover-lift"
                  :disabled="availableStock === 0"
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
                <button
                  v-if="product.sellerId && isAuthenticated && !isOwnProduct"
                  @click="chatWithSeller"
                  class="btn btn-outline-info hover-lift"
                >
                  <i class="bi bi-chat-dots me-2"></i>
                  Chat with Seller
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
              <!-- Review Coin Reward Banner -->
              <div v-if="isAuthenticated && !isOwnProduct" class="mb-4 p-3 bg-warning bg-opacity-10 border border-warning rounded d-flex align-items-center">
                <i class="bi bi-coin text-warning fs-3 me-3"></i>
                <div>
                  <h6 class="mb-0 text-warning fw-bold"><i class="bi bi-gift me-1"></i>Earn 500 ShopHub Coins!</h6>
                  <small class="text-muted">Submit a review for this product and get rewarded with 500 coins.</small>
                </div>
              </div>

              <!-- Login prompt -->
              <div v-if="!isAuthenticated" class="mb-4 p-3 bg-light rounded text-center">
                <p class="text-muted mb-2">Please log in to write a review.</p>
                <router-link to="/login" class="btn btn-outline-primary btn-sm">Log In</router-link>
              </div>
              <div v-else-if="!isOwnProduct" class="mb-4 p-3 bg-light rounded text-center">
                <p class="text-muted mb-2">Purchased this product? Leave a review from your orders!</p>
                <router-link to="/profile" class="btn btn-outline-primary btn-sm"><i class="bi bi-bag-check me-1"></i>Go to My Purchase</router-link>
              </div>

              <!-- Reviews List (filtered: exclude current user's reviews) -->
              <div v-if="filteredReviews.length === 0" class="text-center py-4">
                <i class="bi bi-chat-left-text fs-1 text-muted"></i>
                <p class="text-muted mt-2">No reviews yet. Be the first to review this product!</p>
              </div>
              <div v-else>
                <div v-for="review in filteredReviews" :key="review._id" class="review-item border-bottom py-3">
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
        <router-link to="/" class="btn btn-primary btn-lg hover-lift">
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
    currentImageIndex() {
      const currentImg = this.selectedImage || this.productImages[0]
      const index = this.productImages.indexOf(currentImg)
      return index >= 0 ? index : 0
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
    },
    filteredReviews() {
      if (!this.currentUser || !this.reviews.length) return this.reviews
      const userId = this.currentUser._id || this.currentUser.id
      return this.reviews.filter(r => r.userId !== userId)
    },
    isOwnProduct() {
      if (!this.currentUser || !this.product.sellerId) return false
      const userId = this.currentUser._id || this.currentUser.id
      return this.product.sellerId === userId
    },
    // Filter variants to only include options that exist in productCombinations
    // AND are compatible with currently selected options
    filteredVariants() {
      if (!this.hasVariants) return []
      if (!this.hasCombinations) return this.product.variants

      // Get combinations that match currently selected options
      const getMatchingCombinations = (excludeVariant = null) => {
        return this.product.productCombinations.filter(combo => {
          const opts = combo.options instanceof Map ? Object.fromEntries(combo.options) : (combo.options || {})
          // Check if this combination matches all currently selected options (except the excluded variant)
          return Object.entries(this.selectedVariants).every(([key, value]) => {
            if (key === excludeVariant) return true // Skip the variant we're filtering for
            if (!value) return true // Skip unselected variants
            return opts[key] === value
          })
        })
      }

      // Filter variants and their options based on available combinations
      return this.product.variants.map(variant => {
        // Get combinations that match all OTHER selected options
        const matchingCombos = getMatchingCombinations(variant.name)
        
        // Extract valid values for this variant from matching combinations
        const validValues = new Set()
        matchingCombos.forEach(combo => {
          const opts = combo.options instanceof Map ? Object.fromEntries(combo.options) : (combo.options || {})
          if (opts[variant.name]) {
            validValues.add(opts[variant.name])
          }
        })

        return {
          ...variant,
          options: variant.options.filter(opt => validValues.has(opt.value))
        }
      }).filter(variant => variant.options.length > 0)
    },
    chatProductContext() {
      if (!this.product) return null
      return {
        productId: this.product._id,
        name: this.product.name,
        image: (this.product.images && this.product.images[0]) || this.product.image || '',
        price: this.product.price
      }
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
    prevImage() {
      const newIndex = this.currentImageIndex > 0 
        ? this.currentImageIndex - 1 
        : this.productImages.length - 1
      this.selectedImage = this.productImages[newIndex]
    },
    nextImage() {
      const newIndex = this.currentImageIndex < this.productImages.length - 1 
        ? this.currentImageIndex + 1 
        : 0
      this.selectedImage = this.productImages[newIndex]
    },
    chatWithSeller() {
      window.dispatchEvent(new CustomEvent('open-seller-chat', {
        detail: {
          sellerId: this.product.sellerId,
          sellerName: this.shopDisplayName,
          productContext: this.chatProductContext
        }
      }))
    },
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
        // Clear any selections that are no longer valid after this change
        this.$nextTick(() => {
          this.clearInvalidSelections()
        })
      }
    },
    clearInvalidSelections() {
      if (!this.hasCombinations) return
      
      let changed = false
      const updated = { ...this.selectedVariants }
      
      // For each selected variant, check if it's still valid
      for (const [variantName, selectedValue] of Object.entries(updated)) {
        if (!selectedValue) continue
        
        // Find valid values for this variant given other selections
        const validValues = new Set()
        this.product.productCombinations.forEach(combo => {
          const opts = combo.options instanceof Map ? Object.fromEntries(combo.options) : (combo.options || {})
          // Check if this combination matches all OTHER selected options
          const matchesOthers = Object.entries(updated).every(([key, value]) => {
            if (key === variantName) return true
            if (!value) return true
            return opts[key] === value
          })
          if (matchesOthers && opts[variantName]) {
            validValues.add(opts[variantName])
          }
        })
        
        // If current selection is not in valid values, clear it
        if (!validValues.has(selectedValue)) {
          delete updated[variantName]
          changed = true
        }
      }
      
      if (changed) {
        this.selectedVariants = updated
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
        this.$toast.warning('Please select all options before buying.', { position: 'top-right', timeout: 5000, closeOnClick: false })
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
        this.$toast.warning('Please select all options before adding to cart.', { position: 'top-right', timeout: 5000, closeOnClick: false })
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
/* ===== Product Detail Page - Premium Design System ===== */
.product-detail {
  min-height: 60vh;
}

/* Breadcrumb */
.breadcrumb {
  background: transparent;
  padding: 0;
  margin-bottom: 1.5rem;
}

.breadcrumb-item a {
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-fast);
}

.breadcrumb-item a:hover {
  color: var(--primary);
}

.breadcrumb-item.active {
  color: var(--text-primary);
  font-weight: 600;
}

.breadcrumb-item + .breadcrumb-item::before {
  color: var(--text-muted);
}

/* Product Images */
.product-image-container {
  position: relative;
}

.main-image {
  position: relative;
  border-radius: var(--radius-2xl);
  overflow: hidden;
  background: var(--surface);
  box-shadow: var(--shadow-lg);
}

.main-image img {
  width: 100%;
  height: 500px;
  object-fit: contain;
  background: #ffffff;
  transition: var(--transition-smooth);
}

.main-image:hover img {
  transform: scale(1.02);
}

.image-nav-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  font-size: 1.25rem;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.image-nav-btn:hover {
  background: #fff;
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-nav-btn.prev-btn {
  left: 12px;
}

.image-nav-btn.next-btn {
  right: 12px;
}

.image-counter {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.rounded-custom {
  border-radius: var(--radius-2xl) !important;
}

.image-thumbnails {
  overflow-x: auto;
  padding: 0.75rem 0;
  gap: 0.75rem !important;
}

.img-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  border: 3px solid var(--border);
  cursor: pointer;
  transition: var(--transition-fast);
  flex-shrink: 0;
  padding: 0;
}

.img-thumbnail:hover {
  border-color: var(--primary-light);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.img-thumbnail.active {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.15);
}

/* Product Info */
.product-info .badge.bg-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
  font-weight: 500;
  font-size: 0.8rem;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-md);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.product-info h1 {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

/* Rating */
.text-warning i {
  color: #FBBF24 !important;
}

/* Price Section */
.price-section h2 {
  font-family: var(--font-heading);
  font-size: 3rem;
  font-weight: 800;
  color: var(--primary) !important;
  line-height: 1;
}

.text-success {
  color: var(--success) !important;
}

/* Variant Selection */
.variant-selection {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03));
  border-radius: var(--radius-xl);
  border: 1px solid rgba(99, 102, 241, 0.08);
}

.variant-selection .form-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
}

.variant-selection .text-primary {
  color: var(--primary) !important;
}

.variant-option-btn {
  border-radius: var(--radius-lg);
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  transition: var(--transition-fast);
  border: 2px solid var(--border);
}

.variant-option-btn.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.variant-option-btn.btn-outline-secondary {
  background: var(--surface);
  color: var(--text-secondary);
}

.variant-option-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.variant-option-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Quantity Controls */
.quantity-controls .btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  transition: var(--transition-fast);
}

.quantity-controls .btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-sm);
  border-color: var(--primary);
  color: var(--primary);
}

.quantity-controls .btn:disabled {
  opacity: 0.5;
}

.quantity-controls .form-control {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  font-weight: 600;
  font-family: var(--font-body);
  text-align: center;
  transition: var(--transition-fast);
}

.quantity-controls .form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

/* Stock Status */
.stock-status {
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  border-radius: var(--radius-xl);
  border-left: 4px solid var(--primary);
}

/* Action Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-family: var(--font-body);
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}

.btn-outline-primary {
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--primary);
  background: transparent;
  transition: var(--transition-fast);
}

.btn-outline-primary:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
  color: var(--primary);
  border-color: var(--primary);
}

.btn-outline-secondary {
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--surface);
  transition: var(--transition-fast);
}

.btn-outline-secondary:hover {
  border-color: var(--primary-light);
  color: var(--primary);
  transform: translateY(-2px);
}

/* Feature Items */
.feature-item {
  padding: 1.25rem;
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  transition: var(--transition-base);
}

.feature-item:hover {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.03), rgba(139, 92, 246, 0.03));
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
}

.feature-item i {
  color: var(--primary);
}

/* Cards */
.card {
  border: none;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  background: var(--surface);
}

.card-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
  padding: 1.25rem 1.5rem;
}

.card-title {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
}

.card-body {
  padding: 1.5rem;
}

/* Error State */
.error-icon {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(245, 158, 11, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.1);
}

.error-icon i {
  font-size: 4rem;
  color: var(--danger);
}

/* Loading State */
.spinner-border.text-primary {
  color: var(--primary) !important;
  width: 3rem;
  height: 3rem;
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .price-section h2 {
    font-size: 2.75rem;
  }
}

@media (max-width: 768px) {
  .price-section h2 {
    font-size: 2.25rem;
  }

  .main-image img {
    height: 350px;
  }

  .img-thumbnail {
    width: 65px;
    height: 65px;
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

  .variant-selection {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .price-section h2 {
    font-size: 2rem;
  }

  .main-image img {
    height: 280px;
  }

  .img-thumbnail {
    width: 55px;
    height: 55px;
  }

  .quantity-controls {
    justify-content: center;
  }

  .feature-item {
    text-align: center;
  }

  .stock-status {
    padding: 1rem;
  }

  .variant-option-btn {
    padding: 0.4rem 1rem;
    font-size: 0.8rem;
  }
}
</style>
