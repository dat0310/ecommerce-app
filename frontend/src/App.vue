<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <router-link to="/" class="navbar-brand">E-Commerce Store</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link to="/" class="nav-link">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/products" class="nav-link">Products</router-link>
            </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item">
              <router-link to="/cart" class="nav-link">
                Cart <span class="badge bg-primary">{{ cartItemCount }}</span>
              </router-link>
            </li>
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
            <li class="nav-item" v-if="!isAuthenticated">
              <router-link to="/register" class="nav-link">Register</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated">
              <router-link to="/profile" class="nav-link">Profile</router-link>
            </li>
            <li class="nav-item" v-if="isAuthenticated">
              <a href="#" @click="logout" class="nav-link">Logout</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <div class="container mt-4">
      <router-view/>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'App',
  computed: {
    ...mapGetters(['isAuthenticated', 'cartItemCount'])
  },
  methods: {
    ...mapActions(['logoutUser']),
    async logout() {
      await this.logoutUser()
      this.$router.push('/login')
    }
  },
  created() {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token')
    if (token) {
      this.$store.commit('SET_TOKEN', token)
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>