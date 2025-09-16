<template>
  <div class="register">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-6">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="card-title text-center mb-4">Create Account</h2>
              
              <form @submit.prevent="handleRegister">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="firstName" class="form-label">First Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="firstName" 
                      v-model="form.firstName"
                      required
                      placeholder="Enter your first name"
                    >
                  </div>
                  
                  <div class="col-md-6 mb-3">
                    <label for="lastName" class="form-label">Last Name</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="lastName" 
                      v-model="form.lastName"
                      required
                      placeholder="Enter your last name"
                    >
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address</label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="email" 
                    v-model="form.email"
                    required
                    placeholder="Enter your email"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="phone" class="form-label">Phone Number (Optional)</label>
                  <input 
                    type="tel" 
                    class="form-control" 
                    id="phone" 
                    v-model="form.phone"
                    placeholder="Enter your phone number"
                  >
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="form.password"
                    required
                    placeholder="Create a password"
                    minlength="6"
                  >
                  <div class="form-text">Password must be at least 6 characters long.</div>
                </div>
                
                <div class="mb-4">
                  <label for="confirmPassword" class="form-label">Confirm Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="confirmPassword" 
                    v-model="form.confirmPassword"
                    required
                    placeholder="Confirm your password"
                  >
                </div>
                
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Creating Account...' : 'Create Account' }}
                  </button>
                </div>
                
                <div class="d-grid mt-3">
                  <router-link 
                    to="/login" 
                    class="btn btn-outline-primary btn-lg"
                  >
                    <i class="bi bi-box-arrow-in-right me-2"></i>
                    Sign In Instead
                  </router-link>
                </div>
              </form>
              
              <div class="text-center mt-4">
                <p>Already have an account? <router-link to="/login">Login here</router-link></p>
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
import { mapActions } from 'vuex'

export default {
  name: 'Register',
  data() {
    return {
      form: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    ...mapActions(['register']),
    async handleRegister() {
      // Validate passwords match
      if (this.form.password !== this.form.confirmPassword) {
        this.error = 'Passwords do not match.'
        return
      }
      
      // Validate password length
      if (this.form.password.length < 6) {
        this.error = 'Password must be at least 6 characters long.'
        return
      }
      
      this.loading = true
      this.error = ''
      
      try {
        await this.register(this.form)
        this.$toast.success('Your account has been created!', {
          position: 'top-right',
          timeout: 3000
        })
        this.$router.push('/login')
      } catch (error) {
        this.error = error.message || 'Registration failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.register {
  min-height: 70vh;
  display: flex;
  align-items: center;
}
.card {
  border: none;
  border-radius: 10px;
}
</style>