<template>
  <div class="home">
    <!-- Hero Carousel -->
    <section class="hero-carousel">
      <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1" aria-label="Slide 2"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2" aria-label="Slide 3"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active" style="background-image: url('https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')">
            <div class="carousel-caption d-none d-md-block">

            </div>
          </div>
          <div class="carousel-item" style="background-image: url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')">
            <div class="carousel-caption d-none d-md-block">

            </div>
          </div>
          <div class="carousel-item" style="background-image: url('https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=1950&q=80')">
            <div class="carousel-caption d-none d-md-block">


            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="featured-products py-5">
      <div class="container">
        <h2 class="text-center mb-4">Featured Products</h2>
        <Products :limit="4" />
      </div>
    </section>

    <!-- Why Choose Us Section -->
    <section class="why-choose-us bg-light py-5">
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
  }
}
</script>

<style scoped>
.hero-carousel .carousel-item {
  height: 60vh;
  min-height: 400px;
  background-size: cover;
  background-position: center;
}

.hero-carousel .carousel-caption {
  top: 50%;
  transform: translateY(-50%);
  bottom: auto;
  padding: 2rem;
  border-radius: 0.5rem;
}
</style>
