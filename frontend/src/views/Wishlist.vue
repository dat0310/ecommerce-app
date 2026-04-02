<template>
  <div class="wishlist">
    <!-- Hero Section -->
    <section class="wishlist-hero bg-gradient-primary text-white py-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-lg-8">
            <h1 class="display-4 fw-bold mb-3" data-aos="fade-right">
              <i class="bi bi-heart me-3"></i>
              My Wishlist
            </h1>
            <p class="lead mb-0" data-aos="fade-right" data-aos-delay="100">
              Items you've saved for later
            </p>
          </div>
          <div class="col-lg-4 text-lg-end" data-aos="fade-left">
            <div class="d-flex align-items-center justify-content-lg-end">
              <i class="bi bi-heart-fill fs-1 me-3"></i>
              <div>
                <h3 class="fw-bold mb-0">{{ wishlistItems.length }}</h3>
                <small class="opacity-75">Saved Items</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-5">
      <div class="container">
        <!-- Empty state -->
        <div v-if="wishlistItems.length === 0" class="text-center py-5">
          <div class="empty-wishlist" data-aos="fade-up">
            <div class="empty-wishlist-icon mb-4">
              <i class="bi bi-heart"></i>
            </div>
            <h2 class="fw-bold mb-3">Your wishlist is empty</h2>
            <p class="text-muted mb-4">Browse our products and add items to your wishlist!</p>
            <router-link to="/" class="btn btn-primary btn-lg hover-lift">
              <i class="bi bi-bag me-2"></i>
              Browse Products
            </router-link>
          </div>
        </div>

        <!-- Wishlist items -->
        <div v-else class="row g-4">
          <div 
            v-for="(item, index) in wishlistItems" 
            :key="item._id" 
            class="col-12 col-md-6 col-lg-4"
            data-aos="fade-up"
            :data-aos-delay="100 * (index % 3)"
          >
            <div class="card wishlist-card h-100">
              <div class="card-image-wrapper">
                <img :src="item.image || require('@/assets/logo.png')" class="card-img-top" :alt="item.name">
                <button @click="removeFromWishlist(item._id)" class="remove-btn" title="Remove from wishlist">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="card-body d-flex flex-column">
                <h5 class="card-title">{{ item.name }}</h5>
                <p class="card-text text-muted flex-grow-1">{{ truncateText(item.description, 80) }}</p>
                <div class="d-flex justify-content-between align-items-center mt-3">
                  <span class="h4 mb-0 price-tag">${{ item.price }}</span>
                  <router-link :to="'/products/' + item._id" class="btn btn-primary">
                    <i class="bi bi-eye me-2"></i>View
                  </router-link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Wishlist',
  data() {
    return {
      wishlistItems: []
    }
  },
  mounted() {
    this.loadWishlist()
    window.addEventListener('wishlist-updated', this.loadWishlist)
  },
  beforeUnmount() {
    window.removeEventListener('wishlist-updated', this.loadWishlist)
  },
  methods: {
    loadWishlist() {
      const stored = localStorage.getItem('wishlist')
      this.wishlistItems = stored ? JSON.parse(stored) : []
    },
    removeFromWishlist(productId) {
      const next = this.wishlistItems.filter(item => item._id !== productId)
      localStorage.setItem('wishlist', JSON.stringify(next))
      this.wishlistItems = next
      window.dispatchEvent(new Event('wishlist-updated'))
      this.$toast && this.$toast.success('Item removed from wishlist', {
        position: 'top-right',
        timeout: 2000
      })
    },
    truncateText(text, length) {
      if (!text) return ''
      if (text.length > length) {
        return text.substring(0, length) + '...'
      }
      return text
    }
  }
}
</script>

<style scoped>
/* ===== Wishlist Page - Premium Design System ===== */

/* Hero Section */
.wishlist-hero {
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
  position: relative;
  overflow: hidden;
}

.wishlist-hero::before {
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

.wishlist-hero::after {
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

.wishlist-hero .display-4 {
  font-family: var(--font-heading);
  font-weight: 700;
  letter-spacing: -0.02em;
  position: relative;
  z-index: 1;
}

.wishlist-hero .lead {
  opacity: 0.9;
  position: relative;
  z-index: 1;
}

/* Empty State */
.empty-wishlist {
  padding: 4rem 2rem;
}

.empty-wishlist-icon {
  width: 140px;
  height: 140px;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(236, 72, 153, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(239, 68, 68, 0.1);
}

.empty-wishlist-icon i {
  font-size: 4rem;
  background: linear-gradient(135deg, #EF4444, #EC4899);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.empty-wishlist h2 {
  font-family: var(--font-heading);
  color: var(--text-primary);
}

/* Wishlist Cards */
.wishlist-card {
  border: none;
  border-radius: var(--radius-xl);
  background: var(--surface);
  overflow: hidden;
  transition: var(--transition-smooth);
  box-shadow: var(--shadow-md);
}

.wishlist-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-xl);
}

.card-image-wrapper {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.wishlist-card .card-img-top {
  height: 220px;
  object-fit: contain;
  padding: 1.5rem;
  transition: var(--transition-smooth);
}

.wishlist-card:hover .card-img-top {
  transform: scale(1.05);
}

.remove-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition-fast);
  opacity: 0;
}

.wishlist-card:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  background: var(--danger);
  color: white;
  transform: scale(1.1);
}

.wishlist-card .card-body {
  padding: 1.5rem;
}

.wishlist-card .card-title {
  font-family: var(--font-heading);
  font-weight: 600;
  font-size: 1.1rem;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.wishlist-card .card-text {
  font-size: 0.9rem;
  line-height: 1.6;
}

.price-tag {
  font-family: var(--font-heading);
  font-weight: 700;
  color: var(--primary);
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-family: var(--font-body);
  padding: 0.65rem 1.25rem;
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.btn-lg {
  padding: 0.875rem 1.75rem;
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .wishlist-hero::before,
  .wishlist-hero::after {
    display: none;
  }
}

@media (max-width: 768px) {
  .wishlist-hero {
    text-align: center;
  }

  .wishlist-hero .display-4 {
    font-size: 2rem;
  }

  .wishlist-hero .d-flex {
    justify-content: center !important;
    margin-top: 1.5rem;
  }

  .wishlist-card .card-img-top {
    height: 180px;
  }
}

@media (max-width: 576px) {
  .wishlist-hero {
    padding: 2rem 0 !important;
  }

  .wishlist-hero .display-4 {
    font-size: 1.75rem;
  }

  .empty-wishlist {
    padding: 2rem 1rem;
  }

  .empty-wishlist-icon {
    width: 100px;
    height: 100px;
  }

  .empty-wishlist-icon i {
    font-size: 2.5rem;
  }

  .wishlist-card .card-body {
    padding: 1.25rem;
  }

  .remove-btn {
    opacity: 1;
  }
}
</style>