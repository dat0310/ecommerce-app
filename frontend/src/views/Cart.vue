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
            <router-link to="/products" class="btn btn-primary btn-lg hover-lift">
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
                <div v-for="(item, index) in cartItems" :key="item._id" class="cart-item">
                  <div class="row g-0 align-items-center">
                    <div class="col-md-1">
                      <div class="cart-item-checkbox p-3">
                        <input class="form-check-input" type="checkbox" :value="item._id" v-model="selectedIds" :id="`select-${item._id}`" />
                      </div>
                    </div>
                    <div class="col-md-2">
                      <div class="cart-item-image">
                        <img
                          :src="item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'"
                          :alt="item.name"
                          class="img-fluid rounded"
                        >
                      </div>
                    </div>
                    
                    <div class="col-md-3">
                      <div class="cart-item-details p-3">
                        <h6 class="fw-bold mb-1">{{ item.name }}</h6>
                        <p class="text-muted mb-1 small">{{ item.category || 'Uncategorized' }}</p>
                        <div class="text-warning mb-2">
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <i class="bi bi-star-fill"></i>
                          <small class="text-muted ms-1">(4.8)</small>
                        </div>
                        <p class="text-primary fw-bold mb-0">${{ item.price }}</p>
                      </div>
                    </div>
                    
                    <div class="col-md-3">
                      <div class="cart-item-quantity p-3">
                        <label class="form-label small fw-semibold">Quantity</label>
                        <div class="quantity-controls d-flex align-items-center">
                          <button 
                            @click="updateQuantity(item._id, item.quantity - 1)"
                            class="btn btn-outline-secondary btn-sm"
                            :disabled="item.quantity <= 1"
                          >
                            <i class="bi bi-dash"></i>
                          </button>
                          <input 
                            type="number" 
                            v-model.number="item.quantity" 
                            @change="updateQuantity(item._id, item.quantity)"
                            min="1" 
                            :max="item.stock || 99" 
                            class="form-control text-center mx-2" 
                            style="width: 80px;"
                          >
                          <button 
                            @click="updateQuantity(item._id, item.quantity + 1)"
                            class="btn btn-outline-secondary btn-sm"
                            :disabled="item.quantity >= (item.stock || 99)"
                          >
                            <i class="bi bi-plus"></i>
                          </button>
                        </div>
                        <small class="text-muted">Max: {{ item.stock || 99 }}</small>
                      </div>
                    </div>
                    
                    <div class="col-md-2">
                      <div class="cart-item-price p-3 text-end">
                        <h5 class="fw-bold text-primary mb-1">${{ (item.price * item.quantity).toFixed(2) }}</h5>
                        <small class="text-muted">Total</small>
                      </div>
                    </div>
                    
                    <div class="col-md-1">
                      <div class="cart-item-actions p-3 text-end">
                        <button
                          @click="removeItem(item._id)"
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
                
                <div class="summary-item d-flex justify-content-between mb-3">
                  <span>Shipping:</span>
                  <span class="fw-semibold text-success">${{ shippingCost.toFixed(2) }}</span>
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
                  
                  <router-link to="/products" class="btn btn-outline-primary hover-lift">
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
    selectedItems() {
      return this.cartItems.filter(i => this.selectedIds.includes(i._id))
    },
    selectedItemCount() {
      return this.selectedItems.reduce((t, i) => t + i.quantity, 0)
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((t, i) => t + (i.price * i.quantity), 0)
    },
    totalAmount() {
      return this.selectedSubtotal + this.shippingCost
    }
  },
  mounted() {
    const id = this.$route.query?.select
    if (id && this.cartItems.some(i => i._id === id)) {
      if (!this.selectedIds.includes(id)) this.selectedIds.push(id)
    }
  },
  methods: {
    ...mapActions(['removeFromCart', 'updateCartItemQuantity']),
    updateQuantity(productId, quantity) {
      if (quantity < 1) {
        this.removeFromCart(productId)
        this.$toast.info('Item has been removed from your cart.', {
          position: 'top-right',
          timeout: 3000
        })
      } else {
        this.updateCartItemQuantity({ productId, quantity })
      }
    },
    removeItem(productId) {
      this.removeFromCart(productId)
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
      this.$router.push({ path: '/checkout', query: { items: this.selectedIds.join(',') } })
    }
  }
}
</script>

<style scoped>
.cart-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.cart-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
  background-size: cover;
}

.empty-cart {
  padding: 4rem 2rem;
}

.empty-cart-icon {
  width: 120px;
  height: 120px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.empty-cart-icon i {
  font-size: 4rem;
  color: var(--text-muted);
}

.cart-items-card {
  border: none;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.cart-item {
  border-bottom: 1px solid var(--border-color);
  transition: all 0.3s ease;
  position: relative;
}

.cart-item:last-child {
  border-bottom: none !important;
}

.cart-item:hover {
  background: rgba(99, 102, 241, 0.02);
}

.cart-item-image {
  padding: 1rem;
}

.cart-item-image img {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.cart-item:hover .cart-item-image img {
  transform: scale(1.05);
}

.cart-item-details h6 {
  color: var(--text-primary);
  font-size: 1.1rem;
}

.quantity-controls .btn {
  width: 36px;
  height: 36px;
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

.order-summary-card {
  border: none;
  border-radius: 20px;
  box-shadow: var(--shadow-lg);
  position: sticky;
  top: 100px;
}

.order-summary-card .card-header {
  border-radius: 20px 20px 0 0;
  background: var(--gradient-primary) !important;
  border: none;
}

.summary-item {
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.summary-total {
  background: rgba(99, 102, 241, 0.05);
  padding: 1rem;
  border-radius: 12px;
  margin: 0 -0.5rem;
}

.summary-total h4 {
  font-size: 1.5rem;
}

.alert {
  border: none;
  border-radius: 12px;
  padding: 1rem;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

.sticky-top {
  position: sticky;
  top: 100px;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .cart-hero {
    text-align: center;
  }
  
  .cart-hero .display-4 {
    font-size: 2rem;
  }
  
  .cart-item .row {
    flex-direction: column;
  }
  
  .cart-item .col-md-2,
  .cart-item .col-md-4,
  .cart-item .col-md-3,
  .cart-item .col-md-1 {
    width: 100%;
  }
  
  .cart-item-image {
    text-align: center;
  }
  
  .cart-item-image img {
    width: 150px;
    height: 150px;
  }
  
  .cart-item-details,
  .cart-item-quantity,
  .cart-item-price,
  .cart-item-actions {
    text-align: center;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .order-summary-card {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 576px) {
  .cart-hero .display-4 {
    font-size: 1.75rem;
  }
  
  .empty-cart {
    padding: 2rem 1rem;
  }
  
  .empty-cart-icon {
    width: 80px;
    height: 80px;
  }
  
  .empty-cart-icon i {
    font-size: 2.5rem;
  }
  
  .cart-item-details,
  .cart-item-quantity,
  .cart-item-price,
  .cart-item-actions {
    padding: 1rem !important;
  }
}
</style>