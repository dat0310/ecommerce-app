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

                <div v-for="item in selectedItems" :key="item._id" class="d-flex justify-content-between mb-2">
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
                <div v-if="paymentMethod === 'stripe'" class="mt-3">
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
                <button @click="placeOrder" class="btn btn-primary w-100 mt-3" :disabled="!canPlaceOrder">
                  Place Order
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import { loadStripe } from '@stripe/stripe-js'

const stripePublishableKey = process.env.VUE_APP_STRIPE_PUBLISHABLE || '';
// If no publishable key is provided, keep stripePromise as null so callers can detect missing configuration.
let stripePromise = null;

export default {
  name: 'Checkout',
  data() {
    return {
      paymentMethod: 'cash_on_delivery',
      selectedAddressId: null,
      shippingAddress: {
        fullName: '',
        phoneNumber: '',
        cityDistrictWard: '',
        streetBuildingHouse: '',
        isDefault: false
      },
      stripe: null,
      cardElement: null,
      voucherCode: '',
      voucherApplied: false,
      voucherError: '',
      appliedVoucher: null,
      // Coin discount
      useCoins: false,
      coinsToUse: 0,
      availableCoins: 0,
    }
  },
  computed: {
    ...mapGetters(['cartItems', 'currentUser', 'isAuthenticated']),
    selectedIds() {
      return this.$route.query.items ? this.$route.query.items.split(',') : []
    },
    selectedItems() {
      return this.cartItems.filter(item => this.selectedIds.includes(item._id))
    },
    shippingCost() {
      return 5.99
    },
    subtotal() {
      return this.selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    discountAmount() {
      if (!this.voucherApplied || !this.appliedVoucher) return 0
      if (this.appliedVoucher.discountType === 'percentage') {
        return this.subtotal * (this.appliedVoucher.discountValue / 100)
      } else {
        return Math.min(this.appliedVoucher.discountValue, this.subtotal)
      }
    },
    totalAmount() {
      return Math.max(0, this.subtotal + this.shippingCost - this.discountAmount - this.coinDiscountAmount)
    },
    coinDiscountAmount() {
      if (!this.useCoins || this.coinsToUse <= 0) return 0
      return Math.min(this.coinsToUse / 1000, this.subtotal + this.shippingCost - this.discountAmount)
    },
    maxCoinsUsable() {
      const maxByBalance = this.availableCoins
      const maxByTotal = Math.ceil((this.subtotal + this.shippingCost - this.discountAmount) * 1000)
      return Math.min(maxByBalance, maxByTotal)
    },
    userAddresses() {
      return this.currentUser?.addresses || []
    },
    canPlaceOrder() {
      if (this.paymentMethod === 'stripe') {
        return this.selectedAddressId && this.cardElement && this.isAuthenticated;
      }
      return this.selectedAddressId && this.paymentMethod && this.isAuthenticated;
    }
  },
  watch: {
    selectedAddressId(newVal) {
      if (newVal) {
        const address = this.userAddresses.find(a => a._id === newVal)
        if (address) {
          this.shippingAddress = { ...address }
        }
      } else {
        this.shippingAddress = {
          fullName: '',
          phoneNumber: '',
          cityDistrictWard: '',
          streetBuildingHouse: '',
          isDefault: false
        }
      }
    },
    async paymentMethod(newVal) {
      if (newVal === 'stripe' && !this.stripe) {
        await this.setupStripe();
      } else if (newVal !== 'stripe' && this.cardElement) {
        if (this.cardElement && typeof this.cardElement.destroy === 'function') {
          this.cardElement.destroy();
        }
        this.cardElement = null;
      }
    }
  },
  async mounted() {
    // Check if user is authenticated
    if (!this.isAuthenticated) {
      this.$toast.warning('Please log in to proceed with checkout.', {
        position: 'top-right',
      })
      this.$router.push('/login?redirect=checkout')
      return
    }

    // Set default address if available
    const defaultAddress = this.userAddresses.find(a => a.isDefault)
    if (defaultAddress) {
      this.selectedAddressId = defaultAddress._id
    }

    if (this.paymentMethod === 'stripe') {
      await this.setupStripe();
    }

    // Load coin balance
    await this.loadCoinBalance();
  },
  methods: {
    async setupStripe() {
      if (this.cardElement) return;
      // Ensure publishable key is configured
      if (!stripePublishableKey) {
        this.$toast.error('Stripe publishable key is not configured. Please set VUE_APP_STRIPE_PUBLISHABLE.', { position: 'top-right' });
        return;
      }
      
      if (!stripePromise) {
        stripePromise = loadStripe(stripePublishableKey);
      }

      // Await the loader promise and ensure it resolved to a Stripe instance
      try {
        this.stripe = await stripePromise;
      } catch (err) {
        this.$toast.error('Failed to initialize Stripe. Check the publishable key.', { position: 'top-right' });
        console.error('Stripe initialization error:', err);
        return;
      }

      if (!this.stripe || typeof this.stripe.elements !== 'function') {
        this.$toast.error('Stripe is not available. Please verify your publishable key.', { position: 'top-right' });
        return;
      }

      const elements = this.stripe.elements();
      this.cardElement = elements.create('card', {
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
      });

      // Use a timeout to ensure the element is in the DOM
      setTimeout(() => {
        if (document.getElementById('card-element')) {
          this.cardElement.mount('#card-element');
          this.cardElement.on('change', (event) => {
            const displayError = document.getElementById('card-errors');
            if (event.error) {
              displayError.textContent = event.error.message;
            } else {
              displayError.textContent = '';
            }
          });
        }
      }, 0);
    },
    async placeOrder() {
      if (this.paymentMethod === 'stripe') {
        await this.handleStripePayment();
      } else {
        await this.handleCashOnDelivery();
      }
    },
    async createOrder(paymentIntentId = null, coinsAlreadyDeducted = false) {
       try {
        const orderData = {
          products: this.selectedItems.map(item => ({
            productId: item._id,
            productName: item.name,
            sellerId: item.sellerId,
            sellerName: item.sellerName || 'Unknown Shop',
            quantity: item.quantity,
            price: item.price || 0,
            image: item.image,
            selectedOptions: item.selectedOptions || {}
          })),
          totalAmount: this.totalAmount || 0,
          shippingAddress: this.shippingAddress,
          paymentMethod: this.paymentMethod,
          paymentStatus: this.paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed',
          paymentIntentId: paymentIntentId,
          coinsUsed: (this.useCoins ? this.coinsToUse : 0) || 0,
          coinsAlreadyDeducted: coinsAlreadyDeducted || false,
          voucher: this.appliedVoucher ? {
            code: this.appliedVoucher.code,
            discountAmount: this.discountAmount || 0
          } : null
        }

        const token = localStorage.getItem('token');
        await axios.post('/api/orders', orderData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        this.$toast.success('Order placed successfully!', { position: 'top-right' });

        // Remove placed items from cart
        for (const item of this.selectedItems) {
          try {
            await this.$store.dispatch('removeFromCart', item._id)
          } catch (e) {
            // Ignore errors - item may already be removed
          }
        }

        // Redirect to profile
        this.$router.push('/profile');
      } catch (error) {
        // 401 errors are now handled globally by the axios interceptor
        // Only handle other errors here
        if (error.response?.status !== 401) {
          this.$toast.error(error.response?.data?.message || 'Failed to place order', { position: 'top-right' });
        }
      }
    },
    async handleCashOnDelivery() {
      await this.createOrder();
    },
    async applyVoucher() {
      if (!this.voucherCode.trim()) return

      try {
        const token = localStorage.getItem('token')
        const response = await axios.post('/api/vouchers/apply', {
          code: this.voucherCode.trim()
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })

        this.appliedVoucher = response.data.voucher
        this.voucherApplied = true
        this.voucherError = ''
        this.$toast.success('Voucher applied successfully!', { position: 'top-right' })
      } catch (error) {
        this.voucherError = error.response?.data?.message || 'Invalid voucher code'
        this.voucherApplied = false
        this.appliedVoucher = null
      }
    },
    async handleStripePayment() {
      if (!this.stripe || !this.cardElement) {
        this.$toast.error('Stripe is not ready yet.', { position: 'top-right' });
        return;
      }

      const token = localStorage.getItem('token');
      let coinsDeducted = false;
      const coinsToDeduct = this.useCoins ? this.coinsToUse : 0;

      try {
        // 1. Deduct coins BEFORE charging Stripe (so we can abort if coins fail)
        if (coinsToDeduct > 0) {
          try {
            await axios.post('/api/coins/deduct', {
              userId: this.currentUser._id || this.currentUser.id,
              amount: coinsToDeduct,
              description: 'Order discount'
            }, { headers: { Authorization: `Bearer ${token}` } });
            coinsDeducted = true;
          } catch (coinError) {
            this.$toast.error(coinError.response?.data?.message || 'Failed to deduct coins. Please try again.', { position: 'top-right' });
            return;
          }
        }

        // 2. Create a PaymentIntent on your server
        const { data: { clientSecret } } = await axios.post('/api/payments/create-intent', {
          amount: this.totalAmount * 100 // Amount in cents
        });

        // 3. Confirm the card payment
        const { paymentIntent, error } = await this.stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: this.shippingAddress.fullName,
            },
          }
        });

        if (error) {
          // Stripe payment failed - refund coins if already deducted
          if (coinsDeducted) {
            try {
              await axios.post('/api/coins/refund', {
                userId: this.currentUser._id || this.currentUser.id,
                amount: coinsToDeduct,
                description: 'Stripe payment failed - coin refund'
              }, { headers: { Authorization: `Bearer ${token}` } });
            } catch (refundErr) {
              console.error('Failed to refund coins after Stripe error:', refundErr);
            }
          }
          this.$toast.error(error.message, { position: 'top-right' });
        } else if (paymentIntent && paymentIntent.status === 'succeeded') {
          // 4. If payment is successful, create the order (coins already deducted)
          await this.createOrder(paymentIntent.id, coinsDeducted);
        }
      } catch (err) {
        // Refund coins if already deducted and something unexpected failed
        if (coinsDeducted) {
          try {
            await axios.post('/api/coins/refund', {
              userId: this.currentUser._id || this.currentUser.id,
              amount: coinsToDeduct,
              description: 'Payment failed - coin refund'
            }, { headers: { Authorization: `Bearer ${token}` } });
          } catch (refundErr) {
            console.error('Failed to refund coins after payment error:', refundErr);
          }
        }
        this.$toast.error(err.response?.data?.message || 'Payment failed. Please try again.', { position: 'top-right' });
      }
    },
    async loadCoinBalance() {
      try {
        const response = await axios.get('/api/coins', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        this.availableCoins = response.data.coins || 0
      } catch (error) {
        console.error('Failed to load coin balance:', error)
        this.availableCoins = 0
      }
    }
  }
}
</script>

<style scoped>
.checkout-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
