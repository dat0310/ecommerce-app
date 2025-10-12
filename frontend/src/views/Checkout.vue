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
                <div v-for="item in selectedItems" :key="item._id" class="d-flex justify-content-between mb-2">
                  <span>{{ item.name }} (x{{ item.quantity }})</span>
                  <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
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
              <div class="card-header d-flex justify-content-between align-items-center">
                <h5>Shipping Address</h5>
                <button v-if="selectedAddressId !== 'new'" @click="addNewAddress" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-plus-circle me-1"></i>Add New Address
                </button>
              </div>
              <div class="card-body">
                <!-- Address Selection -->
                <div v-if="userAddresses.length > 0" class="mb-3">
                  <label class="form-label">Select Address</label>
                  <select v-model="selectedAddressId" class="form-select">
                    <option value="">Choose an address...</option>
                    <option v-for="address in userAddresses" :key="address._id" :value="address._id">
                      {{ address.fullName }} - {{ address.cityDistrictWard }}, {{ address.streetBuildingHouse }}
                      <span v-if="address.isDefault" class="badge bg-primary ms-1">Default</span>
                    </option>
                    <option value="new">Add New Address</option>
                  </select>
                </div>

                <!-- Address Form -->
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label">Full Name</label>
                    <input v-model="shippingAddress.fullName" type="text" class="form-control" required>
                  </div>
                  <div class="col-md-6">
                    <label class="form-label">Phone Number</label>
                    <input v-model="shippingAddress.phoneNumber" type="text" class="form-control" required>
                  </div>
                  <div class="col-12">
                    <label class="form-label">City, District, Ward</label>
                    <input v-model="shippingAddress.cityDistrictWard" type="text" class="form-control" required placeholder="e.g., Hanoi, Hoan Kiem, Phuc Tan">
                  </div>
                  <div class="col-12">
                    <label class="form-label">Street Name, Building, House No</label>
                    <input v-model="shippingAddress.streetBuildingHouse" type="text" class="form-control" required placeholder="e.g., Tran Hung Dao Street, Building 5, House 10">
                  </div>
                  <div class="col-12">
                    <div class="form-check">
                      <input v-model="shippingAddress.isDefault" type="checkbox" class="form-check-input" id="defaultAddress">
                      <label class="form-check-label" for="defaultAddress">
                        Set as default address
                      </label>
                    </div>
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
                <div v-if="paymentMethod === 'stripe'" class="mt-3 p-3 border rounded">
                  <p>Stripe payment form would be here.</p>
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
      }
    }
  },
  computed: {
    ...mapGetters(['cartItems', 'currentUser']),
    selectedIds() {
      return this.$route.query.items ? this.$route.query.items.split(',') : []
    },
    selectedItems() {
      return this.cartItems.filter(item => this.selectedIds.includes(item._id))
    },
    totalAmount() {
      return this.selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    },
    userAddresses() {
      return this.currentUser?.addresses || []
    },
    canPlaceOrder() {
      return this.shippingAddress.fullName && this.shippingAddress.phoneNumber &&
             this.shippingAddress.cityDistrictWard && this.shippingAddress.streetBuildingHouse && this.paymentMethod
    }
  },
  watch: {
    selectedAddressId(newVal) {
      if (newVal && newVal !== 'new') {
        const address = this.userAddresses.find(a => a._id === newVal)
        if (address) {
          this.shippingAddress = { ...address }
        }
      } else if (newVal === 'new') {
        this.clearAddressForm()
      }
    }
  },
  mounted() {
    // Set default address if available
    const defaultAddress = this.userAddresses.find(a => a.isDefault)
    if (defaultAddress) {
      this.selectedAddressId = defaultAddress._id
    }
  },
  methods: {
    addNewAddress() {
      this.selectedAddressId = 'new'
      this.clearAddressForm()
    },
    clearAddressForm() {
      this.shippingAddress = {
        fullName: '',
        phoneNumber: '',
        cityDistrictWard: '',
        streetBuildingHouse: '',
        isDefault: false
      }
    },
    async placeOrder() {
      try {
        const orderData = {
          products: this.selectedItems.map(item => ({
            productId: item._id,
            productName: item.name,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            quantity: item.quantity,
            price: item.price
          })),
          totalAmount: this.totalAmount,
          shippingAddress: this.shippingAddress,
          paymentMethod: this.paymentMethod,
          paymentStatus: this.paymentMethod === 'cash_on_delivery' ? 'pending' : 'completed' // Assume stripe completes
        }

        const response = await axios.post('/api/orders', orderData)
        this.$toast.success('Order placed successfully!')
        // Clear selected items from cart or redirect
        this.$router.push('/profile')
      } catch (error) {
        this.$toast.error('Failed to place order')
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
