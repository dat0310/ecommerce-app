<template>
  <div class="login">
    <!-- Hero Background -->
    <div class="login-hero">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-8 col-lg-6">
            <div class="login-container" data-aos="fade-up">
              <!-- Header -->
              <div class="text-center mb-5">
                <div class="login-icon mb-3">
                  <i class="bi bi-person-circle"></i>
                </div>
                <h1 class="display-5 fw-bold gradient-text mb-2">Welcome Back</h1>
                <p class="text-muted">Sign in to your account to continue shopping</p>
              </div>

              <!-- Login Form -->
              <div class="card glass-card">
                <div class="card-body p-5">
                  <form @submit.prevent="handleLogin">
                    <div class="mb-4">
                      <label for="email" class="form-label fw-semibold">
                        <i class="bi bi-envelope me-2"></i>
                        Email Address
                      </label>
                      <input 
                        type="email" 
                        class="form-control form-control-lg" 
                        id="email" 
                        v-model="form.email"
                        required
                        placeholder="Enter your email address"
                        :class="{ 'is-invalid': error && form.email === '' }"
                      >
                    </div>
                    
                    <div class="mb-4">
                      <label for="password" class="form-label fw-semibold">
                        <i class="bi bi-lock me-2"></i>
                        Password
                      </label>
                      <div class="position-relative">
                        <input 
                          :type="showPassword ? 'text' : 'password'" 
                          class="form-control form-control-lg" 
                          id="password" 
                          v-model="form.password"
                          required
                          placeholder="Enter your password"
                          :class="{ 'is-invalid': error && form.password === '' }"
                        >
                        <button 
                          type="button" 
                          class="btn btn-link position-absolute end-0 top-50 translate-middle-y pe-3"
                          @click="showPassword = !showPassword"
                        >
                          <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
                        </button>
                      </div>
                    </div>

                    <!-- Remember Me & Forgot Password -->
                    <div class="d-flex justify-content-between align-items-center mb-4">
                      <div class="form-check">
                        <input class="form-check-input" type="checkbox" id="rememberMe" v-model="rememberMe">
                        <label class="form-check-label" for="rememberMe">
                          Remember me
                        </label>
                      </div>
                      <a href="#" class="text-decoration-none text-primary">Forgot password?</a>
                    </div>
                    
                    <div class="d-grid mb-4">
                      <button 
                        type="submit" 
                        class="btn btn-primary btn-lg hover-lift"
                        :disabled="loading"
                      >
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        <i v-else class="bi bi-box-arrow-in-right me-2"></i>
                        {{ loading ? 'Signing in...' : 'Sign In' }}
                      </button>
                    </div>

                    <!-- Divider -->
                    <div class="divider">
                      <span class="divider-text">or</span>
                    </div>

                    <!-- Social Login -->
                    <div class="row g-2 mb-4">
                      <div class="col-6">
                        <button type="button" class="btn btn-outline-secondary w-100">
                          <i class="bi bi-google me-2"></i>
                          Google
                        </button>
                      </div>
                      <div class="col-6">
                        <button type="button" class="btn btn-outline-secondary w-100">
                          <i class="bi bi-facebook me-2"></i>
                          Facebook
                        </button>
                      </div>
                    </div>
                  </form>
                  
                  <!-- Error Message -->
                  <div v-if="error" class="alert alert-danger mt-3" role="alert">
                    <i class="bi bi-exclamation-triangle me-2"></i>
                    {{ error }}
                  </div>
                </div>
              </div>

              <!-- Register Link -->
              <div class="text-center mt-4">
                <p class="text-muted">
                  Don't have an account? 
                  <router-link to="/register" class="text-primary fw-semibold text-decoration-none">
                    Create one here
                  </router-link>
                </p>
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
      error: '',
      showPassword: false,
      rememberMe: false
    }
  },
  methods: {
    ...mapActions(['login']),
    async handleLogin() {
      this.loading = true
      this.error = ''
      
      try {
        await this.login(this.form)
        this.$toast.success('Welcome back!', {
          position: 'top-right',
          timeout: 3000
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
  min-height: 100vh;
  position: relative;
}

.login-hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-hero::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><polygon fill="rgba(255,255,255,0.1)" points="0,1000 1000,0 1000,1000"/></svg>');
  background-size: cover;
}

.login-container {
  position: relative;
  z-index: 2;
}

.login-icon {
  width: 80px;
  height: 80px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  backdrop-filter: blur(10px);
}

.login-icon i {
  font-size: 2.5rem;
  color: white;
}

.glass-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.form-control-lg {
  padding: 1rem 1.25rem;
  border-radius: 12px;
  border: 2px solid var(--border-color);
  transition: all 0.3s ease;
}

.form-control-lg:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
}

.form-check-input:checked {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

.divider {
  position: relative;
  text-align: center;
  margin: 2rem 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  background: white;
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
}

.alert {
  border: none;
  border-radius: 12px;
  padding: 1rem 1.25rem;
}

.btn-outline-secondary {
  border-radius: 12px;
  padding: 0.75rem 1rem;
  transition: all 0.3s ease;
}

.btn-outline-secondary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login-hero {
    padding: 2rem 0;
  }
  
  .glass-card .card-body {
    padding: 2rem !important;
  }
  
  .login-icon {
    width: 60px;
    height: 60px;
  }
  
  .login-icon i {
    font-size: 2rem;
  }
  
  .display-5 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .glass-card .card-body {
    padding: 1.5rem !important;
  }
  
  .form-control-lg {
    padding: 0.875rem 1rem;
  }
  
  .btn-lg {
    padding: 0.875rem 1.5rem;
  }
}
</style>