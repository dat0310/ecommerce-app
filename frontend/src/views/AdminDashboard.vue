<template>
  <div class="admin-dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 col-lg-2 px-0">
          <div class="sidebar bg-dark text-white vh-100">
            <div class="p-3">
              <h4 class="text-center mb-4">
                <i class="bi bi-shield-check me-2"></i>
                Admin Panel
              </h4>
              <nav class="nav flex-column">
                <a 
                  class="nav-link text-white" 
                  :class="{ active: activeTab === 'dashboard' }"
                  @click="activeTab = 'dashboard'"
                  href="#"
                >
                  <i class="bi bi-speedometer2 me-2"></i>
                  Dashboard
                </a>
                <a 
                  class="nav-link text-white" 
                  :class="{ active: activeTab === 'orders' }"
                  @click="activeTab = 'orders'"
                  href="#"
                >
                  <i class="bi bi-bag me-2"></i>
                  Orders
                </a>
                <a 
                  class="nav-link text-white" 
                  :class="{ active: activeTab === 'products' }"
                  @click="activeTab = 'products'"
                  href="#"
                >
                  <i class="bi bi-box me-2"></i>
                  Products
                </a>
                <a 
                  class="nav-link text-white" 
                  :class="{ active: activeTab === 'users' }"
                  @click="activeTab = 'users'"
                  href="#"
                >
                  <i class="bi bi-people me-2"></i>
                  Users
                </a>
                <a 
                  class="nav-link text-white" 
                  :class="{ active: activeTab === 'sellers' }"
                  @click="activeTab = 'sellers'"
                  href="#"
                >
                  <i class="bi bi-shop me-2"></i>
                  Sellers
                </a>
              </nav>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9 col-lg-10">
          <div class="p-4">
            <!-- Dashboard Overview -->
            <div v-if="activeTab === 'dashboard'" class="dashboard-overview">
              <h2 class="mb-4">Dashboard Overview</h2>
              
              <!-- Stats Cards -->
              <div class="row mb-4">
                <div class="col-md-3 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ stats.totalOrders || 0 }}</h4>
                          <p class="mb-0">Total Orders</p>
                        </div>
                        <i class="bi bi-bag fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-success text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ stats.pendingOrders || 0 }}</h4>
                          <p class="mb-0">Pending Orders</p>
                        </div>
                        <i class="bi bi-clock fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-info text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ stats.totalRevenue || 0 }}</h4>
                          <p class="mb-0">Total Revenue</p>
                        </div>
                        <i class="bi bi-currency-dollar fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-warning text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ pendingProducts.length }}</h4>
                          <p class="mb-0">Pending Products</p>
                        </div>
                        <i class="bi bi-box fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Orders -->
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Recent Orders</h5>
                </div>
                <div class="card-body">
                  <div v-if="recentOrders.length === 0" class="text-center py-4">
                    <p class="text-muted">No orders found</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in recentOrders.slice(0, 5)" :key="order._id">
                          <td>{{ order.orderNumber }}</td>
                          <td>{{ order.userEmail }}</td>
                          <td>${{ order.totalAmount }}</td>
                          <td>
                            <span class="badge" :class="getStatusBadgeClass(order.status)">
                              {{ order.status }}
                            </span>
                          </td>
                          <td>{{ formatDate(order.createdAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm btn-outline-primary"
                              @click="viewOrder(order)"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Orders Management -->
            <div v-if="activeTab === 'orders'" class="orders-management">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>Orders Management</h2>
                <div class="btn-group" role="group">
                  <button 
                    class="btn btn-outline-primary"
                    :class="{ active: orderFilter === 'all' }"
                    @click="orderFilter = 'all'"
                  >
                    All
                  </button>
                  <button 
                    class="btn btn-outline-primary"
                    :class="{ active: orderFilter === 'pending' }"
                    @click="orderFilter = 'pending'"
                  >
                    Pending
                  </button>
                  <button 
                    class="btn btn-outline-primary"
                    :class="{ active: orderFilter === 'confirmed' }"
                    @click="orderFilter = 'confirmed'"
                  >
                    Confirmed
                  </button>
                </div>
              </div>

              <div class="card">
                <div class="card-body">
                  <div v-if="filteredOrders.length === 0" class="text-center py-4">
                    <p class="text-muted">No orders found</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Products</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Payment</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in filteredOrders" :key="order._id">
                          <td>{{ order.orderNumber }}</td>
                          <td>{{ order.userEmail }}</td>
                          <td>{{ order.products.length }} items</td>
                          <td>${{ order.totalAmount }}</td>
                          <td>
                            <select 
                              class="form-select form-select-sm"
                              :value="order.status"
                              @change="updateOrderStatus(order._id, $event.target.value)"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>
                            <span class="badge" :class="getPaymentBadgeClass(order.paymentStatus)">
                              {{ order.paymentStatus }}
                            </span>
                          </td>
                          <td>{{ formatDate(order.createdAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm btn-outline-primary me-1"
                              @click="viewOrder(order)"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Management -->
            <div v-if="activeTab === 'products'" class="products-management">
              <h2 class="mb-4">Products Management</h2>
              
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Pending Products for Approval</h5>
                </div>
                <div class="card-body">
                  <div v-if="pendingProducts.length === 0" class="text-center py-4">
                    <p class="text-muted">No pending products</p>
                  </div>
                  <div v-else class="row">
                    <div v-for="product in pendingProducts" :key="product._id" class="col-md-6 col-lg-4 mb-3">
                      <div class="card">
                        <img 
                          :src="product.image || '/placeholder-product.jpg'" 
                          class="card-img-top" 
                          style="height: 200px; object-fit: cover;"
                          :alt="product.name"
                        >
                        <div class="card-body">
                          <h6 class="card-title">{{ product.name }}</h6>
                          <p class="card-text text-muted">{{ product.description.substring(0, 100) }}...</p>
                          <p class="card-text">
                            <strong>Price:</strong> ${{ product.price }}<br>
                            <strong>Seller:</strong> {{ product.sellerName }}<br>
                            <strong>Category:</strong> {{ product.category }}<br>
                            <strong>Submitted:</strong> {{ formatDate(product.createdAt) }}
                          </p>
                          <div class="btn-group w-100">
                            <button 
                              class="btn btn-success btn-sm"
                              @click="approveProduct(product._id)"
                            >
                              Approve
                            </button>
                            <button 
                              class="btn btn-danger btn-sm"
                              @click="rejectProduct(product._id)"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Users Management -->
            <div v-if="activeTab === 'users'" class="users-management">
              <h2 class="mb-4">Users Management</h2>
              
              <div class="card">
                <div class="card-body">
                  <div v-if="users.length === 0" class="text-center py-4">
                    <p class="text-muted">No users found</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="user in users" :key="user._id">
                          <td>{{ user.firstName }} {{ user.lastName }}</td>
                          <td>{{ user.email }}</td>
                          <td>
                            <select 
                              class="form-select form-select-sm"
                              :value="user.role"
                              @change="updateUserRole(user._id, $event.target.value)"
                            >
                              <option value="customer">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span class="badge" :class="user.isActive ? 'bg-success' : 'bg-danger'">
                              {{ user.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </td>
                          <td>{{ formatDate(user.createdAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm"
                              :class="user.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                              @click="toggleUserStatus(user._id, !user.isActive)"
                            >
                              {{ user.isActive ? 'Deactivate' : 'Activate' }}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sellers Management -->
            <div v-if="activeTab === 'sellers'" class="sellers-management">
              <h2 class="mb-4">Sellers Management</h2>
              
              <div class="card">
                <div class="card-body">
                  <div v-if="sellers.length === 0" class="text-center py-4">
                    <p class="text-muted">No sellers found</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Products</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="seller in sellers" :key="seller._id">
                          <td>{{ seller.firstName }} {{ seller.lastName }}</td>
                          <td>{{ seller.email }}</td>
                          <td>{{ getSellerProductCount(seller._id) }}</td>
                          <td>
                            <span class="badge" :class="seller.isActive ? 'bg-success' : 'bg-danger'">
                              {{ seller.isActive ? 'Active' : 'Inactive' }}
                            </span>
                          </td>
                          <td>{{ formatDate(seller.createdAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm"
                              :class="seller.isActive ? 'btn-outline-danger' : 'btn-outline-success'"
                              @click="toggleUserStatus(seller._id, !seller.isActive)"
                            >
                              {{ seller.isActive ? 'Deactivate' : 'Activate' }}
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
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
import axios from 'axios'

export default {
  name: 'AdminDashboard',
  data() {
    return {
      activeTab: 'dashboard',
      orderFilter: 'all',
      stats: {},
      orders: [],
      recentOrders: [],
      pendingProducts: [],
      users: [],
      sellers: [],
      allProducts: []
    }
  },
  computed: {
    filteredOrders() {
      if (this.orderFilter === 'all') {
        return this.orders
      }
      return this.orders.filter(order => order.status === this.orderFilter)
    }
  },
  async mounted() {
    await this.loadDashboardData()
  },
  methods: {
    async loadDashboardData() {
      try {
        await Promise.all([
          this.loadStats(),
          this.loadOrders(),
          this.loadPendingProducts(),
          this.loadUsers(),
          this.loadSellers()
        ])
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      }
    },
    async loadStats() {
      try {
        const response = await axios.get('/api/orders/stats')
        this.stats = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },
    async loadOrders() {
      try {
        const response = await axios.get('/api/orders')
        this.orders = response.data
        this.recentOrders = response.data.slice(0, 10)
      } catch (error) {
        console.error('Error loading orders:', error)
      }
    },
    async loadPendingProducts() {
      try {
        const response = await axios.get('/api/products/pending')
        this.pendingProducts = response.data
      } catch (error) {
        console.error('Error loading pending products:', error)
      }
    },
    async loadUsers() {
      try {
        const response = await axios.get('/api/users')
        this.users = response.data
      } catch (error) {
        console.error('Error loading users:', error)
      }
    },
    async loadSellers() {
      try {
        const response = await axios.get('/api/users/role/seller')
        this.sellers = response.data
      } catch (error) {
        console.error('Error loading sellers:', error)
      }
    },
    async updateOrderStatus(orderId, status) {
      try {
        await axios.patch(`/api/orders/${orderId}/status`, { status })
        await this.loadOrders()
        this.$toast.success('Order status updated successfully')
      } catch (error) {
        console.error('Error updating order status:', error)
        this.$toast.error('Failed to update order status')
      }
    },
    async approveProduct(productId) {
      try {
        await axios.patch(`/api/products/${productId}/status`, { status: 'approved' })
        await this.loadPendingProducts()
        this.$toast.success('Product approved successfully')
      } catch (error) {
        console.error('Error approving product:', error)
        this.$toast.error('Failed to approve product')
      }
    },
    async rejectProduct(productId) {
      try {
        await axios.patch(`/api/products/${productId}/status`, { status: 'rejected' })
        await this.loadPendingProducts()
        this.$toast.success('Product rejected successfully')
      } catch (error) {
        console.error('Error rejecting product:', error)
        this.$toast.error('Failed to reject product')
      }
    },
    async updateUserRole(userId, role) {
      try {
        await axios.patch(`/api/users/${userId}/role`, { role })
        await this.loadUsers()
        await this.loadSellers()
        this.$toast.success('User role updated successfully')
      } catch (error) {
        console.error('Error updating user role:', error)
        this.$toast.error('Failed to update user role')
      }
    },
    async toggleUserStatus(userId, isActive) {
      try {
        await axios.patch(`/api/users/${userId}/status`, { isActive })
        await this.loadUsers()
        await this.loadSellers()
        this.$toast.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`)
      } catch (error) {
        console.error('Error toggling user status:', error)
        this.$toast.error('Failed to update user status')
      }
    },
    viewOrder(order) {
      // Implement order detail view
      console.log('View order:', order)
    },
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'bg-warning',
        confirmed: 'bg-info',
        processing: 'bg-primary',
        shipped: 'bg-secondary',
        delivered: 'bg-success',
        cancelled: 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    getPaymentBadgeClass(status) {
      const classes = {
        pending: 'bg-warning',
        completed: 'bg-success',
        failed: 'bg-danger',
        refunded: 'bg-info'
      }
      return classes[status] || 'bg-secondary'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    getSellerProductCount(sellerId) {
      return this.allProducts.filter(product => product.sellerId === sellerId).length
    }
  }
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
}

.sidebar .nav-link {
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.sidebar .nav-link:hover,
.sidebar .nav-link.active {
  background-color: rgba(255, 255, 255, 0.1);
  color: white !important;
}

.admin-dashboard {
  margin-top: 80px;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

.btn-group .btn {
  border-radius: 6px;
}

.btn-group .btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}
</style>

