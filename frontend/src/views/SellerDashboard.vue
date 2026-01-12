<template>
  <div class="seller-dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 col-lg-2 px-0">
          <div class="sidebar bg-gradient-success text-white vh-100">
            <div class="p-4">
              <div class="text-center mb-4">
                <div class="seller-avatar mb-3">
                  <i class="bi bi-shop fs-1"></i>
                </div>
                <h5 class="mb-0 fw-bold">Seller Panel</h5>
                <small class="text-light opacity-75">Store Management</small>
              </div>
              <nav class="nav flex-column gap-2">
                <a 
                  class="nav-link seller-nav-link"
                  :class="{ active: activeTab === 'dashboard' }"
                  @click="activeTab = 'dashboard'"
                  href="#"
                >
                  <i class="bi bi-speedometer2 me-3"></i>
                  <span>Dashboard</span>
                </a>
                <a 
                  class="nav-link seller-nav-link"
                  :class="{ active: activeTab === 'products' }"
                  @click="activeTab = 'products'"
                  href="#"
                >
                  <i class="bi bi-box me-3"></i>
                  <span>My Products</span>
                </a>
                <a 
                  class="nav-link seller-nav-link"
                  :class="{ active: activeTab === 'add-product' }"
                  @click="activeTab = 'add-product'"
                  href="#"
                >
                  <i class="bi bi-plus-circle me-3"></i>
                  <span>Add Product</span>
                </a>
                <a 
                  class="nav-link seller-nav-link"
                  :class="{ active: activeTab === 'orders' }"
                  @click="activeTab = 'orders'"
                  href="#"
                >
                  <i class="bi bi-bag me-3"></i>
                  <span>Orders</span>
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
              <h2 class="mb-4">Seller Dashboard</h2>
              
              <!-- Stats Cards -->
              <div class="row mb-4">
                <div class="col-md-3 mb-3">
                  <div class="card bg-primary text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ approvedProducts.length }}</h4>
                          <p class="mb-0">Total Products</p>
                        </div>
                        <i class="bi bi-box fs-1"></i>
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
                          <p class="mb-0">Pending Approval</p>
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
                          <h4>{{ rejectedProducts.length }}</h4>
                          <p class="mb-0">Rejected</p>
                        </div>
                        <i class="bi bi-x-circle fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-secondary text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>${{ sellerRevenue.toFixed(2) }}</h4>
                          <p class="mb-0">Total Revenue</p>
                        </div>
                        <i class="bi bi-currency-dollar fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Recent Products -->
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0">Recent Products</h5>
                </div>
                <div class="card-body">
                  <div v-if="myProducts.length === 0" class="text-center py-4">
                    <p class="text-muted">No products found. <a href="#" @click="activeTab = 'add-product'">Add your first product</a></p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Price</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="product in myProducts.slice(0, 5)" :key="product._id">
                          <td>
                            <div class="d-flex align-items-center">
                              <img 
                                :src="product.image || '/placeholder-product.jpg'"
                                class="me-3" 
                                style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;"
                                :alt="product.name"
                              >
                              <div>
                                <h6 class="mb-0">{{ product.name }}</h6>
                                <small class="text-muted">{{ product.category }}</small>
                              </div>
                            </div>
                          </td>
                          <td>${{ product.price }}</td>
                          <td>{{ product.stock }}</td>
                          <td>
                            <span class="badge" :class="getStatusBadgeClass(product.status)">
                              {{ getStatusDisplayText(product.status) }}
                            </span>
                          </td>
                          <td>{{ formatDate(product.createdAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm btn-outline-primary me-1"
                              @click="editProduct(product)"
                            >
                              Edit
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-danger"
                              @click="deleteProduct(product._id)"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            <!-- My Products -->
            <div v-if="activeTab === 'products'" class="products-management">
              <div class="d-flex justify-content-between align-items-center mb-4">
                <h2>My Products</h2>
                <button 
                  class="btn btn-primary"
                  @click="activeTab = 'add-product'"
                >
                  <i class="bi bi-plus me-2"></i>
                  Add New Product
                </button>
              </div>

              <!-- Pending Products Alert -->
              <div v-if="pendingProducts.length > 0" class="alert alert-warning mb-4">
                <h6><i class="bi bi-exclamation-triangle me-2"></i>Products Pending Approval</h6>
                <p class="mb-0">
                  You have {{ pendingProducts.length }} product(s) waiting for admin approval. 
                  These products will not be visible to customers until they are approved.
                </p>
              </div>

              <div class="card">
                <div class="card-body">
                  <div v-if="myProducts.length === 0" class="text-center py-4">
                    <p class="text-muted">No products found. <a href="#" @click="activeTab = 'add-product'">Add your first product</a></p>
                  </div>
                  <div v-else class="row">
                    <div v-for="product in myProducts" :key="product._id" class="col-md-6 col-lg-4 mb-3">
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
                            <strong>Stock:</strong> {{ product.stock }}<br>
                            <strong>Category:</strong> {{ product.category }}
                          </p>
                          <div class="d-flex justify-content-between align-items-center">
                            <span class="badge" :class="getStatusBadgeClass(product.status)">
                              {{ getStatusDisplayText(product.status) }}
                            </span>
                            <div class="btn-group">
                              <button 
                                class="btn btn-sm btn-outline-primary"
                                @click="editProduct(product)"
                              >
                                Edit
                              </button>
                              <button 
                                class="btn btn-sm btn-outline-danger"
                                @click="deleteProduct(product._id)"
                              >
                                Delete
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

            <!-- Add/Edit Product -->
            <div v-if="activeTab === 'add-product'" class="add-product">
              <h2 class="mb-4">{{ editingProduct ? 'Edit Product' : 'Add New Product' }}</h2>
              
              <!-- Approval Process Info -->
              <div v-if="!editingProduct" class="alert alert-info mb-4">
                <h6><i class="bi bi-info-circle me-2"></i>Product Approval Process</h6>
                <p class="mb-0">
                  When you add a new product, it will be submitted for admin approval. 
                  Your product will appear in your dashboard with "Pending" status until an admin reviews and approves it. 
                  Only approved products will be visible to customers in the store.
                </p>
              </div>
              
              <div class="card">
                <div class="card-body">
                  <form @submit.prevent="saveProduct">
                    <div class="row">
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="name" class="form-label">Product Name *</label>
                          <input 
                            type="text" 
                            class="form-control"
                            id="name"
                            v-model="productForm.name"
                            required
                          >
                        </div>
                        <div class="mb-3">
                          <label for="price" class="form-label">Price *</label>
                          <input 
                            type="number" 
                            class="form-control"
                            id="price"
                            v-model="productForm.price"
                            min="0"
                            step="0.01"
                            required
                          >
                        </div>
                        <div class="mb-3">
                          <label for="stock" class="form-label">Stock Quantity *</label>
                          <input 
                            type="number" 
                            class="form-control"
                            id="stock"
                            v-model="productForm.stock"
                            min="0"
                            required
                          >
                        </div>
                        <div class="mb-3">
                          <label for="category" class="form-label">Category *</label>
                          <select 
                            class="form-select"
                            id="category"
                            v-model="productForm.category"
                            required
                          >
                            <option value="">Select Category</option>
                            <option value="Laptop">Laptop</option>
                            <option value="Mobile">Mobile</option>
                            <option value="Headphone">Headphone</option>
                            <option value="Speaker">Speaker</option>
                            <option value="Watch">Watch</option>
                            <option value="Camera">Camera</option>
                            <option value="Appliances">Appliances</option>
                            <option value="Computing & Displays">Computing & Displays</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                      <div class="col-md-6">
                        <div class="mb-3">
                          <label for="description" class="form-label">Description *</label>
                          <textarea 
                            class="form-control"
                            id="description"
                            v-model="productForm.description"
                            rows="4"
                            required
                          ></textarea>
                        </div>
                        <div class="mb-3">
                          <label for="image" class="form-label">Image URL</label>
                          <input 
                            type="url" 
                            class="form-control"
                            id="image"
                            v-model="productForm.image"
                            placeholder="https://example.com/image.jpg"
                          >
                        </div>
                        <div v-if="productForm.image" class="mb-3">
                          <label class="form-label">Preview</label>
                          <img 
                            :src="productForm.image"
                            class="img-fluid rounded"
                            style="max-height: 200px;"
                            :alt="productForm.name"
                          >
                        </div>
                      </div>
                    </div>
                    <div class="d-flex justify-content-end gap-2">
                      <button 
                        type="button" 
                        class="btn btn-secondary"
                        @click="cancelEdit"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        class="btn btn-primary"
                        :disabled="saving"
                      >
                        <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                        {{ editingProduct ? 'Update Product' : 'Add Product' }}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <!-- Orders -->
            <div v-if="activeTab === 'orders'" class="orders-management">
              <h2 class="mb-4">My Product Orders</h2>
              
              <div class="card">
                <div class="card-body">
                  <div v-if="myOrders.length === 0" class="text-center py-4">
                    <p class="text-muted">No orders found for your products</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Quantity</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in myOrders" :key="order._id">
                          <td>{{ order.orderNumber }}</td>
                          <td>{{ (order.shippingAddress && order.shippingAddress.fullName) ? order.shippingAddress.fullName : order.userEmail }}</td>
                          <td>
                            <div v-for="product in order.products" :key="product.productId">
                              <span v-if="product.sellerId === ($store.getters.currentUser && $store.getters.currentUser.id)">
                                {{ product.productName }}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div v-for="product in order.products" :key="product.productId">
                              <span v-if="product.sellerId === ($store.getters.currentUser && $store.getters.currentUser.id)">
                                {{ product.quantity }}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div v-for="product in order.products" :key="product.productId">
                              <span v-if="product.sellerId === ($store.getters.currentUser && $store.getters.currentUser.id)">
                                ${{ (product.price * product.quantity).toFixed(2) }}
                              </span>
                            </div>
                          </td>
                          <td>
                            <select 
                              class="form-select form-select-sm"
                              :value="order.status"
                              @change="updateOrderStatus(order._id, $event.target.value)"
                              :disabled="order.status === 'pending'"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                          <td>{{ formatDate(order.createdAt) }}</td>
                          <td>
                            <button 
                              v-if="order.status === 'pending'"
                              class="btn btn-sm btn-success me-1"
                              @click="acceptOrder(order._id)"
                            >
                              Accept
                            </button>
                            <button 
                              class="btn btn-sm btn-outline-primary"
                              @click="viewOrderDetails(order)"
                            >
                              View Details
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
  name: 'SellerDashboard',
  data() {
    return {
      activeTab: 'dashboard',
      myProducts: [],
      myOrders: [],
      sellerRevenue: 0,
      editingProduct: null,
      saving: false,
      productForm: {
        name: '',
        price: '',
        stock: '',
        description: '',
        category: '',
        image: ''
      }
    }
  },
  computed: {
    approvedProducts() {
      return this.myProducts.filter(product => product.status === 'approved')
    },
    pendingProducts() {
      return this.myProducts.filter(product => product.status === 'pending')
    },
    rejectedProducts() {
      return this.myProducts.filter(product => product.status === 'rejected')
    }
  },
  async mounted() {
    await this.loadSellerData()
  },
  methods: {
    async loadSellerData() {
      try {
        await Promise.all([
          this.loadMyProducts(),
          this.loadMyOrders()
        ])
      } catch (error) {
        console.error('Error loading seller data:', error)
      }
    },
    async loadMyProducts() {
      try {
        const response = await axios.get('/api/products/seller/my-products')
        this.myProducts = response.data
      } catch (error) {
        console.error('Error loading my products:', error)
      }
    },
    async loadMyOrders() {
      try {
        const response = await axios.get('/api/orders/seller/my-orders')
        this.myOrders = response.data
        this.calculateSellerRevenue()
      } catch (error) {
        console.error('Error loading my orders:', error)
      }
    },
    calculateSellerRevenue() {
  const sellerId = this.$store.getters.currentUser && this.$store.getters.currentUser.id
      let total = 0
      for (const order of this.myOrders) {
        if (order.paymentStatus !== 'completed') continue
        for (const product of order.products) {
          if (product.sellerId === sellerId) {
            total += (product.price || 0) * (product.quantity || 0)
          }
        }
      }
      this.sellerRevenue = total
    },
    async saveProduct() {
      this.saving = true
      try {
        if (this.editingProduct) {
          await axios.patch(`/api/products/${this.editingProduct._id}`, this.productForm)
          this.$toast.success('Product updated successfully')
        } else {
          await axios.post('/api/products', this.productForm)
          this.$toast.success('Product added successfully! It is now pending admin approval.')
        }
        
        await this.loadMyProducts()
        this.cancelEdit()
      } catch (error) {
        console.error('Error saving product:', error)
        this.$toast.error('Failed to save product')
      } finally {
        this.saving = false
      }
    },
    editProduct(product) {
      this.editingProduct = product
      this.productForm = {
        name: product.name,
        price: product.price,
        stock: product.stock,
        description: product.description,
        category: product.category,
        image: product.image
      }
      this.activeTab = 'add-product'
    },
    cancelEdit() {
      this.editingProduct = null
      this.productForm = {
        name: '',
        price: '',
        stock: '',
        description: '',
        category: '',
        image: ''
      }
      this.activeTab = 'products'
    },
    async deleteProduct(productId) {
      if (confirm('Are you sure you want to delete this product?')) {
        try {
          await axios.delete(`/api/products/${productId}`)
          await this.loadMyProducts()
          this.$toast.success('Product deleted successfully')
        } catch (error) {
          console.error('Error deleting product:', error)
          this.$toast.error('Failed to delete product')
        }
      }
    },
    async updateOrderStatus(orderId, status) {
      try {
        await axios.patch(`/api/orders/${orderId}/status`, { status })
        await this.loadMyOrders()
        this.$toast.success('Order status updated successfully')
      } catch (error) {
        console.error('Error updating order status:', error)
        this.$toast.error('Failed to update order status')
      }
    },
    async acceptOrder(orderId) {
      try {
        await axios.patch(`/api/orders/${orderId}/accept`)
        await this.loadMyOrders()
        this.$toast.success('Order accepted successfully')
      } catch (error) {
        console.error('Error accepting order:', error)
        this.$toast.error('Failed to accept order')
      }
    },
    getStatusBadgeClass(status) {
      const classes = {
        pending: 'bg-warning',
        approved: 'bg-success',
        rejected: 'bg-danger',
        confirmed: 'bg-info',
        processing: 'bg-primary',
        shipped: 'bg-secondary',
        delivered: 'bg-success',
        cancelled: 'bg-danger'
      }
      return classes[status] || 'bg-secondary'
    },
    getStatusDisplayText(status) {
      const statusText = {
        pending: 'Pending Approval',
        approved: 'Approved',
        rejected: 'Rejected'
      }
      return statusText[status] || status
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    viewOrderDetails(order) {
      const sellerProducts = order.products.filter(product => 
  product.sellerId === (this.$store.getters.currentUser && this.$store.getters.currentUser.id)
      )
      
      let details = `Order #${order.orderNumber}\n`
      const customerName = (order.shippingAddress && order.shippingAddress.fullName) ? order.shippingAddress.fullName : order.userEmail
      details += `Customer: ${customerName}\n`
      details += `Status: ${order.status}\n`
      details += `Date: ${this.formatDate(order.createdAt)}\n\n`
      details += `Your Products:\n`
      
      sellerProducts.forEach(product => {
        details += `• ${product.productName} - Qty: ${product.quantity} - $${(product.price * product.quantity).toFixed(2)}\n`
      })
      
      this.$toast.info('Order Details', {
        description: details,
        duration: 6000
      })
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

.bg-gradient-success {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
}

.seller-avatar {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.seller-nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.seller-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff !important;
  transform: translateX(4px);
}

.seller-nav-link.active {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.seller-dashboard {
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
</style>