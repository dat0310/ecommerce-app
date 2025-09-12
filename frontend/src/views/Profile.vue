<template>
  <div class="profile">
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h2 class="mb-4">Your Profile</h2>
          
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
                          {{ address.street }}, {{ address.city }}, {{ address.state }} {{ address.zipCode }}, {{ address.country }}
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
                  <div class="row">
                    <div class="col-md-6 mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newAddress.street"
                        placeholder="Street"
                        required
                      >
                    </div>
                    <div class="col-md-6 mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newAddress.city"
                        placeholder="City"
                        required
                      >
                    </div>
                    <div class="col-md-4 mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newAddress.state"
                        placeholder="State"
                        required
                      >
                    </div>
                    <div class="col-md-4 mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newAddress.zipCode"
                        placeholder="ZIP Code"
                        required
                      >
                    </div>
                    <div class="col-md-4 mb-2">
                      <input 
                        type="text" 
                        class="form-control" 
                        v-model="newAddress.country"
                        placeholder="Country"
                        required
                      >
                    </div>
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
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        isDefault: false
      }
    }
  },
  computed: {
    ...mapGetters(['currentUser'])
  },
  async created() {
    await this.loadUserData()
  },
  methods: {
    async loadUserData() {
      this.loading = true
      try {
        if (this.currentUser) {
          this.user = { ...this.currentUser }
        } else {
          // Fetch user data if not in store
          const response = await this.$http.get('/api/users/profile')
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
        const response = await this.$http.put('/api/users/profile', this.user)
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
      try {
        const response = await this.$http.post('/api/users/addresses', this.newAddress)
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.newAddress = {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
          isDefault: false
        }
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
    }
  }
}
</script>

<style scoped>
.profile {
  min-height: 70vh;
}
</style>