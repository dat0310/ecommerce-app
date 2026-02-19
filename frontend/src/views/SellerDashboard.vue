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
                                :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/50'"
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
                          :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/200'"
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
                          <label class="form-label">Product Images <small class="text-muted">(max 10)</small></label>
                          <div 
                            class="upload-zone" 
                            :class="{ 'drag-over': isDragOver }"
                            @dragover.prevent="isDragOver = true"
                            @dragleave.prevent="isDragOver = false"
                            @drop.prevent="handleDrop"
                            @click="$refs.fileInput.click()"
                            v-show="totalImageCount < 10"
                          >
                            <input 
                              type="file" 
                              ref="fileInput"
                              accept="image/jpeg,image/png,image/webp,image/gif"
                              multiple
                              @change="handleFileSelect"
                              style="display: none;"
                            >
                            <div class="upload-placeholder">
                              <i class="bi bi-cloud-arrow-up fs-1 text-muted"></i>
                              <p class="text-muted mb-1">Drag & drop images here or click to browse</p>
                              <small class="text-muted">JPEG, PNG, WebP, GIF — Max 5MB each — {{ totalImageCount }}/10 images</small>
                            </div>
                          </div>
                          <!-- Image Preview Grid -->
                          <div v-if="totalImageCount > 0" class="image-preview-grid mt-3">
                            <!-- Existing images (edit mode) -->
                            <div v-for="(img, index) in existingImages" :key="'existing-' + index" class="preview-item">
                              <img :src="img" class="preview-img" :alt="'Image ' + (index + 1)">
                              <button type="button" class="preview-remove" @click.stop="removeExistingImage(index)" title="Remove">
                                <i class="bi bi-x"></i>
                              </button>
                              <span v-if="index === 0" class="preview-badge">Main</span>
                            </div>
                            <!-- Newly selected images -->
                            <div v-for="(preview, index) in imagePreviews" :key="'new-' + index" class="preview-item">
                              <img :src="preview" class="preview-img" :alt="'New image ' + (index + 1)">
                              <button type="button" class="preview-remove" @click.stop="removeNewImage(index)" title="Remove">
                                <i class="bi bi-x"></i>
                              </button>
                              <span v-if="existingImages.length === 0 && index === 0" class="preview-badge">Main</span>
                            </div>
                            <!-- Add more slot -->
                            <div v-if="totalImageCount < 10" class="preview-item add-more" @click="$refs.fileInput.click()">
                              <i class="bi bi-plus-lg fs-3 text-muted"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Product Variants (Optional) -->
                    <div class="col-12 mt-3">
                      <div class="variant-section">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                          <div>
                            <h6 class="mb-0"><i class="bi bi-sliders me-2"></i>Product Options <span class="badge bg-secondary">Optional</span></h6>
                            <small class="text-muted">Add options like Size, Color, Material with custom pricing and stock</small>
                          </div>
                          <button type="button" class="btn btn-outline-primary btn-sm" @click="addVariantGroup">
                            <i class="bi bi-plus-lg me-1"></i>Add Option Group
                          </button>
                        </div>

                        <div v-for="(variant, vIndex) in variants" :key="vIndex" class="variant-group card mb-3">
                          <div class="card-header bg-light d-flex justify-content-between align-items-center py-2">
                            <input 
                              type="text" 
                              class="form-control form-control-sm border-0 bg-transparent fw-bold" 
                              v-model="variant.name" 
                              placeholder="Option name (e.g., Size, Color, Material)"
                              style="max-width: 300px;"
                            >
                            <button type="button" class="btn btn-sm btn-outline-danger" @click="removeVariantGroup(vIndex)" title="Remove group">
                              <i class="bi bi-trash"></i>
                            </button>
                          </div>
                          <div class="card-body p-2">
                            <table class="table table-sm table-borderless mb-2 variant-table">
                              <thead>
                                <tr class="text-muted">
                                  <th style="width: 35%">Value</th>
                                  <th style="width: 25%">Price (+/-)</th>
                                  <th style="width: 25%">Stock</th>
                                  <th style="width: 15%"></th>
                                </tr>
                              </thead>
                              <tbody>
                                <tr v-for="(opt, oIndex) in variant.options" :key="oIndex">
                                  <td>
                                    <input type="text" class="form-control form-control-sm" v-model="opt.value" placeholder="e.g., S, M, L">
                                  </td>
                                  <td>
                                    <div class="input-group input-group-sm">
                                      <span class="input-group-text">$</span>
                                      <input type="number" class="form-control form-control-sm" v-model.number="opt.priceModifier" step="0.01" placeholder="0">
                                    </div>
                                  </td>
                                  <td>
                                    <input type="number" class="form-control form-control-sm" v-model.number="opt.stock" min="0" placeholder="0">
                                  </td>
                                  <td class="text-end">
                                    <button type="button" class="btn btn-sm btn-outline-danger" @click="removeVariantOption(vIndex, oIndex)" title="Remove">
                                      <i class="bi bi-x"></i>
                                    </button>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <button type="button" class="btn btn-sm btn-outline-secondary" @click="addVariantOption(vIndex)">
                              <i class="bi bi-plus me-1"></i>Add Value
                            </button>
                          </div>
                        </div>

                        <div v-if="variants.length === 0" class="text-center py-3 text-muted border rounded bg-light">
                          <i class="bi bi-sliders fs-4 d-block mb-2"></i>
                          <small>No options added. Click "Add Option Group" to create product variations.</small>
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
                  <div v-else class="orders-list">
                    <div v-for="order in myOrders" :key="order._id" class="card mb-3 border shadow-sm">
                      <div class="card-header bg-white d-flex justify-content-between align-items-center py-3">
                        <div class="d-flex align-items-center gap-2">
                          <span class="fw-bold">{{ (order.shippingAddress && order.shippingAddress.fullName) ? order.shippingAddress.fullName : order.userEmail }}</span>
                          <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" @click="viewOrderDetails(order)">
                            <i class="bi bi-chat-dots"></i> Chat
                          </button>
                          <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" @click="viewOrderDetails(order)">
                            <i class="bi bi-shop"></i> View Shop
                          </button>
                        </div>
                        <div class="d-flex align-items-center gap-3">
                          <span class="text-uppercase text-danger fw-bold">{{ getStatusDisplayText(order.status) }}</span>
                        </div>
                      </div>
                      
                      <div class="card-body p-0">
                        <div v-for="product in order.products" :key="product.productId">
                           <div v-if="product.sellerId === ($store.getters.currentUser && $store.getters.currentUser.id)" class="d-flex p-3 border-bottom">
                            <img 
                              :src="product.image || getProductImage(product.productId)" 
                              @error="$event.target.src = 'https://via.placeholder.com/80'"
                              class="rounded me-3" 
                              style="width: 80px; height: 80px; object-fit: cover;" 
                              alt="Product Image"
                            >
                            <div class="flex-grow-1">
                              <h6 class="mb-1">{{ product.productName }}</h6>
                              <p class="text-muted small mb-1">Quantity: x{{ product.quantity }}</p>
                            </div>
                            <div class="text-end">
                              <div class="text-decoration-line-through text-muted small">{{ formatCurrency(product.price * 1.2) }}</div>
                              <div class="text-danger fw-bold">{{ formatCurrency(product.price) }}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div class="card-footer bg-white">
                        <div class="d-flex justify-content-end align-items-center mb-3">
                           <span class="me-2 text-muted">Order Total:</span>
                           <h4 class="text-danger fw-bold mb-0">
                             {{ formatCurrency(order.products.reduce((sum, p) => (p.sellerId === ($store.getters.currentUser && $store.getters.currentUser.id) ? sum + (p.price * p.quantity) : sum), 0)) }}
                           </h4>
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                           <div class="text-muted small">
                             Order ID: {{ order.orderNumber }} <br>
                             Date: {{ formatDate(order.createdAt) }}
                           </div>
                           <div class="d-flex gap-2">
                              <select 
                                class="form-select form-select-sm" 
                                style="width: auto;"
                                :value="order.status"
                                @change="updateOrderStatus(order._id, $event.target.value)"
                                :disabled="order.status === 'delivered' || order.status === 'cancelled'"
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>

                              <button 
                                v-if="order.status === 'pending'"
                                class="btn btn-danger text-white px-4"
                                @click="acceptOrder(order._id)"
                              >
                                Accept Order
                              </button>
                              <button class="btn btn-outline-secondary px-4">Contact Buyer</button>
                           </div>
                        </div>
                      </div>
                    </div>
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
      isDragOver: false,
      imageFiles: [],
      imagePreviews: [],
      existingImages: [],
      variants: [],
      productForm: {
        name: '',
        price: '',
        stock: '',
        description: '',
        category: ''
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
    },
    totalImageCount() {
      return this.existingImages.length + this.imageFiles.length
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
        const formData = new FormData()
        formData.append('name', this.productForm.name)
        formData.append('price', this.productForm.price)
        formData.append('stock', this.productForm.stock)
        formData.append('description', this.productForm.description)
        formData.append('category', this.productForm.category)
        
        // Append new image files
        for (const file of this.imageFiles) {
          formData.append('images', file)
        }
        
        // Send existing images for edit mode
        if (this.editingProduct && this.existingImages.length > 0) {
          formData.append('existingImages', JSON.stringify(this.existingImages))
        }

        // Send variants if any
        if (this.variants.length > 0) {
          const cleanVariants = this.variants
            .filter(v => v.name && v.options.length > 0)
            .map(v => ({
              name: v.name,
              options: v.options.filter(o => o.value).map(o => ({
                value: o.value,
                priceModifier: Number(o.priceModifier) || 0,
                stock: Number(o.stock) || 0
              }))
            }))
            .filter(v => v.options.length > 0)
          if (cleanVariants.length > 0) {
            formData.append('variants', JSON.stringify(cleanVariants))
          }
        }

        const config = { headers: { 'Content-Type': 'multipart/form-data' } }

        if (this.editingProduct) {
          await axios.patch(`/api/products/${this.editingProduct._id}`, formData, config)
          this.$toast.success('Product updated successfully')
        } else {
          await axios.post('/api/products', formData, config)
          this.$toast.success('Product added successfully! It is now pending admin approval.')
        }
        
        await this.loadMyProducts()
        this.cancelEdit()
      } catch (error) {
        console.error('Error saving product:', error)
        this.$toast.error(error.response?.data?.message || 'Failed to save product')
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
        category: product.category
      }
      this.imageFiles = []
      this.imagePreviews = []
      if (product.images && product.images.length > 0) {
        this.existingImages = [...product.images]
      } else if (product.image) {
        this.existingImages = [product.image]
      } else {
        this.existingImages = []
      }
      // Load existing variants
      if (product.variants && product.variants.length > 0) {
        this.variants = product.variants.map(v => ({
          name: v.name,
          options: v.options.map(o => ({
            value: o.value,
            priceModifier: o.priceModifier || 0,
            stock: o.stock || 0
          }))
        }))
      } else {
        this.variants = []
      }
      this.activeTab = 'add-product'
    },
    cancelEdit() {
      this.editingProduct = null
      this.imageFiles = []
      this.imagePreviews = []
      this.existingImages = []
      this.variants = []
      this.productForm = {
        name: '',
        price: '',
        stock: '',
        description: '',
        category: ''
      }
      this.activeTab = 'products'
    },
    handleFileSelect(event) {
      const files = Array.from(event.target.files)
      this.processFiles(files)
      if (this.$refs.fileInput) this.$refs.fileInput.value = ''
    },
    handleDrop(event) {
      this.isDragOver = false
      const files = Array.from(event.dataTransfer.files)
      this.processFiles(files)
    },
    processFiles(files) {
      const remaining = 10 - this.totalImageCount
      if (remaining <= 0) {
        this.$toast.warning('Maximum 10 images allowed')
        return
      }
      const toProcess = files.slice(0, remaining)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      
      for (const file of toProcess) {
        if (file.size > 5 * 1024 * 1024) {
          this.$toast.error(`${file.name} exceeds 5MB limit`)
          continue
        }
        if (!allowedTypes.includes(file.type)) {
          this.$toast.error(`${file.name} is not a supported image format`)
          continue
        }
        this.imageFiles.push(file)
        const reader = new FileReader()
        reader.onload = (e) => { this.imagePreviews.push(e.target.result) }
        reader.readAsDataURL(file)
      }
    },
    removeNewImage(index) {
      this.imageFiles.splice(index, 1)
      this.imagePreviews.splice(index, 1)
    },
    removeExistingImage(index) {
      this.existingImages.splice(index, 1)
    },
    addVariantGroup() {
      this.variants.push({
        name: '',
        options: [{ value: '', priceModifier: 0, stock: 0 }]
      })
    },
    removeVariantGroup(index) {
      this.variants.splice(index, 1)
    },
    addVariantOption(variantIndex) {
      this.variants[variantIndex].options.push({ value: '', priceModifier: 0, stock: 0 })
    },
    removeVariantOption(variantIndex, optionIndex) {
      this.variants[variantIndex].options.splice(optionIndex, 1)
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
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    },
    getProductImage(productId) {
      const product = this.myProducts.find(p => p._id === productId);
      return product ? (product.image || 'https://via.placeholder.com/80') : 'https://via.placeholder.com/80';
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

.upload-zone {
  border: 2px dashed #ced4da;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f8f9fa;
}

.upload-zone:hover {
  border-color: #0d6efd;
  background: #e8f0fe;
}

.upload-zone.drag-over {
  border-color: #0d6efd;
  background: #e8f0fe;
  transform: scale(1.02);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.image-preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 0.75rem;
}

.preview-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid #e9ecef;
  transition: border-color 0.2s;
}

.preview-item:hover {
  border-color: #0d6efd;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-remove {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: none;
  background: rgba(220, 53, 69, 0.9);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  opacity: 0;
  transition: opacity 0.2s;
}

.preview-item:hover .preview-remove {
  opacity: 1;
}

.preview-badge {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(13, 110, 253, 0.9);
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.preview-item.add-more {
  display: flex;
  align-items: center;
  justify-content: center;
  border-style: dashed;
  cursor: pointer;
  background: #f8f9fa;
}

.preview-item.add-more:hover {
  background: #e8f0fe;
  border-color: #0d6efd;
}

.variant-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1rem;
}

.variant-group {
  border: 1px solid #dee2e6;
  transition: box-shadow 0.2s;
}

.variant-group:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.variant-table th {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.25rem;
}

.variant-table td {
  padding: 0.25rem 0.35rem;
  vertical-align: middle;
}

.variant-table .form-control-sm {
  font-size: 0.8125rem;
}
</style>