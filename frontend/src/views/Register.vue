<template>
  <div class="register">
    <div class="container">
        <div class="row justify-content-center">
          <div class="col-md-7 col-lg-5">
            <div class="card shadow">
              <div class="card-body p-4">
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
                  <label for="role" class="form-label">Account Type</label>
                  <select 
                    class="form-select" 
                    id="role" 
                    v-model="form.role"
                    required
                  >
                    <option value="">Select account type</option>
                    <option value="customer">Customer - Shop and buy products</option>
                    <option value="seller">Seller - Sell your products</option>
                  </select>
                  <div class="form-text">Choose your account type. You can change this later.</div>
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

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useRegister } from '../composables/useAuth'

const router = useRouter()
const { proxy } = getCurrentInstance()
const registerMutation = useRegister()

const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  role: '',
  password: '',
  confirmPassword: ''
})
const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (form.password !== form.confirmPassword) {
    error.value = 'Passwords do not match.'
    return
  }

  if (form.password.length < 6) {
    error.value = 'Password must be at least 6 characters long.'
    return
  }

  if (!form.role) {
    error.value = 'Please select an account type.'
    return
  }

  loading.value = true
  error.value = ''

  try {
    await registerMutation.mutateAsync({ ...form })
    proxy.$toast.success('Your account has been created!', {
      position: 'top-right',
      timeout: 3000
    })

    await new Promise(resolve => setTimeout(resolve, 100))

    if (form.role === 'seller') {
      router.push('/seller')
    } else {
      router.push('/')
    }
  } catch (err) {
    const errData = err.response?.data || err
    error.value = errData.message || 'Registration failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
/* ===== Register Page - Premium Design System ===== */
.register {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  display: flex;
  align-items: center;
  padding: 2.25rem 0;
  position: relative;
  overflow: hidden;
}

.register::before {
  content: '';
  position: absolute;
  top: -40%;
  right: -20%;
  width: 700px;
  height: 700px;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.register::after {
  content: '';
  position: absolute;
  bottom: -30%;
  left: -10%;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%);
  border-radius: 50%;
  animation: float 8s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-25px) rotate(5deg); }
}

.card {
  border: none;
  border-radius: var(--radius-2xl);
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  position: relative;
  z-index: 1;
}

.card-body {
  padding: 2rem !important;
}

.card-title {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--text-primary);
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.form-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  padding: 0.875rem 1.125rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  font-family: var(--font-body);
  font-size: 0.95rem;
  transition: var(--transition-base);
  background: var(--surface);
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

.form-text {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.4rem;
}

.form-select {
  cursor: pointer;
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

.btn-outline-primary.btn-lg {
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  padding: 0.9rem 2rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: var(--primary);
  background: transparent;
  transition: var(--transition-fast);
}

.btn-outline-primary.btn-lg:hover {
  background: rgba(99, 102, 241, 0.1);
  transform: translateY(-2px);
  color: var(--primary);
  border-color: var(--primary);
}

.text-center a {
  color: var(--primary);
  font-weight: 500;
  text-decoration: none;
  transition: var(--transition-fast);
}

.text-center a:hover {
  color: var(--primary-dark);
  text-decoration: underline;
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

/* ===== Responsive Styles ===== */
@media (max-width: 768px) {
  .register {
    padding: 2rem 0;
  }

  .register::before,
  .register::after {
    display: none;
  }

  .card-body {
    padding: 2rem !important;
  }

  .card-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 576px) {
  .register {
    padding: 1rem 0;
  }

  .card-body {
    padding: 1.5rem !important;
  }

  .card-title {
    font-size: 1.35rem;
  }

  .form-control,
  .form-select {
    padding: 0.75rem 1rem;
    font-size: 0.9rem;
  }

  .btn-lg {
    padding: 0.875rem 1.5rem;
    font-size: 0.95rem;
  }
}
</style>
