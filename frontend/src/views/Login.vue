<template>
  <div class="login">
    <!-- Hero Background -->
    <div class="login-hero">
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-5">
            <div class="login-container" data-aos="fade-up">
              <!-- Header -->
              <div class="text-center mb-4">
                <h1 class="display-5 fw-bold gradient-text mb-2">Welcome Back</h1>
                <p class="text-muted">Sign in to your account to continue shopping</p>
              </div>

              <!-- Login Form -->
              <div class="card glass-card">
                <div class="card-body p-4">
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
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.login-hero::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -25%;
  width: 800px;
  height: 800px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.login-hero::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -15%;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-30px) rotate(5deg); }
}

.login-container {
  position: relative;
  z-index: 2;
}

.gradient-text {
  background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.glass-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: var(--radius-2xl);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.form-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-label i {
  color: var(--primary);
}

.form-control-lg {
  padding: 1rem 1.25rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: var(--transition-base);
  background: var(--surface);
}

.form-control-lg:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
  outline: none;
}

.form-control-lg::placeholder {
  color: var(--text-muted);
}

.form-control-lg.is-invalid {
  border-color: var(--danger);
}

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

.form-check-label {
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
}

.text-primary {
  color: var(--primary) !important;
  font-weight: 500;
  transition: var(--transition-fast);
}

.text-primary:hover {
  color: var(--primary-dark) !important;
}

.btn-primary.btn-lg {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 2rem;
  font-weight: 600;
  font-family: var(--font-body);
  font-size: 1rem;
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary.btn-lg:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(99, 102, 241, 0.35);
}

.btn-primary.btn-lg:disabled {
  opacity: 0.7;
  transform: none;
}

.btn-link {
  color: var(--text-muted);
  text-decoration: none;
  transition: var(--transition-fast);
}

.btn-link:hover {
  color: var(--primary);
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
  background: var(--border);
}

.divider-text {
  background: var(--surface);
  padding: 0 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  position: relative;
  z-index: 1;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.btn-outline-secondary {
  border-radius: var(--radius-lg);
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  background: var(--surface);
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-fast);
}

.btn-outline-secondary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--primary-light);
  background: var(--surface);
  color: var(--primary);
}

.btn-outline-secondary i {
  font-size: 1.1rem;
}

.alert {
  border: none;
  border-radius: var(--radius-lg);
  padding: 1rem 1.25rem;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

.text-muted {
  color: rgba(255, 255, 255, 0.7) !important;
}

.text-center.mt-4 .text-muted {
  color: rgba(255, 255, 255, 0.8) !important;
}

.text-center.mt-4 .text-primary {
  color: white !important;
  font-weight: 600;
}

.text-center.mt-4 .text-primary:hover {
  text-decoration: underline;
}

/* Password toggle button */
.position-relative .btn-link {
  z-index: 10;
  padding: 0.5rem;
}

/* ===== Responsive Styles ===== */
@media (max-width: 768px) {
  .login-hero {
    padding: 2rem 0;
  }

  .login-hero::before,
  .login-hero::after {
    display: none;
  }

  .glass-card .card-body {
    padding: 2rem !important;
  }

  .display-5 {
    font-size: 2rem;
  }
}

@media (max-width: 576px) {
  .login-hero {
    padding: 1rem 0;
  }

  .glass-card .card-body {
    padding: 1.5rem !important;
  }

  .form-control-lg {
    padding: 0.875rem 1rem;
    font-size: 0.95rem;
  }

  .btn-lg {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }

  .display-5 {
    font-size: 1.75rem;
  }

  .divider {
    margin: 1.5rem 0;
  }
}
</style>
