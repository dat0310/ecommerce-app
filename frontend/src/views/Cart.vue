<template>
  <div class="cart">
    <!-- Hero Section -->
    <section class="cart-hero bg-gradient-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-4 fw-bold mb-3" data-aos="fade-right">
              <i class="bi bi-cart3 me-3"></i>
              Shopping Cart
            </h1>
            <p class="lead mb-0" data-aos="fade-right" data-aos-delay="100">
              Review your items and proceed to checkout
            </p>
          </div>
          <div class="col-lg-4 text-lg-end" data-aos="fade-left">
            <div class="d-flex align-items-center justify-content-lg-end">
              <i class="bi bi-bag-check fs-1 me-3"></i>
              <div>
                <h3 class="fw-bold mb-0">{{ cartItemCount }}</h3>
                <small class="opacity-75">Items in Cart</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cart Content -->
    <section class="py-5">
      <div class="container">
        <!-- Empty Cart State -->
        <div v-if="cartItems.length === 0" class="text-center py-5">
          <div class="empty-cart" data-aos="fade-up">
            <div class="empty-cart-icon mb-4">
              <i class="bi bi-cart-x"></i>
            </div>
            <h2 class="fw-bold mb-3">Your cart is empty</h2>
            <p class="text-muted mb-4">Looks like you haven't added any items to your cart yet.</p>
            <router-link to="/" class="btn btn-primary btn-lg hover-lift">
              <i class="bi bi-bag me-2"></i>
              Start Shopping
            </router-link>
          </div>
        </div>
        
        <!-- Cart with Items -->
        <div v-else class="row g-4">
          <!-- Cart Items -->
          <div class="col-lg-8">
            <div class="card cart-items-card" data-aos="fade-up">
              <div class="card-header bg-transparent border-0 p-4">
                <h5 class="card-title mb-0 d-flex align-items-center">
                  <i class="bi bi-list-ul me-2"></i>
                  Cart Items ({{ cartItemCount }})
                </h5>
              </div>
              <div class="card-body p-0">
                <div v-for="group in groupedCartItems" :key="group.sellerKey" class="seller-group">
                  <div class="seller-group-header">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="`seller-select-${group.sellerKey}`"
                      :checked="isGroupFullySelected(group)"
                      @change="toggleGroupSelection(group, $event.target.checked)"
                    />
                    <span>{{ group.sellerName }}</span>
                  </div>
                  <div v-for="(item, index) in group.items" :key="item.cartItemKey || `${item._id}-${index}`" class="cart-item">
                    <div class="cart-item-layout">
                      <!-- Checkbox -->
                      <div class="cart-item-checkbox">
                        <input class="form-check-input" type="checkbox" :value="item.cartItemKey" v-model="selectedIds" />
                      </div>
                      
                      <!-- Product Image -->
                      <div class="cart-item-image">
                        <img
                          :src="item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'"
                          :alt="item.name"
                        >
                      </div>
                      
                      <!-- Product Details -->
                      <div class="cart-item-details">
                        <h6 class="fw-bold mb-1">{{ item.name }}</h6>
                        <p class="text-muted mb-1 small">{{ item.category || 'General' }}</p>
                        <!-- Selected Options -->
                        <div v-if="item.selectedOptions && Object.keys(item.selectedOptions).length > 0" class="cart-item-options">
                          <span 
                            v-for="(value, key) in item.selectedOptions" 
                            :key="key" 
                            class="badge bg-light text-dark border"
                          >
                            {{ key }}: {{ value }}
                          </span>
                        </div>
                        <p class="text-primary fw-bold mb-0 mt-2">${{ item.price }}</p>
                      </div>
                      
                      <!-- Quantity Controls -->
                      <div class="cart-item-quantity">
                        <label class="form-label small fw-semibold">Quantity</label>
                        <div class="quantity-controls d-flex align-items-center">
                          <button 
                            @click="updateQuantity(item, item.quantity - 1)"
                            class="btn btn-outline-secondary btn-sm"
                            :disabled="item.quantity <= 1"
                          >
                            <i class="bi bi-dash"></i>
                          </button>
                          <input 
                            type="number" 
                            :value="item.quantity" 
                            @change="updateQuantity(item, parseInt($event.target.value) || 1)"
                            min="1" 
                            :max="item.stock || 99" 
                            class="form-control text-center mx-2" 
                            style="width: 60px;"
                          >
                          <button 
                            @click="updateQuantity(item, item.quantity + 1)"
                            class="btn btn-outline-secondary btn-sm"
                            :disabled="item.quantity >= (item.stock || 99)"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>
                        <small class="text-muted mt-1 d-block">Available: {{ item.stock || 99 }}</small>
                      </div>
                      
                      <!-- Price -->
                      <div class="cart-item-price">
                        <h5 class="fw-bold text-primary mb-1">${{ (item.price * item.quantity).toFixed(2) }}</h5>
                        <small class="text-muted">Total</small>
                      </div>
                      
                      <!-- Delete Button -->
                      <div class="cart-item-actions">
                        <button
                          @click="removeItem(item)"
                          class="btn btn-danger btn-sm"
                          title="Remove item"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Order Summary -->
          <div class="col-lg-4">
            <div class="card order-summary-card sticky-top" data-aos="fade-up" data-aos-delay="200">
              <div class="card-header bg-primary text-white">
                <h5 class="card-title mb-0 d-flex align-items-center">
                  <i class="bi bi-receipt me-2"></i>
                  Order Summary
                </h5>
              </div>
              <div class="card-body p-4">
                <div class="summary-item d-flex justify-content-between mb-3">
                  <span>Subtotal ({{ selectedItemCount }} items):</span>
                  <span class="fw-semibold">${{ selectedSubtotal.toFixed(2) }}</span>
                </div>
                
                <hr class="my-4">

                <div class="summary-total d-flex justify-content-between mb-4">
                  <h5 class="fw-bold mb-0">Total:</h5>
                  <h4 class="fw-bold text-primary mb-0">${{ totalAmount.toFixed(2) }}</h4>
                </div>
                
                <div v-if="!isAuthenticated" class="alert alert-warning mb-4">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  <small>Please <router-link to="/login" class="text-decoration-none">login</router-link> to proceed to checkout.</small>
                </div>
                
                <div class="d-grid gap-2">
                  <button 
                    @click="proceedToCheckout" 
                    class="btn btn-primary btn-lg hover-lift"
                    :disabled="!isAuthenticated"
                  >
                    <i class="bi bi-credit-card me-2"></i>
                    Proceed to Checkout
                  </button>
                  
                  <router-link to="/" class="btn btn-outline-primary hover-lift">
                    <i class="bi bi-arrow-left me-2"></i>
                    Continue Shopping
                  </router-link>
                </div>
                
                <!-- Security Badges -->
                <div class="mt-4 pt-3 border-top">
                  <div class="row g-2 text-center">
                    <div class="col-4">
                      <i class="bi bi-shield-check text-success fs-4"></i>
                      <small class="d-block text-muted">Secure</small>
                    </div>
                    <div class="col-4">
                      <i class="bi bi-truck text-primary fs-4"></i>
                      <small class="d-block text-muted">Fast Delivery</small>
                    </div>
                    <div class="col-4">
                      <i class="bi bi-arrow-clockwise text-info fs-4"></i>
                      <small class="d-block text-muted">Easy Returns</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Cart',
  data() {
    return {
      selectedIds: []
    }
  },
  computed: {
    shippingCost() {
      return this.selectedIds.length > 0 ? 5.99 : 0
    },
    ...mapGetters(['cartItems', 'cartItemCount', 'isAuthenticated']),
    groupedCartItems() {
      const groups = new Map()
      this.cartItems.forEach(item => {
        const sellerKey = item.sellerId || item.sellerName || 'unknown-seller'
        if (!groups.has(sellerKey)) {
          groups.set(sellerKey, {
            sellerKey,
            sellerName: this.getSellerDisplayName(item.sellerName),
            items: []
          })
        }
        groups.get(sellerKey).items.push(item)
      })
      return Array.from(groups.values())
    },
    selectedItems() {
      return this.cartItems.filter(i => this.selectedIds.includes(i.cartItemKey))
    },
    selectedItemCount() {
      return this.selectedItems.reduce((t, i) => t + i.quantity, 0)
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((t, i) => t + (i.price * i.quantity), 0)
    },
    totalAmount() {
      return this.selectedSubtotal
    }
  },
  mounted() {
    const id = this.$route.query?.select
    if (!id) return

    const matchingItem = this.cartItems.find(i => i.cartItemKey === id) || this.cartItems.find(i => i._id === id)
    if (matchingItem && !this.selectedIds.includes(matchingItem.cartItemKey)) {
      this.selectedIds.push(matchingItem.cartItemKey)
    }
  },
  methods: {
    ...mapActions(['removeFromCart', 'updateCartItemQuantity']),
    getSellerDisplayName(sellerName) {
      if (!sellerName || typeof sellerName !== 'string') {
        return 'Unknown seller'
      }
      const trimmedName = sellerName.trim()
      if (!trimmedName) {
        return 'Unknown seller'
      }
      if (!trimmedName.includes('@')) {
        return trimmedName
      }

      const localPart = trimmedName.split('@')[0] || ''
      const normalized = localPart
        .replace(/[._-]+/g, ' ')
        .replace(/\d+/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      if (!normalized) {
        return 'Unknown seller'
      }

      return normalized
        .split(' ')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    },
    getGroupItemIds(group) {
      return [...new Set(group.items.map(item => item.cartItemKey))]
    },
    isGroupFullySelected(group) {
      const ids = this.getGroupItemIds(group)
      return ids.length > 0 && ids.every(id => this.selectedIds.includes(id))
    },
    toggleGroupSelection(group, isChecked) {
      const ids = this.getGroupItemIds(group)
      if (isChecked) {
        this.selectedIds = [...new Set([...this.selectedIds, ...ids])]
      } else {
        this.selectedIds = this.selectedIds.filter(id => !ids.includes(id))
      }
    },
    updateQuantity(item, quantity) {
      if (quantity < 1) {
        this.removeFromCart(item)
        this.$toast.info('Item has been removed from your cart.', {
          position: 'top-right',
          timeout: 3000
        })
      } else {
        this.updateCartItemQuantity({ item, quantity })
      }
    },
    removeItem(item) {
      this.removeFromCart(item)
      this.$toast.info('Item has been removed from your cart.', {
        position: 'top-right',
        timeout: 3000
      })
    },
    proceedToCheckout() {
      if (this.selectedIds.length === 0) {
        this.$toast.warning('Please select items to checkout.', {
          position: 'top-right',
          timeout: 3000
        })
        return
      }
      const encodedIds = this.selectedIds.map(id => encodeURIComponent(id))
      this.$router.push({ path: '/checkout', query: { items: encodedIds.join(',') } })
    }
  }
}
</script>

<style scoped>
/* ===== Cart Page - Premium Design System ===== */

/* Hero Section */
.cart-hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  position: relative;
  overflow: hidden;
}

.cart-hero::before {
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

.cart-hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
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

.cart-hero .display-4 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.cart-hero .lead {
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Empty Cart */
.empty-cart {
  padding: 4rem 2rem;
}

.empty-cart-icon {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(99, 102, 241, 0.1);
}

.empty-cart-icon i {
  font-size: 4rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-cart h2 {
  font-family: var(--font-heading);
  color: var(--text-primary);
}

/* Cart Items Card */
.cart-items-card {
  border: none;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  background: var(--surface);
}

.cart-items-card .card-header {
  padding: 1.5rem;
  background: var(--surface) !important;
  border-bottom: 1px solid var(--border);
}

.cart-items-card .card-title {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
}

.seller-group-header {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  background: rgba(99, 102, 241, 0.04);
  color: var(--text-primary);
  font-weight: 600;
}

.seller-group-header .form-check-input {
  margin: 0;
}

.seller-group:not(:last-child) {
  border-bottom: 1px solid var(--border);
}

/* Cart Items */
.cart-item {
  border-bottom: 1px solid var(--border);
  transition: var(--transition-base);
  position: relative;
}

.seller-group .cart-item:last-child {
  border-bottom: none !important;
}

.cart-item:hover {
  background: rgba(99, 102, 241, 0.02);
}

.cart-item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-item-checkbox .form-check-input {
  width: 1.25rem;
  height: 1.25rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: var(--transition-fast);
}

.cart-item-checkbox .form-check-input:checked {
  background-color: var(--primary);
  border-color: var(--primary);
}

/* Grid layout for cart items - ensures column alignment */
.cart-item-layout {
  display: grid !important;
  grid-template-columns: 40px 100px minmax(150px, 300px) 180px 100px 50px !important;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
}

.cart-item-layout .cart-item-checkbox {
  padding: 0;
  justify-self: center;
}

.cart-item-image {
  width: 100px;
  justify-self: center;
}

.cart-item-image img {
  width: 100px;
  height: auto;
  max-height: 120px;
  object-fit: contain;
  border-radius: var(--radius-lg);
  transition: var(--transition-smooth);
  background: #f8f9fa;
}

.cart-item:hover .cart-item-image img {
  transform: scale(1.05);
}

.cart-item-details {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.cart-item-details h6 {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 1rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cart-item-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-bottom: 0.5rem;
}

.cart-item-options .badge {
  font-size: 0.7rem;
  padding: 0.35rem 0.6rem;
  border-radius: var(--radius-sm);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cart-item-details .text-primary {
  color: var(--primary) !important;
  font-family: var(--font-heading);
}

.cart-item-quantity {
  text-align: center;
  justify-self: center;
}

.cart-item-price {
  text-align: right;
  justify-self: end;
}

.cart-item-actions {
  text-align: center;
  justify-self: center;
}

/* Quantity Controls */
.quantity-controls .btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
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
  cursor: not-allowed;
}

.quantity-controls .form-control {
  border-radius: var(--radius-md);
  border: 2px solid var(--border);
  font-weight: 600;
  text-align: center;
  font-family: var(--font-body);
  transition: var(--transition-fast);
}

.quantity-controls .form-control:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

/* Cart Item Price */
.cart-item-price h5 {
  font-family: var(--font-heading);
  color: var(--primary) !important;
}

/* Remove Button */
.cart-item-actions .btn-danger {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: var(--danger);
  border-radius: var(--radius-md);
  padding: 0.5rem 0.75rem;
  transition: var(--transition-fast);
}

.cart-item-actions .btn-danger:hover {
  background: var(--danger);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.25);
}

/* Order Summary */
.order-summary-card {
  border: none;
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  background: var(--surface);
}

.order-summary-card .card-header {
  border-radius: var(--radius-2xl) var(--radius-2xl) 0 0;
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
  border: none;
  padding: 1.25rem 1.5rem;
}

.order-summary-card .card-title {
  font-family: var(--font-heading);
  font-weight: 600;
}

.summary-item {
  font-size: 0.95rem;
  color: var(--text-secondary);
  font-family: var(--font-body);
}

.summary-item .fw-semibold {
  color: var(--text-primary);
}

.summary-total {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05));
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  margin: 0 -0.5rem;
}

.summary-total h5 {
  font-family: var(--font-heading);
  color: var(--text-primary);
}

.summary-total h4 {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  color: var(--primary) !important;
}

/* Alerts */
.alert {
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.alert-warning a {
  color: var(--primary);
  font-weight: 600;
}

/* Buttons */
.btn-primary.btn-lg {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 1.5rem;
  font-weight: 600;
  font-family: var(--font-body);
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary.btn-lg:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}

.btn-outline-primary {
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  padding: 0.75rem 1.5rem;
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

/* Security Badges */
.border-top {
  border-color: var(--border) !important;
}

.fs-4 {
  font-size: 1.5rem !important;
}

.text-success {
  color: var(--success) !important;
}

.text-info {
  color: #0EA5E9 !important;
}

/* Sticky */
.sticky-top {
  position: sticky;
  top: 100px;
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .cart-hero::before,
  .cart-hero::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .cart-hero {
    text-align: center;
  }

  .cart-hero .display-4 {
    font-size: 2rem;
  }

  .cart-hero .d-flex {
    justify-content: center !important;
    margin-top: 1.5rem;
  }

  .cart-item-layout {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .cart-item-layout .cart-item-checkbox {
    order: 1;
    width: auto;
  }

  .cart-item-image {
    order: 2;
    width: 80px;
  }

  .cart-item-image img {
    width: 80px;
    max-height: 100px;
  }

  .cart-item-details {
    order: 3;
    flex: 1;
    min-width: 150px;
  }

  .cart-item-quantity {
    order: 4;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding-top: 0.5rem;
    border-top: 1px solid #eee;
  }

  .cart-item-quantity label {
    margin-bottom: 0;
  }

  .cart-item-price {
    order: 5;
    text-align: left;
  }

  .cart-item-actions {
    order: 6;
    margin-left: auto;
  }

  .order-summary-card {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 576px) {
  .cart-hero {
    padding: 2rem 0 !important;
  }

  .cart-hero .display-4 {
    font-size: 1.75rem;
  }

  .empty-cart {
    padding: 2rem 1rem;
  }

  .empty-cart-icon {
    width: 100px;
    height: 100px;
  }

  .empty-cart-icon i {
    font-size: 2.5rem;
  }

  .cart-item-details,
  .cart-item-quantity,
  .cart-item-price,
  .cart-item-actions {
    padding: 0.75rem !important;
  }

  .summary-total h4 {
    font-size: 1.5rem;
  }
}
</style>
