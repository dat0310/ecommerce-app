<template>
  <div class="admin-dashboard">
    <div class="container-fluid">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 col-lg-2 px-0">
          <div class="sidebar bg-gradient-primary text-white">
            <div class="p-3 pt-2">
              <div class="text-center mb-3">
                <h5 class="mb-0 fw-bold">Admin Panel</h5>
                <small class="text-light opacity-75">Management Dashboard</small>
              </div>
              <nav class="nav flex-column gap-2">
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'dashboard' }"
                  @click="activeTab = 'dashboard'"
                  href="#"
                >
                  <i class="bi bi-speedometer2 me-3"></i>
                  <span>Dashboard</span>
                </a>
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'orders' }"
                  @click="activeTab = 'orders'"
                  href="#"
                >
                  <i class="bi bi-bag me-3"></i>
                  <span>Orders</span>
                </a>
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'products' }"
                  @click="activeTab = 'products'"
                  href="#"
                >
                  <i class="bi bi-box me-3"></i>
                  <span>Products</span>
                </a>
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'users' }"
                  @click="activeTab = 'users'"
                  href="#"
                >
                  <i class="bi bi-people me-3"></i>
                  <span>Users</span>
                </a>
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'vouchers' }"
                  @click="activeTab = 'vouchers'"
                  href="#"
                >
                  <i class="bi bi-gift me-3"></i>
                  <span>Vouchers</span>
                </a>
                <a 
                  class="nav-link admin-nav-link" 
                  :class="{ active: activeTab === 'disputes' }"
                  @click="activeTab = 'disputes'"
                  href="#"
                >
                  <i class="bi bi-shield-exclamation me-3"></i>
                  <span>Disputes</span>
                  <span v-if="openDisputes.length > 0" class="badge bg-danger ms-auto">{{ openDisputes.length }}</span>
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
                          <h4>{{ approvedProducts.length }}</h4>
                          <p class="mb-0">Total Products</p>
                        </div>
                        <i class="bi bi-box fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-info text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ orders.length }}</h4>
                          <p class="mb-0">Total Orders</p>
                        </div>
                        <i class="bi bi-bag fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-warning text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>{{ openDisputes.length }}</h4>
                          <p class="mb-0">Open Disputes</p>
                        </div>
                        <i class="bi bi-shield-exclamation fs-1"></i>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3 mb-3">
                  <div class="card bg-success text-white">
                    <div class="card-body">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h4>${{ (stats.totalRevenue || 0).toFixed(2) }}</h4>
                          <p class="mb-0">Total Revenue</p>
                        </div>
                        <i class="bi bi-currency-dollar fs-1"></i>
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
                            <span class="badge" :class="getStatusBadgeClass(order.status)">
                              {{ order.status }}
                            </span>
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
                          :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/200'" 
                          class="card-img-top product-card-img"
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

            <!-- Vouchers Management -->
            <div v-if="activeTab === 'vouchers'" class="vouchers-management">
              <!-- Header -->
              <div class="voucher-header">
                <div class="header-content">
                  <h2 class="header-title">
                    <i class="bi bi-ticket-perforated-fill"></i>
                    Vouchers Management
                  </h2>
                  <p class="header-subtitle">Create and manage discount vouchers for your customers</p>
                </div>
                <div class="header-stats">
                  <div class="stat-item">
                    <span class="stat-value">{{ vouchers.length }}</span>
                    <span class="stat-label">Total Vouchers</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-value text-success">{{ vouchers.filter(v => v.isActive).length }}</span>
                    <span class="stat-label">Active</span>
                  </div>
                </div>
              </div>

              <!-- Create New Voucher Card -->
              <div class="voucher-create-card">
                <form @submit.prevent="createVoucher" class="voucher-form">
                  <div class="form-grid">
                    <div class="form-group">
                      <label class="form-label-modern">
                        <i class="bi bi-upc-scan me-2"></i>Voucher Code
                      </label>
                      <input 
                        type="text" 
                        class="form-control-modern" 
                        v-model="newVoucher.code" 
                        placeholder="e.g. SUMMER2024"
                        required
                      >
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label-modern">
                        <i class="bi bi-tag me-2"></i>Discount Type
                      </label>
                      <select class="form-control-modern" v-model="newVoucher.discountType">
                        <option value="percentage">Percentage</option>
                        <option value="fixed">Fixed Amount</option>
                      </select>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label-modern">
                        <i class="bi bi-cash-stack me-2"></i>Discount Value
                      </label>
                      <div class="value-input-wrapper">
                        <span class="value-prefix">{{ newVoucher.discountType === 'percentage' ? '%' : '$' }}</span>
                        <input 
                          type="number" 
                          class="form-control-modern value-input" 
                          v-model="newVoucher.discountValue" 
                          placeholder="0"
                          min="0"
                          required
                        >
                      </div>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label-modern">
                        <i class="bi bi-coin me-2"></i>Coin Fee
                      </label>
                      <div class="value-input-wrapper">
                        <span class="value-prefix"><i class="bi bi-coin"></i></span>
                        <input 
                          type="number" 
                          class="form-control-modern value-input" 
                          v-model="newVoucher.fee" 
                          placeholder="0"
                          min="0"
                          title="Set to 0 for free voucher"
                          required
                        >
                      </div>
                      <small class="form-hint">Set to 0 for free voucher</small>
                    </div>
                    
                    <div class="form-group">
                      <label class="form-label-modern">
                        <i class="bi bi-calendar-event me-2"></i>Expiry Date
                      </label>
                      <input 
                        type="date" 
                        class="form-control-modern" 
                        v-model="newVoucher.expiryDate" 
                        required
                      >
                    </div>
                  </div>
                  
                  <div class="form-actions">
                    <button type="submit" class="btn-create-voucher">
                      <i class="bi bi-plus-lg me-2"></i>
                      Create Voucher
                    </button>
                  </div>
                </form>
              </div>

              <!-- Existing Vouchers -->
              <div class="vouchers-list-section">
                <div class="section-header">
                  <h5 class="section-title">
                    <i class="bi bi-collection me-2"></i>
                    Existing Vouchers
                  </h5>
                  <div class="section-actions">
                    <div class="search-box">
                      <i class="bi bi-search"></i>
                      <input type="text" placeholder="Search vouchers..." v-model="voucherSearch">
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-if="filteredVouchers.length === 0" class="empty-vouchers">
                  <div class="empty-icon">
                    <i class="bi bi-ticket-perforated"></i>
                  </div>
                  <h4>No vouchers found</h4>
                  <p>Create your first voucher to get started</p>
                </div>

                <!-- Vouchers Grid -->
                <div v-else class="vouchers-grid">
                  <div 
                    v-for="voucher in filteredVouchers" 
                    :key="voucher._id" 
                    class="voucher-card"
                    :class="{ 'expired': !voucher.isActive }"
                  >
                    <div class="voucher-card-left">
                      <div class="voucher-discount">
                        <span class="discount-value">{{ voucher.discountValue }}</span>
                        <span class="discount-type">{{ voucher.discountType === 'percentage' ? '%' : '$' }}</span>
                      </div>
                      <span class="discount-label">{{ voucher.discountType === 'percentage' ? 'OFF' : 'OFF' }}</span>
                    </div>
                    <div class="voucher-card-right">
                      <div class="voucher-code">{{ voucher.code }}</div>
                      <div class="voucher-details">
                        <span class="detail-item">
                          <i class="bi bi-coin"></i>
                          {{ voucher.fee || 0 }} coins
                        </span>
                        <span class="detail-item">
                          <i class="bi bi-calendar"></i>
                          {{ formatDate(voucher.expiryDate) }}
                        </span>
                      </div>
                      <div class="voucher-footer">
                        <span class="status-badge" :class="voucher.isActive ? 'active' : 'inactive'">
                          <i :class="voucher.isActive ? 'bi bi-check-circle-fill' : 'bi bi-x-circle-fill'"></i>
                          {{ voucher.isActive ? 'Active' : 'Expired' }}
                        </span>
                        <button class="btn-delete-voucher" @click="deleteVoucher(voucher._id)">
                          <i class="bi bi-trash3"></i>
                        </button>
                      </div>
                    </div>
                    <div class="voucher-perforation"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Disputes Management -->
            <div v-if="activeTab === 'disputes'" class="disputes-management">
              <h2 class="mb-4">Disputes Management</h2>

              <!-- Open Disputes -->
              <div class="card mb-4">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h5 class="mb-0"><i class="bi bi-shield-exclamation text-warning me-2"></i>Open Disputes</h5>
                  <span class="badge bg-danger">{{ openDisputes.length }} pending</span>
                </div>
                <div class="card-body">
                  <div v-if="openDisputes.length === 0" class="text-center py-4">
                    <i class="bi bi-check-circle text-success fs-1 d-block mb-2"></i>
                    <p class="text-muted">No open disputes. All clear!</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Buyer</th>
                          <th>Seller</th>
                          <th>Reason</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in openDisputes" :key="order._id">
                          <td>
                            <span class="fw-bold">{{ order.orderNumber }}</span>
                          </td>
                          <td>{{ order.userEmail }}</td>
                          <td>{{ order.products[0]?.sellerName || 'N/A' }}</td>
                          <td>
                            <span class="small">
                              {{ order.refundInfo?.reason || 'Not specified' }}
                            </span>
                            <br>
                            <span class="text-muted small" v-if="order.refundInfo?.description">
                              {{ order.refundInfo.description.substring(0, 50) }}{{ order.refundInfo.description.length > 50 ? '...' : '' }}
                            </span>
                          </td>
                          <td class="fw-bold text-danger">${{ order.totalAmount }}</td>
                          <td class="small">{{ formatDate(order.refundInfo?.requestedAt || order.updatedAt) }}</td>
                          <td>
                            <button 
                              class="btn btn-sm btn-primary me-1"
                              @click="openDisputeResolveModal(order)"
                            >
                              <i class="bi bi-gavel me-1"></i>Resolve
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <!-- Resolved Disputes History -->
              <div class="card">
                <div class="card-header">
                  <h5 class="mb-0"><i class="bi bi-clock-history me-2"></i>Resolved Disputes</h5>
                </div>
                <div class="card-body">
                  <div v-if="resolvedDisputes.length === 0" class="text-center py-4">
                    <p class="text-muted">No resolved disputes yet.</p>
                  </div>
                  <div v-else class="table-responsive">
                    <table class="table table-hover">
                      <thead>
                        <tr>
                          <th>Order #</th>
                          <th>Buyer</th>
                          <th>Amount</th>
                          <th>Resolution</th>
                          <th>Admin Note</th>
                          <th>Resolved Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="order in resolvedDisputes" :key="order._id">
                          <td>{{ order.orderNumber }}</td>
                          <td>{{ order.userEmail }}</td>
                          <td>${{ order.totalAmount }}</td>
                          <td>
                            <span v-if="order.refundInfo?.adminResolution === 'refund'" class="badge bg-success">Refund Approved</span>
                            <span v-else class="badge bg-secondary">Refund Denied</span>
                          </td>
                          <td class="small">{{ order.refundInfo?.adminNote || '-' }}</td>
                          <td class="small">{{ formatDate(order.refundInfo?.adminResolvedAt || order.updatedAt) }}</td>
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

    <!-- Order Details Modal -->
    <div v-if="showOrderModal && selectedOrder" class="modal-overlay-admin" @click.self="closeOrderModal">
      <div class="modal-content-admin" style="max-width: 600px;">
        <div class="modal-header-admin">
          <h5 class="mb-0">
            <i class="bi bi-receipt me-2"></i>Order Details (#{{ selectedOrder.orderNumber }})
          </h5>
          <button class="btn-close" @click="closeOrderModal"></button>
        </div>
        <div class="modal-body-admin" style="max-height: 70vh; overflow-y: auto;">
          <div class="row mb-4">
            <div class="col-md-6">
              <h6 class="text-muted mb-2">Customer Info</h6>
              <p class="mb-1"><strong>Email:</strong> {{ selectedOrder.userEmail }}</p>
              <p class="mb-1" v-if="selectedOrder.shippingAddress">
                <strong>Address:</strong><br>
                {{ selectedOrder.shippingAddress.street }}<br>
                {{ selectedOrder.shippingAddress.city }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.zipCode }}<br>
                {{ selectedOrder.shippingAddress.country }}
              </p>
            </div>
            <div class="col-md-6">
              <h6 class="text-muted mb-2">Order Info</h6>
              <p class="mb-1"><strong>Date:</strong> {{ formatDate(selectedOrder.createdAt) }}</p>
              <p class="mb-1">
                <strong>Status:</strong>
                <span class="badge ms-2" :class="getStatusBadgeClass(selectedOrder.status)">
                  {{ selectedOrder.status }}
                </span>
              </p>
              <p class="mb-1">
                <strong>Payment:</strong>
                <span class="badge ms-2" :class="getPaymentBadgeClass(selectedOrder.paymentStatus)">
                  {{ selectedOrder.paymentStatus }}
                </span>
              </p>
            </div>
          </div>

          <h6 class="text-muted mb-3">Products</h6>
          <div class="list-group mb-4">
            <div v-for="product in selectedOrder.products" :key="product.productId" class="list-group-item">
              <div class="d-flex align-items-center">
                <img :src="product.image || 'https://via.placeholder.com/60'" class="rounded me-3" style="width: 60px; height: 60px; object-fit: cover;">
                <div class="flex-grow-1">
                  <h6 class="mb-1">{{ product.productName || 'Unknown Product' }}</h6>
                  <div class="d-flex justify-content-between text-muted small">
                    <span>Qty: {{ product.quantity }}</span>
                    <span>${{ product.price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between align-items-center border-top pt-3">
            <h5 class="mb-0">Total Amount:</h5>
            <h5 class="text-primary mb-0">${{ selectedOrder.totalAmount }}</h5>
          </div>
        </div>
        <div class="modal-footer-admin">
          <button class="btn btn-outline-secondary" @click="closeOrderModal">Close</button>
        </div>
      </div>
    </div>

    <!-- Dispute Resolve Modal -->
    <div v-if="showDisputeModal && disputeOrder" class="modal-overlay-admin" @click.self="closeDisputeModal">
      <div class="modal-content-admin" style="max-width: 600px;">
        <div class="modal-header-admin">
          <h5 class="mb-0">
            <i class="bi bi-gavel me-2"></i>Resolve Dispute
          </h5>
          <button class="btn-close" @click="closeDisputeModal"></button>
        </div>
        <div class="modal-body-admin" style="max-height: 70vh; overflow-y: auto;">
          <!-- Order Info -->
          <div class="p-3 bg-light rounded mb-3">
            <div class="row">
              <div class="col-6">
                <div class="small text-muted">Order</div>
                <div class="fw-bold">{{ disputeOrder.orderNumber }}</div>
              </div>
              <div class="col-6 text-end">
                <div class="small text-muted">Amount</div>
                <div class="fw-bold text-danger">${{ disputeOrder.totalAmount }}</div>
              </div>
            </div>
          </div>

          <!-- Buyer's Reason -->
          <div class="mb-3">
            <h6 class="fw-bold text-primary"><i class="bi bi-person me-1"></i>Buyer's Reason</h6>
            <div class="p-3 border rounded">
              <div><strong>Reason:</strong> {{ disputeOrder.refundInfo?.reason || 'Not specified' }}</div>
              <div v-if="disputeOrder.refundInfo?.description" class="text-muted mt-1">{{ disputeOrder.refundInfo.description }}</div>
            </div>
          </div>

          <!-- Seller's Response -->
          <div class="mb-3">
            <h6 class="fw-bold text-success"><i class="bi bi-shop me-1"></i>Seller's Response</h6>
            <div class="p-3 border rounded">
              <div>
                <span class="badge bg-danger">Rejected</span>
              </div>
              <div v-if="disputeOrder.refundInfo?.sellerNote" class="text-muted mt-1">Note: {{ disputeOrder.refundInfo.sellerNote }}</div>
              <div v-else class="text-muted mt-1">No note provided</div>
            </div>
          </div>

          <!-- Products -->
          <div class="mb-3">
            <h6 class="fw-bold"><i class="bi bi-box me-1"></i>Products</h6>
            <div v-for="product in disputeOrder.products" :key="product.productId" class="d-flex align-items-center p-2 border rounded mb-2">
              <img :src="product.image || 'https://via.placeholder.com/40'" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;">
              <div class="flex-grow-1">
                <div class="small fw-bold">{{ product.productName || 'Product' }}</div>
                <div class="small text-muted">x{{ product.quantity }} • ${{ product.price }}</div>
              </div>
            </div>
          </div>

          <hr>

          <!-- Admin Decision -->
          <div class="mb-3">
            <h6 class="fw-bold"><i class="bi bi-shield-check me-1"></i>Your Decision</h6>
            <div class="d-flex gap-2 mb-3">
              <button 
                class="btn flex-grow-1"
                :class="disputeResolution === 'refund' ? 'btn-success' : 'btn-outline-success'"
                @click="disputeResolution = 'refund'"
              >
                <i class="bi bi-check-circle me-1"></i>Approve Refund
              </button>
              <button 
                class="btn flex-grow-1"
                :class="disputeResolution === 'reject' ? 'btn-danger' : 'btn-outline-danger'"
                @click="disputeResolution = 'reject'"
              >
                <i class="bi bi-x-circle me-1"></i>Deny Refund
              </button>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label fw-bold">Admin Note</label>
            <textarea v-model="disputeNote" class="form-control" rows="3" placeholder="Explain your decision..."></textarea>
          </div>
        </div>
        <div class="modal-footer-admin">
          <button class="btn btn-outline-secondary" @click="closeDisputeModal">Cancel</button>
          <button 
            class="btn"
            :class="disputeResolution === 'refund' ? 'btn-success' : 'btn-danger'"
            :disabled="!disputeResolution || disputeSubmitting"
            @click="submitDisputeResolution"
          >
            <span v-if="disputeSubmitting"><i class="bi bi-hourglass-split me-1"></i>Processing...</span>
            <span v-else>Confirm Resolution</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance } from 'vue'
import { useQuery, useMutation } from '@tanstack/vue-query'
import axios from 'axios'

const { proxy } = getCurrentInstance()

const activeTab = ref('dashboard')
const orderFilter = ref('all')
const voucherSearch = ref('')
const newVoucher = ref({
  code: '',
  discountType: 'percentage',
  discountValue: null,
  fee: 0,
  expiryDate: ''
})

const showDisputeModal = ref(false)
const disputeOrder = ref(null)
const disputeResolution = ref('')
const disputeNote = ref('')

const showOrderModal = ref(false)
const selectedOrder = ref(null)

// Queries
const { data: statsData } = useQuery({
  queryKey: ['adminStats'],
  queryFn: async () => {
    const { data } = await axios.get('/api/orders/stats')
    return data
  }
})
const stats = computed(() => statsData.value || {})

const { data: ordersData, refetch: refetchOrders } = useQuery({
  queryKey: ['adminOrders'],
  queryFn: async () => {
    const { data } = await axios.get('/api/orders')
    return data
  }
})
const orders = computed(() => ordersData.value || [])
const recentOrders = computed(() => orders.value.slice(0, 10))

const { data: pendingProductsData, refetch: refetchPendingProducts } = useQuery({
  queryKey: ['adminPendingProducts'],
  queryFn: async () => {
    const { data } = await axios.get('/api/products/pending')
    return data
  }
})
const pendingProducts = computed(() => pendingProductsData.value || [])

const { data: usersData, refetch: refetchUsers } = useQuery({
  queryKey: ['adminUsers'],
  queryFn: async () => {
    const { data } = await axios.get('/api/users')
    return data
  }
})
const users = computed(() => usersData.value || [])

const { data: allProductsData, refetch: refetchAllProducts } = useQuery({
  queryKey: ['adminAllProducts'],
  queryFn: async () => {
    const { data } = await axios.get('/api/products/admin/all')
    return data
  }
})
const allProducts = computed(() => allProductsData.value || [])

const { data: vouchersData, refetch: refetchVouchers } = useQuery({
  queryKey: ['adminVouchers'],
  queryFn: async () => {
    const { data } = await axios.get('/api/vouchers')
    return data
  }
})
const vouchers = computed(() => vouchersData.value || [])

// Computed properties
const filteredOrders = computed(() => {
  if (orderFilter.value === 'all') return orders.value
  return orders.value.filter(order => order.status === orderFilter.value)
})

const approvedProducts = computed(() => allProducts.value.filter(product => product.status === 'approved'))

const openDisputes = computed(() => orders.value.filter(order => order.status === 'dispute_open'))

const resolvedDisputes = computed(() => orders.value.filter(order => 
  (order.status === 'refund_approved' || order.status === 'dispute_resolved') 
  && order.refundInfo?.adminResolution
))

const filteredVouchers = computed(() => {
  if (!voucherSearch.value) return vouchers.value
  const search = voucherSearch.value.toLowerCase()
  return vouchers.value.filter(v => v.code.toLowerCase().includes(search))
})

// Mutations
const updateProductStatusMutation = useMutation({
  mutationFn: async ({ productId, status }) => {
    await axios.patch(`/api/products/${productId}/status`, { status })
    return status
  },
  onSuccess: (status) => {
    proxy.$toast?.success(`Product ${status} successfully`, { position: 'top-right', timeout: 3000 })
    refetchPendingProducts()
    refetchAllProducts()
  },
  onError: (error, variables) => {
    console.error(`Error ${variables.status}ing product:`, error)
    proxy.$toast?.error(`Failed to ${variables.status} product`, { position: 'top-right', timeout: 3000 })
  }
})

const updateUserRoleMutation = useMutation({
  mutationFn: async ({ userId, role }) => {
    await axios.patch(`/api/users/${userId}/role`, { role })
  },
  onSuccess: () => {
    proxy.$toast?.success('User role updated successfully', { position: 'top-right', timeout: 3000 })
    refetchUsers()
  },
  onError: (error) => {
    console.error('Error updating user role:', error)
    proxy.$toast?.error('Failed to update user role', { position: 'top-right', timeout: 3000 })
  }
})

const toggleUserStatusMutation = useMutation({
  mutationFn: async ({ userId, isActive }) => {
    await axios.patch(`/api/users/${userId}/status`, { isActive })
    return isActive
  },
  onSuccess: (isActive) => {
    proxy.$toast?.success(`User ${isActive ? 'activated' : 'deactivated'} successfully`, { position: 'top-right', timeout: 3000 })
    refetchUsers()
  },
  onError: (error) => {
    console.error('Error toggling user status:', error)
    proxy.$toast?.error('Failed to update user status', { position: 'top-right', timeout: 3000 })
  }
})

const createVoucherMutation = useMutation({
  mutationFn: async (voucher) => {
    await axios.post('/api/vouchers', voucher)
  },
  onSuccess: () => {
    proxy.$toast?.success('Voucher created successfully', { position: 'top-right', timeout: 3000 })
    refetchVouchers()
    newVoucher.value = {
      code: '',
      discountType: 'percentage',
      discountValue: null,
      fee: 0,
      expiryDate: ''
    }
  },
  onError: (error) => {
    console.error('Error creating voucher:', error)
    proxy.$toast?.error('Failed to create voucher', { position: 'top-right', timeout: 3000 })
  }
})

const deleteVoucherMutation = useMutation({
  mutationFn: async (voucherId) => {
    await axios.delete(`/api/vouchers/${voucherId}`)
  },
  onSuccess: () => {
    proxy.$toast?.success('Voucher deleted successfully', { position: 'top-right', timeout: 3000 })
    refetchVouchers()
  },
  onError: (error) => {
    console.error('Error deleting voucher:', error)
    proxy.$toast?.error('Failed to delete voucher', { position: 'top-right', timeout: 3000 })
  }
})

const resolveDisputeMutation = useMutation({
  mutationFn: async () => {
    const order = disputeOrder.value
    if (!order || !disputeResolution.value) return
    await axios.patch(`/api/orders/${order._id}/resolve-dispute`, {
      resolution: disputeResolution.value,
      note: disputeNote.value
    })
  },
  onSuccess: () => {
    const msg = disputeResolution.value === 'refund' 
      ? 'Dispute resolved - Refund approved for buyer' 
      : 'Dispute resolved - Refund denied'
    proxy.$toast?.success(msg, { position: 'top-right', timeout: 3000 })
    refetchOrders()
    closeDisputeModal()
  },
  onError: (error) => {
    console.error('Error resolving dispute:', error)
    proxy.$toast?.error(error.response?.data?.message || 'Failed to resolve dispute', { position: 'top-right', timeout: 3000 })
  }
})

const disputeSubmitting = computed(() => resolveDisputeMutation.isPending.value)

// Methods
const approveProduct = (productId) => updateProductStatusMutation.mutate({ productId, status: 'approved' })
const rejectProduct = (productId) => updateProductStatusMutation.mutate({ productId, status: 'rejected' })
const updateUserRole = (userId, role) => updateUserRoleMutation.mutate({ userId, role })
const toggleUserStatus = (userId, isActive) => toggleUserStatusMutation.mutate({ userId, isActive })

const viewOrder = (order) => {
  selectedOrder.value = order
  showOrderModal.value = true
}

const closeOrderModal = () => {
  showOrderModal.value = false
  setTimeout(() => {
    selectedOrder.value = null
  }, 300)
}

const getStatusBadgeClass = (status) => {
  const classes = {
    pending: 'bg-warning',
    confirmed: 'bg-info',
    processing: 'bg-primary',
    shipped: 'bg-secondary',
    delivered: 'bg-success',
    cancelled: 'bg-danger',
    refund_requested: 'bg-warning',
    refund_approved: 'bg-success',
    refund_rejected: 'bg-danger',
    dispute_open: 'bg-info',
    dispute_resolved: 'bg-secondary'
  }
  return classes[status] || 'bg-secondary'
}

const getPaymentBadgeClass = (status) => {
  const classes = {
    pending: 'bg-warning',
    completed: 'bg-success',
    failed: 'bg-danger',
    refunded: 'bg-info'
  }
  return classes[status] || 'bg-secondary'
}

const formatDate = (date) => new Date(date).toLocaleDateString()

const generateVoucherCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  newVoucher.value.code = code
}

const createVoucher = () => createVoucherMutation.mutate(newVoucher.value)

const deleteVoucher = (voucherId) => {
  if (confirm('Are you sure you want to delete this voucher?')) {
    deleteVoucherMutation.mutate(voucherId)
  }
}

const getSellerProductCount = (sellerId) => {
  if (!allProducts.value) return 0
  return allProducts.value.filter(p => p.sellerId === sellerId).length
}

const openDisputeResolveModal = (order) => {
  disputeOrder.value = order
  disputeResolution.value = ''
  disputeNote.value = ''
  showDisputeModal.value = true
}

const closeDisputeModal = () => {
  showDisputeModal.value = false
  disputeOrder.value = null
  disputeResolution.value = ''
  disputeNote.value = ''
}

const submitDisputeResolution = () => resolveDisputeMutation.mutate()
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 90px;
  left: 0;
  height: calc(100vh - 90px);
  z-index: 100;
}

.sidebar .nav-link {
  border-radius: 8px;
  margin-bottom: 5px;
  transition: all 0.3s ease;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.admin-nav-link {
  color: rgba(255, 255, 255, 0.8) !important;
  border-radius: 12px;
  padding: 12px 16px;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  font-weight: 500;
}

.admin-nav-link:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: #ffffff !important;
  transform: translateX(4px);
}

.admin-nav-link.active {
  background-color: rgba(255, 255, 255, 0.25);
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.admin-dashboard {
  margin-top: 80px;
}

.card {
  border: none;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 12px;
}

.product-card-img {
  width: 100%;
  height: auto;
  max-height: 250px;
  object-fit: contain;
  background: #ffffff;
  border-radius: 12px 12px 0 0;
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

/* Dispute Resolution Modal */
.modal-overlay-admin {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(4px);
}

.modal-content-admin {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-body-admin {
  padding: 1.5rem;
}

.modal-footer-admin {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* ===== Voucher Management Styles ===== */
.vouchers-management {
  padding: 0;
}

.voucher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px;
  color: white;
}

.header-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-title i {
  font-size: 1.5rem;
}

.header-subtitle {
  opacity: 0.85;
  margin: 0;
  font-size: 0.95rem;
}

.header-stats {
  display: flex;
  gap: 2rem;
}

.stat-item {
  text-align: center;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.stat-value {
  display: block;
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.8rem;
  opacity: 0.85;
}

/* Create Voucher Card */
.voucher-create-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.create-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.create-icon {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
}

.create-title {
  margin: 0;
  font-weight: 700;
  color: #1a1a2e;
}

.create-subtitle {
  margin: 0.25rem 0 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.voucher-form .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label-modern {
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.form-label-modern i {
  color: #667eea;
}

.form-control-modern {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #f8f9fa;
}

.form-control-modern:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-with-icon {
  position: relative;
  display: flex;
  gap: 0.5rem;
}

.input-with-icon .form-control-modern {
  flex: 1;
}

.generate-btn {
  width: 44px;
  height: 44px;
  border: 2px solid #667eea;
  background: white;
  border-radius: 10px;
  color: #667eea;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.generate-btn:hover {
  background: #667eea;
  color: white;
}

.type-selector {
  display: flex;
  gap: 0.75rem;
}

.type-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #f8f9fa;
  font-weight: 500;
  color: #6c757d;
}

.type-option input {
  display: none;
}

.type-option.active {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
}

.type-option:hover:not(.active) {
  border-color: #adb5bd;
}

.value-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.value-prefix {
  position: absolute;
  left: 1rem;
  color: #667eea;
  font-weight: 600;
  font-size: 1rem;
}

.value-input {
  padding-left: 2.5rem !important;
}

.form-hint {
  color: #9ca3af;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.btn-create-voucher {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
}

.btn-create-voucher:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

/* Vouchers List Section */
.vouchers-list-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-title {
  margin: 0;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
}

.section-title i {
  color: #667eea;
}

.search-box {
  position: relative;
  width: 250px;
}

.search-box i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-box input {
  width: 100%;
  padding: 0.625rem 1rem 0.625rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.search-box input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

/* Empty State */
.empty-vouchers {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon i {
  font-size: 2.5rem;
  color: #9ca3af;
}

.empty-vouchers h4 {
  margin: 0 0 0.5rem;
  color: #374151;
}

.empty-vouchers p {
  margin: 0;
  color: #9ca3af;
}

/* Vouchers Grid */
.vouchers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.25rem;
}

.voucher-card {
  display: flex;
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e9ecef;
  position: relative;
  transition: all 0.3s ease;
}

.voucher-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.voucher-card.expired {
  opacity: 0.65;
}

.voucher-card-left {
  width: 100px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  padding: 1rem;
  position: relative;
}

.voucher-card.expired .voucher-card-left {
  background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
}

.voucher-discount {
  display: flex;
  align-items: flex-start;
}

.discount-value {
  font-size: 2rem;
  font-weight: 800;
  line-height: 1;
}

.discount-type {
  font-size: 1rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.discount-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: 0.25rem;
  opacity: 0.9;
}

.voucher-card-right {
  flex: 1;
  padding: 1rem 1.25rem;
  display: flex;
  flex-direction: column;
}

.voucher-code {
  font-family: 'Courier New', monospace;
  font-size: 1.1rem;
  font-weight: 700;
  color: #1a1a2e;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.voucher-details {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.85rem;
  color: #6b7280;
}

.detail-item i {
  color: #9ca3af;
}

.voucher-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status-badge.active {
  background: #d1fae5;
  color: #059669;
}

.status-badge.inactive {
  background: #fee2e2;
  color: #dc2626;
}

.btn-delete-voucher {
  width: 36px;
  height: 36px;
  border: none;
  background: #fee2e2;
  border-radius: 8px;
  color: #dc2626;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-delete-voucher:hover {
  background: #dc2626;
  color: white;
}

.voucher-perforation {
  position: absolute;
  left: 100px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: repeating-linear-gradient(
    to bottom,
    transparent,
    transparent 6px,
    #e9ecef 6px,
    #e9ecef 12px
  );
}

/* Responsive */
@media (max-width: 768px) {
  .voucher-header {
    flex-direction: column;
    gap: 1.5rem;
  }
  
  .header-stats {
    width: 100%;
    justify-content: center;
  }
  
  .voucher-form .form-grid {
    grid-template-columns: 1fr;
  }
  
  .vouchers-grid {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .search-box {
    width: 100%;
  }
}
</style>