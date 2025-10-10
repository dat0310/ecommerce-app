<template>
  <div class="home">
    <!-- Category Grid -->
    <section class="category-grid py-5">
      <div class="container">
        <h2 class="text-center mb-4">Categories</h2>
        <div class="row row-cols-2 row-cols-md-4 g-4">
          <div class="col" v-for="category in categories" :key="category.name">
            <a href="#" @click.prevent="goToCategory(category.name)" class="text-decoration-none text-dark">
              <div class="card text-center category-card h-100">
                <div class="card-body d-flex flex-column justify-content-center align-items-center">
                  <i :class="['bi', category.icon, 'fs-1', 'mb-3', 'text-primary']"></i>
                  <h6 class="mb-0">{{ category.name }}</h6>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-products py-5 bg-light">
      <div class="container">
        <h2 class="text-center mb-4">Featured Products</h2>
        <Products :limit="4" />
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-us py-5">
      <div class="container">
        <h2 class="text-center mb-4">Why Choose Us?</h2>
        <div class="row">
          <div class="col-md-4 text-center">
            <i class="bi bi-truck fs-1 text-primary"></i>
            <h5 class="mt-3">Fast Shipping</h5>
            <p>Get your orders delivered to your doorstep in no time.</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="bi bi-shield-check fs-1 text-primary"></i>
            <h5 class="mt-3">Secure Payments</h5>
            <p>Your payments are processed securely with our top-notch security.</p>
          </div>
          <div class="col-md-4 text-center">
            <i class="bi bi-headset fs-1 text-primary"></i>
            <h5 class="mt-3">24/7 Support</h5>
            <p>Our team is here to help you with any questions you may have.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Products from './Products.vue'

export default {
  name: 'Home',
  components: {
    Products
  },
  data() {
    return {
      categories: [
        { name: 'Laptop', icon: 'bi-laptop' },
        { name: 'Mobile', icon: 'bi-phone' },
        { name: 'Headphone', icon: 'bi-headphones' },
        { name: 'Speaker', icon: 'bi-speaker' },
        { name: 'Watch', icon: 'bi-watch' },
        { name: 'Camera', icon: 'bi-camera' },
        { name: 'Appliances', icon: 'bi-house' },
        { name: 'Computing & Displays', icon: 'bi-display' }
      ]
    }
  },
  methods: {
    goToCategory(category) {
      this.$router.push({ name: 'Products', query: { category } });
    }
  }
}
</script>

<style scoped>
.category-grid .category-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 1px solid #e9ecef;
}

.category-grid .category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.08);
  border-color: #0d6efd;
}

.featured-products {
  background-color: #f8f9fa;
}
</style>