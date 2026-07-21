<template>
  <div class="checkout">
    <!-- Hero Section -->
    <section class="checkout-hero bg-gradient-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-4 fw-bold mb-3" data-aos="fade-right">
              <i class="bi bi-credit-card me-3"></i>
              Checkout
            </h1>
            <p class="lead mb-0" data-aos="fade-right" data-aos-delay="100">
              Complete your purchase securely
            </p>
          </div>
          <div class="col-lg-4 text-lg-end" data-aos="fade-left">
            <div class="d-flex align-items-center justify-content-lg-end">
              <i class="bi bi-bag-check fs-1 me-3"></i>
              <div>
                <h3 class="fw-bold mb-0">{{ selectedItems.length }}</h3>
                <small class="opacity-75">Items</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Checkout Content -->
    <section class="py-5">
      <div class="container">
        <div v-if="selectedItems.length === 0" class="text-center py-5">
          <h2>No items selected for checkout</h2>
          <router-link to="/cart" class="btn btn-primary">Back to Cart</router-link>
        </div>
        <div v-else class="row g-4">
          <!-- Order Summary -->
          <div class="col-lg-8">
            <div class="card" data-aos="fade-up">
              <div class="card-header">
                <h5>Order Summary</h5>
              </div>
              <div class="card-body">
                <!-- Voucher Input -->
                <div class="mb-3">
                  <label class="form-label">Have a voucher?</label>
                  <div class="input-group">
                    <input
                      v-model="voucherCode"
                      type="text"
                      class="form-control"
                      placeholder="Enter voucher code"
                      :disabled="voucherApplied"
                    >
                    <button
                      @click="applyVoucher"
                      class="btn btn-outline-primary"
                      :disabled="!voucherCode.trim() || voucherApplied"
                    >
                      {{ voucherApplied ? 'Applied' : 'Apply' }}
                    </button>
                  </div>
                  <div v-if="voucherApplied" class="text-success small mt-1">
                    <i class="bi bi-check-circle me-1"></i>
                    Voucher "{{ appliedVoucher.code }}" applied ({{ appliedVoucher.discountType === 'percentage' ? appliedVoucher.discountValue + '%' : '$' + appliedVoucher.discountValue }} off)
                  </div>
                  <div v-if="voucherError" class="text-danger small mt-1">
                    <i class="bi bi-exclamation-triangle me-1"></i>
                    {{ voucherError }}
                  </div>
                </div>

                <!-- ShopHub Coin Discount -->
                <div class="mb-3 p-3 border rounded bg-warning bg-opacity-10">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <div class="d-flex align-items-center">
                      <i class="bi bi-coin text-warning me-2 fs-5"></i>
                      <strong>Use ShopHub Coins</strong>
                    </div>
                    <div class="form-check form-switch">
                      <input class="form-check-input" type="checkbox" v-model="useCoins" :disabled="availableCoins <= 0">
                    </div>
                  </div>
                  <div v-if="useCoins" class="mt-2">
                    <div class="d-flex align-items-center gap-2 mb-2">
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        v-model.number="coinsToUse"
                        :max="maxCoinsUsable"
                        min="0"
                        style="width: 140px;"
                        placeholder="Coins"
                      >
                      <small class="text-muted">/ {{ availableCoins }} coins available</small>
                    </div>
                    <small class="text-success d-block">
                      <i class="bi bi-check-circle me-1"></i>
                      Discount: -${{ coinDiscountAmount.toFixed(2) }} (1000 coins = $1)
                    </small>
                  </div>
                  <div v-else>
                    <small class="text-muted">You have <strong>{{ availableCoins }}</strong> coins (1000 coins = $1 discount)</small>
                  </div>
                </div>

                <div v-for="item in selectedItems" :key="item.cartItemKey || item._id" class="d-flex justify-content-between mb-2">
                  <span>{{ item.name }} (x{{ item.quantity }})</span>
                  <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
                </div>
                <div class="d-flex justify-content-between mb-2">
                  <span>Shipping</span>
                  <span>${{ shippingCost.toFixed(2) }}</span>
                </div>
                <div v-if="discountAmount > 0" class="d-flex justify-content-between mb-2 text-success">
                  <span>Voucher Discount</span>
                  <span>-${{ discountAmount.toFixed(2) }}</span>
                </div>
                <div v-if="coinDiscountAmount > 0" class="d-flex justify-content-between mb-2 text-warning">
                  <span><i class="bi bi-coin me-1"></i>Coin Discount</span>
                  <span>-${{ coinDiscountAmount.toFixed(2) }}</span>
                </div>
                <hr>
                <div class="d-flex justify-content-between fw-bold">
                  <span>Total</span>
                  <span>${{ totalAmount.toFixed(2) }}</span>
                </div>
              </div>
            </div>

            <!-- Shipping Address -->
            <div class="card mt-4" data-aos="fade-up" data-aos-delay="100">
              <div class="card-header">
                <h5>Shipping Address</h5>
              </div>
              <div class="card-body">
                <!-- No Addresses Message -->
                <div v-if="userAddresses.length === 0" class="alert alert-warning">
                  <i class="bi bi-exclamation-triangle me-2"></i>
                  No addresses available. Please add an address in your <router-link to="/profile">profile</router-link>.
                </div>
                <!-- Address Selection -->
                <div v-else class="mb-3">
                  <label class="form-label">Select Address</label>
                  <select v-model="selectedAddressId" class="form-select" required>
                    <option value="">Choose an address...</option>
                    <option v-for="address in userAddresses" :key="address._id" :value="address._id">
                      {{ address.fullName }} - {{ address.cityDistrictWard }}, {{ address.streetBuildingHouse }}
                      <span v-if="address.isDefault" class="badge bg-primary ms-1">Default</span>
                    </option>
                  </select>
                </div>

                <!-- Address Form (Read-only display) -->
                <div v-if="selectedAddressId" class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Full Name</label>
                    <input v-model="shippingAddress.fullName" type="text" class="form-control" readonly>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Phone Number</label>
                    <input v-model="shippingAddress.phoneNumber" type="text" class="form-control" readonly>
                  </div>
                  <div class="col-12">
                    <label class="form-label">City, District, Ward</label>
                    <input v-model="shippingAddress.cityDistrictWard" type="text" class="form-control" readonly>
                  </div>
                  <div class="col-12">
                    <label class="form-label">Street Name, Building, House No</label>
                    <input v-model="shippingAddress.streetBuildingHouse" type="text" class="form-control" readonly>
                  </div>
                </div>
              </div>
            </div>

            <!-- Payment Method -->
            <div class="card mt-4" data-aos="fade-up" data-aos-delay="200">
              <div class="card-header">
                <h5>Payment Method</h5>
              </div>
              <div class="card-body">
                <div class="form-check mb-3">
                  <input v-model="paymentMethod" value="cash_on_delivery" type="radio" class="form-check-input" id="cod">
                  <label class="form-check-label" for="cod">
                    Cash on Delivery
                  </label>
                </div>
                <div class="form-check">
                  <input v-model="paymentMethod" value="stripe" type="radio" class="form-check-input" id="stripe">
                  <label class="form-check-label" for="stripe">
                    Stripe
                  </label>
                </div>
                <div v-show="paymentMethod === 'stripe'" class="mt-3">
                  <!-- Stripe Card Element will be mounted here -->
                  <div id="card-element" class="p-3 border rounded"></div>
                  <div id="card-errors" role="alert" class="text-danger mt-2"></div>
                  <!-- Placeholder for Stripe Elements -->
                </div>
              </div>
            </div>
          </div>

          <!-- Place Order -->
          <div class="col-lg-4">
            <div class="card sticky-top" data-aos="fade-up" data-aos-delay="300">
              <div class="card-body">
                <h5>Total: ${{ totalAmount.toFixed(2) }}</h5>
                <button @click="placeOrder" class="btn btn-primary w-100 mt-3" :disabled="!canPlaceOrder || isPlacingOrder">
                  {{ isPlacingOrder ? 'Processing...' : 'Place Order' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, getCurrentInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'
import { useCart, useRemoveCartItem } from '../composables/useCart'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { proxy } = getCurrentInstance()

const stripePublishableKey = process.env.VUE_APP_STRIPE_PUBLISHABLE || ''
let stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null

const { cartItems } = useCart()
const removeCartItemMutation = useRemoveCartItem()

const paymentMethod = ref('cash_on_delivery')
const selectedAddressId = ref(null)
const shippingAddress = ref({
  fullName: '',
  phoneNumber: '',
  cityDistrictWard: '',
  streetBuildingHouse: '',
  isDefault: false
})
const stripe = ref(null)
const cardElement = ref(null)
const voucherCode = ref('')
const voucherApplied = ref(false)
const voucherError = ref('')
const appliedVoucher = ref(null)
const useCoins = ref(false)
const coinsToUse = ref(0)
const availableCoins = ref(0)
const isPlacingOrder = ref(false)

const currentUser = computed(() => store.getters.currentUser)
const isAuthenticated = computed(() => store.getters.isAuthenticated)

const selectedIds = computed(() => {
  const rawIds = Array.isArray(route.query.items)
    ? route.query.items.join(',')
    : route.query.items
  if (!rawIds) return []
  return rawIds
    .split(',')
    .map(id => decodeURIComponent(id))
    .filter(Boolean)
})

const selectedItems = computed(() => {
  return cartItems.value.filter(item => selectedIds.value.includes(item.cartItemKey))
})

const shippingCost = computed(() => 5.99)

const subtotal = computed(() => {
  return selectedItems.value.reduce((total, item) => total + (item.price * item.quantity), 0)
})

const discountAmount = computed(() => {
  if (!voucherApplied.value || !appliedVoucher.value) return 0
  if (appliedVoucher.value.discountType === 'percentage') {
    return subtotal.value * (appliedVoucher.value.discountValue / 100)
  } else {
    return Math.min(appliedVoucher.value.discountValue, subtotal.value)
  }
})

const totalAmount = computed(() => {
  return Math.max(0, subtotal.value + shippingCost.value - discountAmount.value - coinDiscountAmount.value)
})

const coinDiscountAmount = computed(() => {
  if (!useCoins.value || coinsToUse.value <= 0) return 0
  return Math.min(coinsToUse.value / 1000, subtotal.value + shippingCost.value - discountAmount.value)
})

const maxCoinsUsable = computed(() => {
  const maxByBalance = availableCoins.value
  const maxByTotal = Math.ceil((subtotal.value + shippingCost.value - discountAmount.value) * 1000)
  return Math.min(maxByBalance, maxByTotal)
})

const userAddresses = computed(() => {
  return currentUser.value?.addresses || []
})

const canPlaceOrder = computed(() => {
  if (paymentMethod.value === 'stripe') {
    return selectedAddressId.value && cardElement.value && isAuthenticated.value
  }
  return selectedAddressId.value && paymentMethod.value && isAuthenticated.value
})

const setupStripe = async () => {
  if (cardElement.value) return
  if (!stripePublishableKey) {
    proxy.$toast.error('Stripe publishable key is not configured. Please set VUE_APP_STRIPE_PUBLISHABLE.', { position: 'top-right' })
    return
  }
  
  try {
    stripe.value = await stripePromise
  } catch (err) {
    proxy.$toast.error('Failed to initialize Stripe. Check the publishable key.', { position: 'top-right' })
    console.error('Stripe initialization error:', err)
    return
  }

  if (!stripe.value || typeof stripe.value.elements !== 'function') {
    proxy.$toast.error('Stripe is not available. Please verify your publishable key.', { position: 'top-right' })
    return
  }

  const elements = stripe.value.elements()
  cardElement.value = elements.create('card', {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  })

  await nextTick()
  if (document.getElementById('card-element')) {
    cardElement.value.mount('#card-element')
    cardElement.value.on('change', (event) => {
      const displayError = document.getElementById('card-errors')
      if (event.error) {
        displayError.textContent = event.error.message
      } else {
        displayError.textContent = ''
      }
    })
  }
}

watch(selectedAddressId, (newVal) => {
  if (newVal) {
    const address = userAddresses.value.find(a => a._id === newVal)
    if (address) {
      shippingAddress.value = { ...address }
    }
  } else {
    shippingAddress.value = {
      fullName: '',
      phoneNumber: '',
      cityDistrictWard: '',
      streetBuildingHouse: '',
      isDefault: false
    }
  }
})

watch(paymentMethod, async (newVal) => {
  if (newVal === 'stripe' && !stripe.value) {
    await setupStripe()
  }
})

const loadCoinBalance = async () => {
  try {
    const response = await axios.get('/api/coins', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
    availableCoins.value = response.data.coins || 0
  } catch (error) {
    console.error('Failed to load coin balance:', error)
    availableCoins.value = 0
  }
}

onMounted(async () => {
  if (!isAuthenticated.value) {
    proxy.$toast.warning('Please log in to proceed with checkout.', {
      position: 'top-right',
    })
    router.push('/login?redirect=checkout')
    return
  }

  const defaultAddress = userAddresses.value.find(a => a.isDefault)
  if (defaultAddress) {
    selectedAddressId.value = defaultAddress._id
  }

  if (paymentMethod.value === 'stripe') {
    await setupStripe()
  }

  await loadCoinBalance()
})

const createOrder = async (paymentIntentId = null, coinsAlreadyDeducted = false) => {
  try {
    const orderData = {
      products: selectedItems.value.map(item => ({
        productId: item._id,
        productName: item.name,
        sellerId: item.sellerId,
        sellerName: item.sellerName || 'Unknown Shop',
        quantity: item.quantity,
        price: item.price || 0,
        image: item.image,
        selectedOptions: item.selectedOptions || {}
      })),
      totalAmount: totalAmount.value || 0,
      shippingFee: shippingCost.value || 0,
      shippingAddress: shippingAddress.value,
      paymentMethod: paymentMethod.value,
      paymentStatus: paymentMethod.value === 'cash_on_delivery' ? 'pending' : 'completed',
      paymentIntentId: paymentIntentId,
      coinsUsed: (useCoins.value ? coinsToUse.value : 0) || 0,
      coinsAlreadyDeducted: coinsAlreadyDeducted || false,
      voucher: appliedVoucher.value ? {
        code: appliedVoucher.value.code,
        discountAmount: discountAmount.value || 0
      } : null
    }

    const token = localStorage.getItem('token')
    await axios.post('/api/orders', orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    proxy.$toast.success('Order placed successfully!', { position: 'top-right', timeout: 5000, closeOnClick: false })

    await Promise.all(selectedItems.value.map(item =>
      removeCartItemMutation.mutateAsync({ productId: item._id, selectedOptions: item.selectedOptions }).catch(() => null)
    ))

    router.push('/profile')
  } catch (error) {
    if (error.response?.status !== 401) {
      proxy.$toast.error(error.response?.data?.message || 'Failed to place order', { position: 'top-right' })
    }
  }
}

const handleCashOnDelivery = async () => {
  await createOrder()
}

const applyVoucher = async () => {
  if (!voucherCode.value.trim()) return

  try {
    const token = localStorage.getItem('token')
    const response = await axios.post('/api/vouchers/apply', {
      code: voucherCode.value.trim()
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    appliedVoucher.value = response.data.voucher
    voucherApplied.value = true
    voucherError.value = ''
    proxy.$toast.success('Voucher applied successfully!', { position: 'top-right' })
  } catch (error) {
    voucherError.value = error.response?.data?.message || 'Invalid voucher code'
    voucherApplied.value = false
    appliedVoucher.value = null
  }
}

const handleStripePayment = async () => {
  if (!stripe.value || !cardElement.value) {
    proxy.$toast.error('Stripe is not ready yet.', { position: 'top-right' })
    return
  }

  const token = localStorage.getItem('token')
  
  if (!token) {
    proxy.$toast.error('Please log in to complete your purchase.', { position: 'top-right' })
    router.push('/login')
    return
  }
  
  let coinsDeducted = false
  const coinsToDeduct = useCoins.value ? coinsToUse.value : 0

  try {
    if (coinsToDeduct > 0) {
      try {
        await axios.post('/api/coins/deduct', {
          userId: currentUser.value._id || currentUser.value.id,
          amount: coinsToDeduct,
          description: 'Order discount'
        }, { headers: { Authorization: `Bearer ${token}` } })
        coinsDeducted = true
      } catch (coinError) {
        proxy.$toast.error(coinError.response?.data?.message || 'Failed to deduct coins. Please try again.', { position: 'top-right' })
        return
      }
    }

    const { data: { clientSecret } } = await axios.post('/api/payments/create-intent', {
      amount: totalAmount.value * 100
    }, { headers: { Authorization: `Bearer ${token}` } })

    const { paymentIntent, error } = await stripe.value.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement.value,
        billing_details: {
          name: shippingAddress.value.fullName,
        },
      }
    })

    if (error) {
      if (coinsDeducted) {
        try {
          await axios.post('/api/coins/refund', {
            userId: currentUser.value._id || currentUser.value.id,
            amount: coinsToDeduct,
            description: 'Stripe payment failed - coin refund'
          }, { headers: { Authorization: `Bearer ${token}` } })
        } catch (refundErr) {
          console.error('Failed to refund coins after Stripe error:', refundErr)
        }
      }
      proxy.$toast.error(error.message, { position: 'top-right' })
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      await createOrder(paymentIntent.id, coinsDeducted)
    }
  } catch (err) {
    if (coinsDeducted) {
      try {
        await axios.post('/api/coins/refund', {
          userId: currentUser.value._id || currentUser.value.id,
          amount: coinsToDeduct,
          description: 'Payment failed - coin refund'
        }, { headers: { Authorization: `Bearer ${token}` } })
      } catch (refundErr) {
        console.error('Failed to refund coins after payment error:', refundErr)
      }
    }
    proxy.$toast.error(err.response?.data?.message || 'Payment failed. Please try again.', { position: 'top-right' })
  }
}

const placeOrder = async () => {
  if (isPlacingOrder.value) return
  isPlacingOrder.value = true
  try {
    if (paymentMethod.value === 'stripe') {
      await handleStripePayment()
    } else {
      await handleCashOnDelivery()
    }
  } finally {
    isPlacingOrder.value = false
  }
}
</script>

<style scoped>
/* ===== Checkout Page - Premium Design System ===== */

/* Hero Section */
.checkout-hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  position: relative;
  overflow: hidden;
}

.checkout-hero::before {
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

.checkout-hero::after {
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

.checkout-hero .display-4 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.checkout-hero .lead {
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Cards */
.card {
  border: none;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  background: var(--surface);
  overflow: hidden;
}

.card-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
}

.card-header h5 {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Form Controls */
.form-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  transition: var(--transition-fast);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

.form-control::placeholder {
  color: var(--text-muted);
}

/* Input Group */
.input-group .form-control {
  border-radius: var(--radius-lg) 0 0 var(--radius-lg);
}

.input-group .btn {
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
}

/* Voucher/Coins Section */
.border.rounded {
  border-radius: var(--radius-lg) !important;
  border-color: var(--border) !important;
}

.bg-warning.bg-opacity-10 {
  background: rgba(245, 158, 11, 0.08) !important;
}

/* Checkbox/Switch */
.form-check-input {
  width: 1.1rem;
  height: 1.1rem;
  border-radius: var(--radius-sm);
  border: 2px solid var(--border);
  cursor: pointer;
  transition: var(--transition-fast);
}

.form-check-input:checked {
  background-color: var(--primary);
  border-color: var(--primary);
}

.form-switch .form-check-input {
  width: 2.5rem;
  height: 1.3rem;
  border-radius: 1rem;
}

/* Buttons */
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
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.btn-primary:disabled {
  opacity: 0.7;
}

.btn-outline-primary {
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  font-weight: 600;
  color: var(--primary);
  background: transparent;
  transition: var(--transition-fast);
}

.btn-outline-primary:hover {
  background: rgba(99, 102, 241, 0.1);
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
}

/* Order Summary Sidebar */
.sticky-top {
  position: sticky;
  top: 100px;
}

/* Order Items */
.order-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.order-item:last-child {
  border-bottom: none;
}

.order-item img {
  border-radius: var(--radius-md);
  object-fit: cover;
}

/* Totals */
.border-top {
  border-color: var(--border) !important;
}

.fw-bold {
  font-family: var(--font-heading);
}

.text-primary {
  color: var(--primary) !important;
}

.text-success {
  color: var(--success) !important;
}

.text-danger {
  color: var(--danger) !important;
}

/* Security Badges */
.fs-4 {
  font-size: 1.5rem !important;
}

/* Alert */
.alert {
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
}

.alert-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

/* Progress Steps (if any) */
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.step {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.875rem;
  transition: var(--transition-fast);
}

.step.active .step-number {
  background: var(--primary);
  color: white;
}

.step:not(.active) .step-number {
  background: var(--background);
  color: var(--text-muted);
}

.step-connector {
  width: 40px;
  height: 2px;
  background: var(--border);
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .checkout-hero::before,
  .checkout-hero::after {
    display: none;
  }

  .sticky-top {
    position: static;
    margin-top: 2rem;
  }
}

@media (max-width: 768px) {
  .checkout-hero {
    text-align: center;
  }

  .checkout-hero .display-4 {
    font-size: 2rem;
  }

  .checkout-hero .d-flex {
    justify-content: center !important;
    margin-top: 1.5rem;
  }

  .card-body {
    padding: 1.25rem;
  }
}

@media (max-width: 576px) {
  .checkout-hero {
    padding: 2rem 0 !important;
  }

  .checkout-hero .display-4 {
    font-size: 1.75rem;
  }

  .card-body {
    padding: 1rem;
  }

  .form-control,
  .form-select {
    padding: 0.65rem 0.875rem;
    font-size: 0.9rem;
  }
}
</style>
