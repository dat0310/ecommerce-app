<template>
  <div class="container py-5">
    <div class="row">
      <div class="col-12">
        <h2 class="mb-4">My Wishlist</h2>
        
        <!-- Empty state -->
        <div v-if="wishlistItems.length === 0" class="text-center py-5">
          <i class="bi bi-heart display-1 text-muted"></i>
          <h3 class="mt-3">Your wishlist is empty</h3>
          <p class="text-muted">Browse our products and add items to your wishlist!</p>
          <router-link to="/products" class="btn btn-primary">
            Browse Products
          </router-link>
        </div>

        <!-- Wishlist items -->
        <div v-else class="row g-4">
          <div v-for="item in wishlistItems" :key="item._id" class="col-12 col-md-6 col-lg-4">
            <div class="card h-100">
              <img :src="item.image || require('@/assets/logo.png')" class="card-img-top" :alt="item.name">
              <div class="card-body">
                <h5 class="card-title">{{ item.name }}</h5>
                <p class="card-text">{{ item.description }}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="h5 mb-0">${{ item.price }}</span>
                  <div class="btn-group">
                    <router-link :to="'/products/' + item._id" class="btn btn-primary">
                      View Details
                    </router-link>
                    <button @click="removeFromWishlist(item._id)" class="btn btn-outline-danger">
                      <i class="bi bi-heart-fill"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
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
    }
  }
}
</script>

<style scoped>
.card-img-top {
  height: 200px;
  object-fit: contain;
  padding: 1rem;
}
</style>