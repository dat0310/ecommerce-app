<template>
  <div class="cart">
    <div class="container py-5">
      <h2 class="mb-4">Your Shopping Cart</h2>
      
      <div v-if="cartItems.length === 0" class="text-center py-5">
        <i class="bi bi-cart-x display-1 text-muted"></i>
        <h4 class="mt-3">Your cart is empty</h4>
        <p class="text-muted">Start shopping to add items to your cart.</p>
        <router-link to="/products" class="btn btn-primary">Continue Shopping</router-link>
      </div>
      
      <div v-else class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-body">
              <div v-for="item in cartItems" :key="item._id" class="cart-item d-flex border-bottom pb-3 mb-3">
                <div class="flex-shrink-0">
                  <img :src="item.image || 'https://via.placeholder.com/100x100'" :alt="item.name" class="rounded" width="100" height="100" style="object-fit: cover;">
                </div>
                <div class="flex-grow-1 ms-3">
                  <h5 class="card-title">{{ item.name }}</h5>
                  <p class="text-muted mb-1">${{ item.price }} each</p>
                  <div class="d-flex align-items-center">
                    <label for="quantity" class="me-2">Qty:</label>
                    <input 
                      type="number" 
                      v-model.number="item.quantity" 
                      @change="updateQuantity(item._id, item.quantity)"
                      min="1" 
                      :max="item.stock || 99" 
                      class="form-control form-control-sm me-3" 
                      style="width: 70px;"
                    >
                    <button @click="removeItem(item._id)" class="btn btn-sm btn-outline-danger">
                      <i class="bi bi-trash"></i> Remove
                    </button>
                  </div>
                </div>
                <div class="flex-shrink-0 text-end">
                  <p class="fw-bold">${{ (item.price * item.quantity).toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">Order Summary</h5>
              
              <div class="d-flex justify-content-between mb-2">
                <span>Subtotal ({{ cartItemCount }} items):</span>
                <span>${{ cartTotal.toFixed(2) }}</span>
              </div>
              
              <div class="d-flex justify-content-between mb-2">
                <span>Shipping:</span>
                <span>${{ shippingCost.toFixed(2) }}</span>
              </div>
              
              <div class="d-flex justify-content-between mb-2">
                <span>Tax:</span>
                <span>${{ taxAmount.toFixed(2) }}</span>
              </div>
              
              <hr>
              
              <div class="d-flex justify-content-between mb-3">
                <strong>Total:</strong>
                <strong>${{ totalAmount.toFixed(2) }}</strong>
              </div>
              
              <div v-if="!isAuthenticated" class="alert alert-warning">
                <small>Please <router-link to="/login">login</router-link> to proceed to checkout.</small>
              </div>
              
              <button 
                @click="proceedToCheckout" 
                class="btn btn-primary w-100"
                :disabled="!isAuthenticated"
              >
                Proceed to Checkout
              </button>
              
              <router-link to="/products" class="btn btn-outline-secondary w-100 mt-2">
                Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'Cart',
  data() {
    return {
      shippingCost: 5.99,
      taxRate: 0.08 // 8% tax
    }
  },
  computed: {
    ...mapGetters(['cartItems', 'cartItemCount', 'cartTotal', 'isAuthenticated']),
    taxAmount() {
      return this.cartTotal * this.taxRate
    },
    totalAmount() {
      return this.cartTotal + this.shippingCost + this.taxAmount
    }
  },
  methods: {
    ...mapActions(['removeFromCart', 'updateCartItemQuantity']),
    updateQuantity(productId, quantity) {
      if (quantity < 1) {
        this.removeFromCart(productId)
        this.$notify({
          type: 'info',
          title: 'Item removed',
          text: 'Item has been removed from your cart.'
        })
      } else {
        this.updateCartItemQuantity({ productId, quantity })
      }
    },
    removeItem(productId) {
      this.removeFromCart(productId)
      this.$notify({
        type: 'info',
        title: 'Item removed',
        text: 'Item has been removed from your cart.'
      })
    },
    proceedToCheckout() {
      this.$notify({
        type: 'info',
        title: 'Checkout',
        text: 'Checkout functionality will be implemented soon.'
      })
      // In a real application, you would redirect to a checkout page
      // this.$router.push('/checkout')
    }
  }
}
</script>

<style scoped>
.cart {
  min-height: 70vh;
}
.cart-item:last-child {
  border-bottom: none !important;
  margin-bottom: 0 !important;
  padding-bottom: 0 !important;
}
</style>