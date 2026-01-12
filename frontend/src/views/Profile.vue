 <template>
  <div class="profile">
    <div class="container py-5">
      <div class="row">
        <!-- Sidebar Menu -->
        <div class="col-md-3">
          <div class="card shadow">
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'account'" :class="{ 'active': activeTab === 'account' }">
                    My Account
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'purchase'" :class="{ 'active': activeTab === 'purchase' }">
                    My Purchase
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'vouchers'" :class="{ 'active': activeTab === 'vouchers' }">
                    My Vouchers
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'coins'" :class="{ 'active': activeTab === 'coins' }">
                    My ShopHub Coin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- My Account Tab -->
          <div v-if="activeTab === 'account'">
            <h2 class="mb-4">My Account</h2>

            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else class="card shadow">
              <div class="card-body p-4">
                <form @submit.prevent="updateProfile">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input
                        type="text"
                        class="form-control"
                        id="firstName"
                        v-model="user.firstName"
                        required
                      >
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input
                        type="text"
                        class="form-control"
                        id="lastName"
                        v-model="user.lastName"
                        required
                      >
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="user.email"
                      required
                      disabled
                    >
                    <div class="form-text">Email cannot be changed.</div>
                  </div>

                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="user.phone"
                      placeholder="Enter your phone number"
                    >
                  </div>

                  <div class="d-grid">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="updating"
                    >
                      <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                      {{ updating ? 'Updating...' : 'Update Profile' }}
                    </button>
                  </div>
                </form>

                <hr class="my-4">

                <h5 class="mb-3">Addresses</h5>
                <div v-if="user.addresses && user.addresses.length > 0">
                  <div v-for="(address, index) in user.addresses" :key="index" class="card mb-3">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <p class="mb-1">
                            <strong>Full Name:</strong> {{ address.fullName || address.street || 'Not provided' }}<br>
                            <strong>Phone:</strong> {{ address.phoneNumber || 'Not provided' }}<br>
                            <strong>Address:</strong> {{ address.cityDistrictWard || `${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}`.trim() || 'Not provided' }}, {{ address.streetBuildingHouse || address.street || 'Not provided' }}
                          </p>
                          <small class="text-muted" v-if="address.isDefault">Default address</small>
                        </div>
                        <div>
                          <button
                            @click="setDefaultAddress(index)"
                            class="btn btn-sm btn-outline-primary me-2"
                            :disabled="address.isDefault"
                          >
                            Set Default
                          </button>
                          <button
                            @click="removeAddress(index)"
                            class="btn btn-sm btn-outline-danger"
                            :disabled="user.addresses.length === 1 && address.isDefault"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <p>No addresses added yet.</p>
                </div>

                <button
                  @click="showAddAddress = !showAddAddress"
                  class="btn btn-outline-primary btn-sm mt-2"
                >
                  {{ showAddAddress ? 'Cancel' : 'Add New Address' }}
                </button>

                <div v-if="showAddAddress" class="mt-3">
                  <h6>Add New Address</h6>
                  <form @submit.prevent="addAddress">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Full Name</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="newAddress.fullName"
                          required
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Phone Number</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="newAddress.phoneNumber"
                          required
                        >
                      </div>
                    </div>
                    <div class="row mb-3" v-if="locations.cities.length > 0">
                      <div class="col-md-4">
                        <label class="form-label">City</label>
                        <select v-model="selectedCity" class="form-select" :disabled="locationsLoading" required>
                          <option value="">{{ locationsLoading ? 'Loading...' : 'Select City' }}</option>
                          <option v-for="city in locations.cities" :key="city" :value="city">{{ city }}</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">District</label>
                        <select v-model="selectedDistrict" class="form-select" :disabled="!selectedCity" required>
                          <option value="">Select District</option>
                          <option v-for="district in availableDistricts" :key="district" :value="district">{{ district }}</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Ward</label>
                        <select v-model="selectedWard" class="form-select" :disabled="!selectedDistrict" required>
                          <option value="">Select Ward</option>
                          <option v-for="ward in availableWards" :key="ward" :value="ward">{{ ward }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="mb-3" v-else>
                      <label class="form-label">City, District, Ward</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="newAddress.cityDistrictWard"
                        placeholder="e.g., Ho Chi Minh City, District 1, Ward Ben Nghe"
                        required
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Street Name, Building, House No</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="newAddress.streetBuildingHouse"
                        placeholder="e.g., Tran Hung Dao Street, Building 5, House 10"
                        required
                      >
                    </div>
                    <div class="form-check mb-3">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="defaultAddress"
                        v-model="newAddress.isDefault"
                      >
                      <label class="form-check-label" for="defaultAddress">Set as default address</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm">Add Address</button>
                  </form>
                </div>

                <div v-if="message" class="alert alert-success mt-3" role="alert">
                  {{ message }}
                </div>
                <div v-if="error" class="alert alert-danger mt-3" role="alert">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- My Purchase Tab -->
          <div v-if="activeTab === 'purchase'">
            <h2 class="mb-4">My Purchase</h2>

            <div v-if="ordersLoading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="orders.length === 0" class="text-center">
              <p>No orders found.</p>
            </div>

            <div v-else>
              <div v-for="order in orders" :key="order._id" class="card mb-3 shadow">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 class="card-title">Order #{{ order.orderNumber }}</h5>
                      <p class="card-text">Status: <span :class="getStatusClass(order.status)">{{ order.status }}</span></p>
                      <p class="card-text">Total: ${{ order.totalAmount }}</p>
                      <p class="card-text">Date: {{ new Date(order.createdAt).toLocaleDateString() }}</p>
                    </div>
                    <button class="btn btn-outline-primary btn-sm" @click="viewOrderDetails(order)">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- My Vouchers Tab -->
          <div v-if="activeTab === 'vouchers'">
            <h2 class="mb-4">My Vouchers</h2>

            <div v-if="vouchersLoading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="vouchers.length === 0" class="text-center">
              <p>No vouchers available.</p>
            </div>

            <div v-else>
              <div v-for="voucher in vouchers" :key="voucher._id" class="card mb-3 shadow">
                <div class="card-body">
                  <h5 class="card-title">{{ voucher.code }}</h5>
                  <p class="card-text">Discount: {{ voucher.discount }}%</p>
                  <p class="card-text">Expires: {{ new Date(voucher.expiryDate).toLocaleDateString() }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- My ShopHub Coin Tab -->
          <div v-if="activeTab === 'coins'">
            <h2 class="mb-4">My ShopHub Coin</h2>

            <div class="card shadow">
              <div class="card-body text-center">
                <h3 class="text-primary">{{ coins }} Coins</h3>
                <p class="text-muted">Earn coins by logging in daily!</p>
                <button
                  class="btn btn-primary"
                  @click="claimDailyCoins"
                  :disabled="dailyClaimed"
                >
                  {{ dailyClaimed ? 'Already claimed today' : 'Claim Daily Coins' }}
                </button>
                <p v-if="dailyClaimed" class="text-success mt-2">You have already claimed your daily coins today.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'account',
      loading: true,
      updating: false,
      showAddAddress: false,
      message: '',
      error: '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        addresses: []
      },
      newAddress: {
        fullName: '',
        phoneNumber: '',
        cityDistrictWard: '',
        streetBuildingHouse: '',
        isDefault: false
      },
      selectedCity: '',
      selectedDistrict: '',
      selectedWard: '',
      locations: {
        cities: [],
        districts: {},
        wards: {}
      },
      provinceCodes: {},
      districtCodes: {},
      locationsLoading: true,
      orders: [],
      ordersLoading: false,
      vouchers: [],
      vouchersLoading: false,
      coins: 0,
      dailyClaimed: false
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    availableDistricts() {
      return this.locations.districts[this.selectedCity] || []
    },
    availableWards() {
      return this.locations.wards[this.selectedDistrict] || []
    }
  },
  watch: {
    currentUser: {
      handler(newVal) {
        if (newVal) {
          this.user = { ...newVal }
        }
      },
      deep: true,
      immediate: true
    },
    selectedCity() {
      this.selectedDistrict = ''
      this.selectedWard = ''
    },
    selectedDistrict() {
      this.selectedWard = ''
    }
  },
  async created() {
    await this.loadLocations()
    await this.loadUserData()
    await this.loadOrders()
    await this.loadVouchers()
    await this.loadCoins()
  },
  methods: {
    async loadLocations() {
      try {
        const [provincesRes, districtsRes, wardsRes] = await Promise.all([
          fetch('https://provinces.open-api.vn/api/p/'),
          fetch('https://provinces.open-api.vn/api/d/'),
          fetch('https://provinces.open-api.vn/api/w/')
        ])

        const provinces = await provincesRes.json()
        const districts = await districtsRes.json()
        const wards = await wardsRes.json()

        // Load provinces
        this.locations.cities = provinces.map(p => p.name).sort()
        this.provinceCodes = {}
        provinces.forEach(p => {
          this.provinceCodes[p.name] = p.code
        })

        // Load districts
        this.locations.districts = {}
        districts.forEach(d => {
          const province = provinces.find(p => p.code === d.province_code)
          if (province) {
            const provinceName = province.name
            if (!this.locations.districts[provinceName]) {
              this.locations.districts[provinceName] = []
            }
            this.locations.districts[provinceName].push(d.name)
          }
        })
        // Sort districts for each province
        Object.keys(this.locations.districts).forEach(province => {
          this.locations.districts[province].sort()
        })

        this.districtCodes = {}
        districts.forEach(d => {
          const province = provinces.find(p => p.code === d.province_code)
          if (province) {
            const key = `${province.name}-${d.name}`
            this.districtCodes[key] = d.code
          }
        })

        // Load wards
        this.locations.wards = {}
        wards.forEach(w => {
          const district = districts.find(d => d.code === w.district_code)
          if (district) {
            const districtName = district.name
            if (!this.locations.wards[districtName]) {
              this.locations.wards[districtName] = []
            }
            this.locations.wards[districtName].push(w.name)
          }
        })
        // Sort wards for each district
        Object.keys(this.locations.wards).forEach(district => {
          this.locations.wards[district].sort()
        })
      } catch (error) {
        console.error('Error loading locations:', error)
      } finally {
        this.locationsLoading = false
      }
    },
    async loadUserData() {
      this.loading = true
      try {
        if (this.currentUser) {
          this.user = { ...this.currentUser }
        } else {
          // Fetch user data if not in store
          const response = await this.$http.get('/api/users/me')
          this.user = response.data
          this.$store.commit('SET_USER', response.data)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        this.error = 'Failed to load user data.'
      } finally {
        this.loading = false
      }
    },
    async updateProfile() {
      this.updating = true
      this.message = ''
      this.error = ''

      try {
        const response = await this.$http.patch('/api/users/me', this.user)
        this.$store.commit('SET_USER', response.data.user)
        this.message = 'Profile updated successfully!'
      } catch (error) {
        console.error('Error updating profile:', error)
        this.error = error.response?.data?.message || 'Failed to update profile.'
      } finally {
        this.updating = false
      }
    },
    async addAddress() {
      this.newAddress.cityDistrictWard = `${this.selectedCity}, ${this.selectedDistrict}, ${this.selectedWard}`
      try {
        const response = await this.$http.post('/api/users/addresses', this.newAddress)
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.newAddress = {
          fullName: '',
          phoneNumber: '',
          cityDistrictWard: '',
          streetBuildingHouse: '',
          isDefault: false
        }
        this.selectedCity = ''
        this.selectedDistrict = ''
        this.selectedWard = ''
        this.showAddAddress = false
        this.message = 'Address added successfully!'
      } catch (error) {
        console.error('Error adding address:', error)
        this.error = error.response?.data?.message || 'Failed to add address.'
      }
    },
    async setDefaultAddress(index) {
      try {
        const addressId = this.user.addresses[index]._id
        const response = await this.$http.put(`/api/users/addresses/${addressId}`, {
          ...this.user.addresses[index],
          isDefault: true
        })
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.message = 'Default address updated!'
      } catch (error) {
        console.error('Error setting default address:', error)
        this.error = error.response?.data?.message || 'Failed to set default address.'
      }
    },
    async removeAddress(index) {
      if (!confirm('Are you sure you want to remove this address?')) return

      try {
        const addressId = this.user.addresses[index]._id
        const response = await this.$http.delete(`/api/users/addresses/${addressId}`)
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.message = 'Address removed successfully!'
      } catch (error) {
        console.error('Error removing address:', error)
        this.error = error.response?.data?.message || 'Failed to remove address.'
      }
    },
    async loadOrders() {
      this.ordersLoading = true
      try {
        const response = await this.$http.get('/api/users/me/orders')
        this.orders = response.data
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        this.ordersLoading = false
      }
    },
    getStatusClass(status) {
      const classes = {
        pending: 'text-warning',
        confirmed: 'text-info',
        processing: 'text-primary',
        shipped: 'text-secondary',
        delivered: 'text-success',
        cancelled: 'text-danger'
      }
      return classes[status] || 'text-muted'
    },
    viewOrderDetails(order) {
      // Placeholder for viewing order details
      alert(`Order Details: ${order.orderNumber}`)
    },
    async loadVouchers() {
      this.vouchersLoading = true
      try {
        // Placeholder API call
        const response = await this.$http.get('/api/vouchers/active')
        this.vouchers = response.data
      } catch (error) {
        console.error('Error loading vouchers:', error)
        // For demo, set some sample vouchers
        this.vouchers = [
          { _id: 1, code: 'SAVE10', discount: 10, expiryDate: '2024-12-31' },
          { _id: 2, code: 'SAVE20', discount: 20, expiryDate: '2024-11-30' }
        ]
      } finally {
        this.vouchersLoading = false
      }
    },
    async loadCoins() {
      try {
        // Placeholder API call
        const response = await this.$http.get('/api/coins')
        this.coins = response.data.coins
        this.dailyClaimed = response.data.dailyClaimed
      } catch (error) {
        console.error('Error loading coins:', error)
        // For demo
        this.coins = 150
        this.dailyClaimed = false
      }
    },
    async claimDailyCoins() {
      try {
        const response = await this.$http.post('/api/coins/claim-daily')
        this.coins = response.data.coins
        this.dailyClaimed = true
        alert('Daily coins claimed!')
      } catch (error) {
        console.error('Error claiming daily coins:', error)
        // For demo
        this.coins += 10
        this.dailyClaimed = true
        alert('Daily coins claimed!')
      }
    }
  }
}
</script>

<style scoped>
.profile {
  min-height: 70vh;
}

.list-group-item a {
  text-decoration: none;
  color: inherit;
}

.list-group-item a.active {
  font-weight: bold;
  color: #007bff;
}
</style>
