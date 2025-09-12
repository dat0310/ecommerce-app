<template>
  <div class="login">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow">
            <div class="card-body p-5">
              <h2 class="card-title text-center mb-4">Login</h2>
              
              <form @submit.prevent="handleLogin">
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
                
                <div class="mb-4">
                  <label for="password" class="form-label">Password</label>
                  <input 
                    type="password" 
                    class="form-control" 
                    id="password" 
                    v-model="form.password"
                    required
                    placeholder="Enter your password"
                  >
                </div>
                
                <div class="d-grid">
                  <button 
                    type="submit" 
                    class="btn btn-primary btn-lg"
                    :disabled="loading"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    {{ loading ? 'Logging in...' : 'Login' }}
                  </button>
                </div>
              </form>
              
              <div class="text-center mt-4">
                <p>Don't have an account? <router-link to="/register">Register here</router-link></p>
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
  name: 'Login',
  data() {
    return {
      form: {
        email: '',
        password: ''
      },
      loading: false,
      error: ''
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.loading = true
      this.error = ''
      
      try {
        await this.login(this.form)
        this.$notify({
          type: 'success',
          title: 'Login Successful',
          text: 'Welcome back!'
        })
        this.$router.push('/')
      } catch (error) {
        this.error = error.message || 'Login failed. Please try again.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.login {
  min-height: 70vh;
  display: flex;
  align-items: center;
}
.card {
  border: none;
  border-radius: 10px;
}
</style>