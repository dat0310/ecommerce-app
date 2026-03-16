 <template>
  <div class="profile">
    <div class="container py-5">
      <div class="row">
        <!-- Sidebar Menu -->
        <div class="col-md-3">
          <div class="card shadow">
            <div class="card-body">
              <ul class="list-group list-group-flush">
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'account'" :class="{ 'active': activeTab === 'account' }">
                    My Account
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'purchase'" :class="{ 'active': activeTab === 'purchase' }">
                    My Purchase
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'vouchers'" :class="{ 'active': activeTab === 'vouchers' }">
                    My Vouchers
                  </a>
                </li>
                <li class="list-group-item">
                  <a href="#" @click.prevent="activeTab = 'coins'" :class="{ 'active': activeTab === 'coins' }">
                    My ShopHub Coin
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- My Account Tab -->
          <div v-if="activeTab === 'account'">
            <h2 class="mb-4">My Account</h2>

            <div v-if="loading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else class="card shadow">
              <div class="card-body p-4">
                <form @submit.prevent="updateProfile">
                  <div class="row">
                    <div class="col-md-6 mb-3">
                      <label for="firstName" class="form-label">First Name</label>
                      <input
                        type="text"
                        class="form-control"
                        id="firstName"
                        v-model="user.firstName"
                        required
                      >
                    </div>

                    <div class="col-md-6 mb-3">
                      <label for="lastName" class="form-label">Last Name</label>
                      <input
                        type="text"
                        class="form-control"
                        id="lastName"
                        v-model="user.lastName"
                        required
                      >
                    </div>
                  </div>

                  <div class="mb-3">
                    <label for="email" class="form-label">Email Address</label>
                    <input
                      type="email"
                      class="form-control"
                      id="email"
                      v-model="user.email"
                      required
                      disabled
                    >
                    <div class="form-text">Email cannot be changed.</div>
                  </div>

                  <div class="mb-3">
                    <label for="phone" class="form-label">Phone Number</label>
                    <input
                      type="tel"
                      class="form-control"
                      id="phone"
                      v-model="user.phone"
                      placeholder="Enter your phone number"
                    >
                  </div>

                  <div class="d-grid">
                    <button
                      type="submit"
                      class="btn btn-primary"
                      :disabled="updating"
                    >
                      <span v-if="updating" class="spinner-border spinner-border-sm me-2"></span>
                      {{ updating ? 'Updating...' : 'Update Profile' }}
                    </button>
                  </div>
                </form>

                <hr class="my-4">

                <h5 class="mb-3">Addresses</h5>
                <div v-if="user.addresses && user.addresses.length > 0">
                  <div v-for="(address, index) in user.addresses" :key="index" class="card mb-3">
                    <div class="card-body">
                      <div class="d-flex justify-content-between align-items-start">
                        <div>
                          <p class="mb-1">
                            <strong>Full Name:</strong> {{ address.fullName || address.street || 'Not provided' }}<br>
                            <strong>Phone:</strong> {{ address.phoneNumber || 'Not provided' }}<br>
                            <strong>Address:</strong> {{ address.cityDistrictWard || `${address.city || ''}, ${address.state || ''}, ${address.zipCode || ''}`.trim() || 'Not provided' }}, {{ address.streetBuildingHouse || address.street || 'Not provided' }}
                          </p>
                          <small class="text-muted" v-if="address.isDefault">Default address</small>
                        </div>
                        <div>
                          <button
                            @click="setDefaultAddress(index)"
                            class="btn btn-sm btn-outline-primary me-2"
                            :disabled="address.isDefault"
                          >
                            Set Default
                          </button>
                          <button
                            @click="removeAddress(index)"
                            class="btn btn-sm btn-outline-danger"
                            :disabled="user.addresses.length === 1 && address.isDefault"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-muted">
                  <p>No addresses added yet.</p>
                </div>

                <button type="button"
                  @click="showAddAddressForm"
                  class="btn btn-outline-primary btn-sm mt-2"
                >
                  {{ showAddAddress ? 'Cancel' : 'Add New Address' }}
                </button>

                <div v-if="showAddAddress" class="mt-3">
                  <h6>Add New Address</h6>
                  <form @submit.prevent="addAddress">
                    <div class="row mb-3">
                      <div class="col-md-6">
                        <label class="form-label">Full Name</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="newAddress.fullName"
                          required
                        >
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Phone Number</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="newAddress.phoneNumber"
                          required
                        >
                      </div>
                    </div>
                    <div class="row mb-3" v-if="locations.cities.length > 0">
                      <div class="col-md-4">
                        <label class="form-label">City</label>
                        <select v-model="selectedCity" class="form-select" :disabled="locationsLoading" required>
                          <option value="">{{ locationsLoading ? 'Loading...' : 'Select City' }}</option>
                          <option v-for="city in locations.cities" :key="city" :value="city">{{ city }}</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">District</label>
                        <select v-model="selectedDistrict" class="form-select" :disabled="!selectedCity" required>
                          <option value="">Select District</option>
                          <option v-for="district in availableDistricts" :key="district" :value="district">{{ district }}</option>
                        </select>
                      </div>
                      <div class="col-md-4">
                        <label class="form-label">Ward</label>
                        <select v-model="selectedWard" class="form-select" :disabled="!selectedDistrict" required>
                          <option value="">Select Ward</option>
                          <option v-for="ward in availableWards" :key="ward" :value="ward">{{ ward }}</option>
                        </select>
                      </div>
                    </div>
                    <div class="mb-3" v-else>
                      <label class="form-label">City, District, Ward</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="newAddress.cityDistrictWard"
                        placeholder="e.g., Ho Chi Minh City, District 1, Ward Ben Nghe"
                        required
                      >
                    </div>
                    <div class="mb-3">
                      <label class="form-label">Street Name, Building, House No</label>
                      <input
                        type="text"
                        class="form-control"
                        v-model="newAddress.streetBuildingHouse"
                        placeholder="e.g., Tran Hung Dao Street, Building 5, House 10"
                        required
                      >
                    </div>
                    <div class="form-check mb-3">
                      <input
                        type="checkbox"
                        class="form-check-input"
                        id="defaultAddress"
                        v-model="newAddress.isDefault"
                      >
                      <label class="form-check-label" for="defaultAddress">Set as default address</label>
                    </div>
                    <button type="submit" class="btn btn-primary btn-sm">Add Address</button>
                  </form>
                </div>

                <div v-if="message" class="alert alert-success mt-3" role="alert">
                  {{ message }}
                </div>
                <div v-if="error" class="alert alert-danger mt-3" role="alert">
                  {{ error }}
                </div>
              </div>
            </div>
          </div>

          <!-- My Purchase Tab -->
          <div v-if="activeTab === 'purchase'">
            <h2 class="mb-4">My Purchase</h2>

            <div v-if="ordersLoading" class="text-center py-5">
              <div class="spinner-border text-danger" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="orders.length === 0" class="text-center py-5">
              <p class="text-muted">No orders found.</p>
              <router-link to="/" class="btn btn-danger">Start Shopping</router-link>
            </div>

            <div v-else class="orders-list">
              <div v-for="order in orders" :key="order._id" class="card mb-3 border-0 shadow-sm">
                <!-- Header -->
                <div class="card-header bg-white border-bottom pt-3 pb-2">
                  <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex align-items-center gap-2">
                      <span class="badge bg-danger rounded-1 px-1 me-1">Mall</span>
                      <span class="fw-bold me-2">{{ order.products[0]?.sellerName || 'Shop Name' }}</span>
                      
                      <button class="btn btn-sm btn-danger text-white d-flex align-items-center gap-1 px-2" style="font-size: 0.8rem;">
                        <i class="bi bi-chat-dots-fill"></i> Chat
                      </button>
                      <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 px-2" style="font-size: 0.8rem;">
                        <i class="bi bi-shop"></i> View Shop
                      </button>
                    </div>
                    <div class="text-uppercase text-danger fw-bold">
                      {{ getStatusDisplayText(order.status) }}
                    </div>
                  </div>
                </div>
                
                <!-- Body - Clickable products -->
                <div class="card-body p-0" style="cursor: pointer;" @click="viewOrderDetails(order)">
                  <div v-for="product in order.products" :key="product.productId" class="d-flex p-3 border-bottom bg-light bg-opacity-10">
                    <img 
                      :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/80'" 
                      @error="$event.target.src = 'https://via.placeholder.com/80'"
                      class="rounded me-3" 
                      style="width: 80px; height: 80px; object-fit: cover;" 
                      alt="Product Image"
                    >
                    <div class="flex-grow-1">
                      <div class="d-flex justify-content-between">
                        <div>
                          <h6 class="mb-1 text-dark">{{ product.productName || product.name || 'Product Name' }}</h6>
                          <div v-if="product.selectedOptions && Object.keys(product.selectedOptions).length > 0" class="text-muted small mb-1">
                            <span v-for="(value, key) in product.selectedOptions" :key="key" class="me-2">{{ key }}: {{ value }}</span>
                          </div>
                          <div class="text-dark small">x{{ product.quantity }}</div>
                        </div>
                        <div class="text-end d-flex flex-column align-items-end gap-1">
                          <div class="text-decoration-line-through text-muted small" v-if="product.originalPrice">{{ formatCurrency(product.price * 1.2) }}</div>
                          <div class="text-danger fw-bold">{{ formatCurrency(product.price) }}</div>
                          <template v-if="order.status === 'completed'">
                            <span
                              v-if="reviewedKeys.has(order._id + ':' + product.productId)"
                              class="badge bg-success mt-1 d-flex align-items-center gap-1"
                              style="font-size: 0.7rem;"
                            >
                              <i class="bi bi-check-circle-fill"></i> Reviewed
                            </span>
                            <button
                              v-else
                              class="btn btn-sm btn-warning text-dark px-2 mt-1 d-flex align-items-center gap-1"
                              style="font-size: 0.75rem;"
                              @click.stop="openReviewModal(product, order)"
                            >
                              <i class="bi bi-star-fill"></i> Review
                            </button>
                          </template>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Footer -->
                <div class="card-footer bg-white border-top-0 pt-3 pb-3">
                  <div class="row align-items-center mb-4">
                     <div class="col-12 text-end d-flex justify-content-end align-items-center">
                       <span class="text-muted me-2">Order Total:</span>
                       <span class="text-danger fs-4 fw-bold">{{ formatCurrency(order.totalAmount) }}</span>
                     </div>
                  </div>
                  
                  <div class="d-flex justify-content-between align-items-center">
                      <div class="text-muted small">
                        <span v-if="order.status === 'cancelled'">Cancelled</span>
                        <span v-else>Order ID: {{ order.orderNumber }}</span>
                      </div>
                      <div class="d-flex gap-2 flex-wrap">
                        <!-- Pending -->
                        <template v-if="order.status === 'pending'">
                          <button class="btn btn-secondary px-4 rounded-1" disabled>Wait</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                          <button class="btn btn-outline-danger px-3 rounded-1" @click="cancelOrder(order)">Cancel Order</button>
                        </template>

                        <!-- Confirmed / Processing -->
                        <template v-else-if="order.status === 'confirmed' || order.status === 'processing'">
                          <button class="btn btn-outline-danger px-3 rounded-1" @click="cancelOrder(order)">Cancel Order</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Shipping -->
                        <template v-else-if="order.status === 'shipped'">
                          <button class="btn btn-outline-info px-3 rounded-1" @click="openTrackingModal(order)"><i class="bi bi-geo-alt me-1"></i>Track Order</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Delivered -->
                        <template v-else-if="order.status === 'delivered'">
                          <button class="btn btn-danger text-white px-4 border-0 rounded-1" @click="confirmReceivedAndReview(order)">Received</button>
                          <button class="btn btn-outline-warning px-3 rounded-1" @click="openRefundModal(order)"><i class="bi bi-arrow-return-left me-1"></i>Refund</button>
                          <button class="btn btn-outline-info px-3 rounded-1" @click="openTrackingModal(order)"><i class="bi bi-geo-alt me-1"></i>Track Order</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Completed -->
                        <template v-else-if="order.status === 'completed'">
                          <button class="btn btn-danger text-white px-4 border-0 rounded-1">Buy Again</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Cancelled -->
                        <template v-else-if="order.status === 'cancelled'">
                          <button class="btn btn-danger text-white px-4 border-0 rounded-1">Buy Again</button>
                        </template>

                        <!-- Refund Requested -->
                        <template v-else-if="order.status === 'refund_requested'">
                          <button class="btn btn-secondary px-4 rounded-1" disabled>Refund</button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Refund Approved -->
                        <template v-else-if="order.status === 'refund_approved'">
                          <span class="badge bg-success text-white px-3 py-2"><i class="bi bi-check-circle me-1"></i>Refund Approved</span>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Refund Rejected by Seller -->
                        <template v-else-if="order.status === 'refund_rejected'">
                          <span class="badge bg-danger text-white px-3 py-2">Refund Rejected by Seller</span>
                          <button class="btn btn-warning text-dark px-3 rounded-1" @click="openDispute(order)">
                            <i class="bi bi-shield-exclamation me-1"></i>Open Dispute
                          </button>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Dispute Open -->
                        <template v-else-if="order.status === 'dispute_open'">
                          <span class="badge bg-info text-white px-3 py-2"><i class="bi bi-hourglass-split me-1"></i>Under Admin Review</span>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Dispute Resolved (in seller's favor) -->
                        <template v-else-if="order.status === 'dispute_resolved'">
                          <span class="badge bg-secondary text-white px-3 py-2">Dispute Resolved - Refund Denied</span>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>

                        <!-- Default fallback -->
                        <template v-else>
                          <button class="btn btn-outline-secondary px-3 rounded-1" @click="contactSeller(order)">Contact Seller</button>
                        </template>
                      </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- My Vouchers Tab -->
          <div v-if="activeTab === 'vouchers'">
            <h2 class="mb-4">My Vouchers</h2>

            <div v-if="vouchersLoading" class="text-center">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>

            <div v-else-if="vouchers.length === 0" class="text-center">
              <p>No vouchers available.</p>
            </div>

            <div v-else>
              <div v-for="voucher in vouchers" :key="voucher._id" class="card mb-3 shadow">
                <div class="card-body">
                  <div class="d-flex justify-content-between align-items-start">
                    <div>
                      <h5 class="card-title">{{ voucher.code }}</h5>
                      <p class="card-text mb-1">
                        Discount: 
                        <span v-if="voucher.discountType === 'percentage'">{{ voucher.discountValue }}%</span>
                        <span v-else>${{ voucher.discountValue }}</span>
                      </p>
                      <p class="card-text text-muted small mb-0">Expires: {{ new Date(voucher.expiryDate).toLocaleDateString() }}</p>
                    </div>
                    <div class="text-end">
                      <div v-if="voucher.fee > 0" class="mb-1">
                        <span class="badge bg-warning text-dark">
                          <i class="bi bi-coin me-1"></i>{{ voucher.fee }} Coins
                        </span>
                      </div>
                      <button
                        v-if="voucher.userStatus === 'AVAILABLE'"
                        class="btn btn-sm btn-secondary text-white"
                        disabled
                      >
                        <i class="bi bi-check-circle me-1"></i> Owned
                      </button>
                      <button
                        v-else-if="voucher.userStatus === 'USED'"
                        class="btn btn-sm btn-secondary text-white"
                        disabled
                      >
                        <i class="bi bi-check-circle me-1"></i> Used
                      </button>
                      <button
                        v-else
                        class="btn btn-sm"
                        :class="voucher.fee > 0 ? 'btn-warning text-dark' : 'btn-success text-white'"
                        @click="buyVoucherWithCoins(voucher)"
                        :disabled="voucher.fee > 0 && coins < voucher.fee"
                      >
                        {{ voucher.fee > 0 ? 'Buy' : 'Get' }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- My ShopHub Coin Tab -->
          <div v-show="activeTab === 'coins'">
            <h2 class="mb-4">My ShopHub Coin</h2>

            <div class="card shadow">
              <div class="card-body text-center">
                <h3 class="text-primary">{{ coins || 0 }} Coins</h3>
                <p class="text-muted">Earn coins by logging in daily!</p>
                <button
                  class="btn btn-primary"
                  @click="claimDailyCoins"
                  :disabled="dailyClaimed"
                >
                  {{ dailyClaimed ? 'Already claimed today' : 'Claim Daily Coins' }}
                </button>
                <p v-if="dailyClaimed" class="text-success mt-2">You have already claimed your daily coins today.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Review Modal -->
    <div v-if="showReviewModal" class="modal-overlay" @click.self="closeReviewModal">
      <div class="modal-content-custom">
        <div class="modal-header-custom">
          <h5 class="mb-0">
            <i class="bi bi-star-fill text-warning me-2"></i>Write a Review
          </h5>
          <button class="btn-close" @click="closeReviewModal"></button>
        </div>
        <div class="modal-body-custom">
          <!-- Product Info -->
          <div class="d-flex align-items-center mb-4 p-3 bg-light rounded">
            <img
              :src="reviewTarget.image || 'https://via.placeholder.com/60'"
              class="rounded me-3"
              style="width: 60px; height: 60px; object-fit: cover;"
              alt="Product"
            >
            <div>
              <h6 class="mb-0">{{ reviewTarget.productName || reviewTarget.name }}</h6>
              <small class="text-muted">Order: {{ reviewTarget.orderNumber }}</small>
            </div>
          </div>

          <!-- Review Coin Reward Banner -->
          <div class="mb-3 p-2 bg-warning bg-opacity-10 border border-warning rounded d-flex align-items-center">
            <i class="bi bi-coin text-warning fs-4 me-2"></i>
            <small class="text-warning fw-bold"><i class="bi bi-gift me-1"></i>Earn 500 ShopHub Coins for this review!</small>
          </div>

          <!-- Alerts -->
          <div v-if="modalReviewError" class="alert alert-danger py-2 mb-3">
            <i class="bi bi-exclamation-triangle me-2"></i>{{ modalReviewError }}
          </div>
          <div v-if="modalReviewSuccess" class="alert alert-success py-2 mb-3">
            <i class="bi bi-check-circle me-2"></i>{{ modalReviewSuccess }}
          </div>

          <!-- Rating -->
          <div class="mb-3">
            <label class="form-label fw-bold">Your Rating</label>
            <div class="star-rating-input">
              <i v-for="n in 5" :key="'modal-star-'+n"
                :class="n <= modalReview.rating ? 'bi bi-star-fill text-warning' : 'bi bi-star text-muted'"
                class="fs-3 me-1"
                style="cursor: pointer;"
                @click="modalReview.rating = n"
              ></i>
            </div>
          </div>

          <!-- Comment -->
          <div class="mb-3">
            <label class="form-label fw-bold">Your Comment</label>
            <textarea
              v-model="modalReview.comment"
              class="form-control"
              rows="4"
              placeholder="Share your experience with this product..."
            ></textarea>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" @click="closeReviewModal">Cancel</button>
          <button
            class="btn btn-primary"
            :disabled="modalReview.rating === 0 || modalSubmitting"
            @click="submitModalReview"
          >
            <span v-if="modalSubmitting"><i class="bi bi-hourglass-split me-1"></i>Submitting...</span>
            <span v-else><i class="bi bi-send me-1"></i>Submit Review</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetail && orderDetail" class="modal-overlay" @click.self="showOrderDetail = false">
      <div class="modal-content-custom" style="max-width: 650px;">
        <div class="modal-header-custom">
          <h5 class="mb-0">
            <i class="bi bi-receipt me-2"></i>Order Details
          </h5>
          <button class="btn-close" @click="showOrderDetail = false"></button>
        </div>
        <div class="modal-body-custom p-0" style="max-height: 70vh; overflow-y: auto;">
          <!-- Shop Header -->
          <div class="d-flex align-items-center gap-2 p-3 border-bottom bg-light">
            <i class="bi bi-shop"></i>
            <span class="fw-bold">{{ orderDetail.products[0]?.sellerName || 'Shop' }}</span>
            <button class="btn btn-sm btn-danger text-white d-flex align-items-center gap-1 px-2" style="font-size: 0.8rem;" @click="contactSeller(orderDetail); showOrderDetail = false">
              <i class="bi bi-chat-dots-fill"></i> Chat
            </button>
          </div>

          <!-- Product List -->
          <div v-for="product in orderDetail.products" :key="product.productId" class="d-flex p-3 border-bottom">
            <img
              :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/80'"
              @error="$event.target.src = 'https://via.placeholder.com/80'"
              class="rounded me-3" style="width: 80px; height: 80px; object-fit: cover;" alt="Product"
            >
            <div class="flex-grow-1">
              <h6 class="mb-1 text-dark">{{ product.productName || product.name || 'Product' }}</h6>
              <div v-if="product.selectedOptions && Object.keys(product.selectedOptions).length > 0" class="text-muted small mb-1">
                <span v-for="(value, key) in product.selectedOptions" :key="key" class="me-2">{{ key }}: {{ value }}</span>
              </div>
              <div class="text-dark small">x{{ product.quantity }}</div>
            </div>
            <div class="text-end">
              <div class="text-danger fw-bold">{{ formatCurrency(product.price) }}</div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="p-3">
            <div class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">Subtotal ({{ orderDetail.products.reduce((s, p) => s + p.quantity, 0) }} items)</span>
              <span class="fw-semibold">{{ formatCurrency(orderDetail.products.reduce((s, p) => s + p.price * p.quantity, 0)) }}</span>
            </div>
            <div v-if="orderDetail.voucher && orderDetail.voucher.discountAmount" class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">
                <i class="bi bi-ticket-perforated me-1"></i>Voucher ({{ orderDetail.voucher.code }})
              </span>
              <span class="text-success fw-semibold">-{{ formatCurrency(orderDetail.voucher.discountAmount) }}</span>
            </div>
            <div v-if="orderDetail.coinDiscount && orderDetail.coinDiscount > 0" class="d-flex justify-content-between py-2 border-bottom">
              <span class="text-muted">
                <i class="bi bi-coin me-1"></i>Coin Discount ({{ orderDetail.coinsUsed }} coins)
              </span>
              <span class="text-success fw-semibold">-{{ formatCurrency(orderDetail.coinDiscount) }}</span>
            </div>
            <div class="d-flex justify-content-between py-2 mt-1">
              <span class="fw-bold">Order Total</span>
              <span class="text-danger fs-5 fw-bold">{{ formatCurrency(orderDetail.totalAmount) }}</span>
            </div>
          </div>

          <!-- Shipping Address -->
          <div v-if="orderDetail.shippingAddress" class="p-3 border-top bg-light">
            <h6 class="fw-bold mb-2"><i class="bi bi-geo-alt me-1"></i>Shipping Address</h6>
            <p class="mb-0 small">
              <strong>{{ orderDetail.shippingAddress.fullName }}</strong>
              <span v-if="orderDetail.shippingAddress.phoneNumber"> | {{ orderDetail.shippingAddress.phoneNumber }}</span><br>
              {{ orderDetail.shippingAddress.streetBuildingHouse || orderDetail.shippingAddress.street || '' }}
              <template v-if="orderDetail.shippingAddress.cityDistrictWard">, {{ orderDetail.shippingAddress.cityDistrictWard }}</template>
            </p>
          </div>

          <!-- Order Info -->
          <div class="p-3 border-top">
            <div class="row small text-muted">
              <div class="col-6">
                <div class="mb-1"><strong>Order ID:</strong> {{ orderDetail.orderNumber }}</div>
                <div><strong>Order Date:</strong> {{ new Date(orderDetail.createdAt).toLocaleString() }}</div>
              </div>
              <div class="col-6 text-end">
                <div class="mb-1"><strong>Status:</strong> <span class="text-uppercase text-danger fw-bold">{{ getStatusDisplayText(orderDetail.status) }}</span></div>
                <div><strong>Payment:</strong> {{ orderDetail.paymentMethod || 'COD' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tracking Modal -->
    <div v-if="showTrackingModal && trackingOrder" class="modal-overlay" @click.self="showTrackingModal = false">
      <div class="modal-content-custom" style="max-width: 500px;">
        <div class="modal-header-custom">
          <h5 class="mb-0">
            <i class="bi bi-geo-alt me-2"></i>Order Tracking
          </h5>
          <button class="btn-close" @click="showTrackingModal = false"></button>
        </div>
        <div class="modal-body-custom">
          <div class="mb-3">
            <small class="text-muted">Order: {{ trackingOrder.orderNumber }}</small>
          </div>
          <div class="tracking-timeline">
            <div class="tracking-step" :class="{ active: true }">
              <div class="tracking-dot bg-success"></div>
              <div class="tracking-content">
                <strong>Order Placed</strong>
                <small class="text-muted d-block">{{ new Date(trackingOrder.createdAt).toLocaleString() }}</small>
              </div>
            </div>
            <div class="tracking-step" :class="{ active: ['confirmed','processing','shipped','delivered'].includes(trackingOrder.status) }">
              <div class="tracking-dot" :class="['confirmed','processing','shipped','delivered'].includes(trackingOrder.status) ? 'bg-success' : 'bg-secondary'"></div>
              <div class="tracking-content">
                <strong>Order Confirmed</strong>
                <small class="text-muted d-block">Seller has confirmed the order</small>
              </div>
            </div>
            <div class="tracking-step" :class="{ active: ['processing','shipped','delivered'].includes(trackingOrder.status) }">
              <div class="tracking-dot" :class="['processing','shipped','delivered'].includes(trackingOrder.status) ? 'bg-success' : 'bg-secondary'"></div>
              <div class="tracking-content">
                <strong>Processing</strong>
                <small class="text-muted d-block">Order is being prepared</small>
              </div>
            </div>
            <div class="tracking-step" :class="{ active: ['shipped','delivered'].includes(trackingOrder.status) }">
              <div class="tracking-dot" :class="['shipped','delivered'].includes(trackingOrder.status) ? 'bg-info' : 'bg-secondary'"></div>
              <div class="tracking-content">
                <strong>Shipping</strong>
                <small class="text-muted d-block">Package is on its way</small>
              </div>
            </div>
            <div class="tracking-step" :class="{ active: trackingOrder.status === 'delivered' }">
              <div class="tracking-dot" :class="trackingOrder.status === 'delivered' ? 'bg-success' : 'bg-secondary'"></div>
              <div class="tracking-content">
                <strong>Delivered</strong>
                <small class="text-muted d-block">Package has been delivered</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Refund Modal -->
    <div v-if="showRefundModal && refundOrder" class="modal-overlay" @click.self="closeRefundModal">
      <div class="modal-content-custom" style="max-width: 500px;">
        <div class="modal-header-custom">
          <h5 class="mb-0">
            <i class="bi bi-arrow-return-left me-2"></i>Request Refund
          </h5>
          <button class="btn-close" @click="closeRefundModal"></button>
        </div>
        <div class="modal-body-custom">
          <div class="mb-3">
            <label class="form-label fw-bold">Select Reason</label>
            <select v-model="refundReason" class="form-select">
              <option value="Item damaged or broken">Item damaged or broken</option>
              <option value="Item does not match description">Item does not match description</option>
              <option value="Missing quantity/accessories">Missing quantity/accessories</option>
              <option value="Wrong item received">Wrong item received</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div class="mb-3">
            <label class="form-label fw-bold">Description (Optional)</label>
            <textarea v-model="refundDescription" class="form-control" rows="3" placeholder="Provide more details for the refund..."></textarea>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-outline-secondary" @click="closeRefundModal">Cancel</button>
          <button class="btn btn-primary" :disabled="!refundReason" @click="submitRefundRequest">Submit Request</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'Profile',
  data() {
    return {
      activeTab: 'account',
      loading: true,
      updating: false,
      showAddAddress: false,
      message: '',
      error: '',
      user: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        addresses: []
      },
      newAddress: {
        fullName: '',
        phoneNumber: '',
        cityDistrictWard: '',
        streetBuildingHouse: '',
        isDefault: false
      },
      selectedCity: '',
      selectedDistrict: '',
      selectedWard: '',
      locations: {
        cities: [],
        districts: {},
        wards: {}
      },
      provinceCodes: {},
      districtCodes: {},
      locationsLoading: true,
      orders: [],
      ordersLoading: false,
      vouchers: [],
      vouchersLoading: false,
      coins: 0,
      dailyClaimed: false,
      // Review Modal
      showReviewModal: false,
      reviewTarget: {},
      modalReview: { rating: 0, comment: '' },
      modalReviewError: '',
      modalReviewSuccess: '',
      modalSubmitting: false,
      reviewedKeys: new Set(),
      // Order Detail Modal
      showOrderDetail: false,
      orderDetail: null,
      // Tracking Modal
      showTrackingModal: false,
      trackingOrder: null,
      // Refund Modal
      showRefundModal: false,
      refundOrder: null,
      refundReason: 'Item damaged or broken',
      refundDescription: ''
    }
  },
  computed: {
    ...mapGetters(['currentUser']),
    availableDistricts() {
      return this.locations.districts[this.selectedCity] || []
    },
    availableWards() {
      return this.locations.wards[this.selectedDistrict] || []
    }
  },
  watch: {
    currentUser: {
      handler(newVal) {
        if (newVal) {
          this.user = { ...newVal }
        }
      },
      deep: true,
      immediate: true
    },
    selectedCity() {
      this.selectedDistrict = ''
      this.selectedWard = ''
    },
    selectedDistrict() {
      this.selectedWard = ''
    }
  },
  async created() {
    this.loadUserData()
    
    this.loadLocationsRequested = false;
    
    // Defer loading other tab data until needed or just fire async and forget
    this.loadOrders()
    this.loadMyReviews()
    this.loadVouchers()
    this.loadCoins()
  },
  methods: {
    async loadLocations() {
      if (this.locations.cities.length > 0) return; // Already loaded
      this.locationsLoading = true;
      try {
        const [provincesRes, districtsRes, wardsRes] = await Promise.all([
          fetch('https://provinces.open-api.vn/api/p/'),
          fetch('https://provinces.open-api.vn/api/d/'),
          fetch('https://provinces.open-api.vn/api/w/')
        ])

        const provinces = await provincesRes.json()
        const districts = await districtsRes.json()
        const wards = await wardsRes.json()

        // Load provinces
        this.locations.cities = provinces.map(p => p.name).sort()
        this.provinceCodes = {}
        provinces.forEach(p => {
          this.provinceCodes[p.name] = p.code
        })

        // Load districts
        this.locations.districts = {}
        districts.forEach(d => {
          const province = provinces.find(p => p.code === d.province_code)
          if (province) {
            const provinceName = province.name
            if (!this.locations.districts[provinceName]) {
              this.locations.districts[provinceName] = []
            }
            this.locations.districts[provinceName].push(d.name)
          }
        })
        // Sort districts for each province
        Object.keys(this.locations.districts).forEach(province => {
          this.locations.districts[province].sort()
        })

        this.districtCodes = {}
        districts.forEach(d => {
          const province = provinces.find(p => p.code === d.province_code)
          if (province) {
            const key = `${province.name}-${d.name}`
            this.districtCodes[key] = d.code
          }
        })

        // Load wards
        this.locations.wards = {}
        wards.forEach(w => {
          const district = districts.find(d => d.code === w.district_code)
          if (district) {
            const districtName = district.name
            if (!this.locations.wards[districtName]) {
              this.locations.wards[districtName] = []
            }
            this.locations.wards[districtName].push(w.name)
          }
        })
        // Sort wards for each district
        Object.keys(this.locations.wards).forEach(district => {
          this.locations.wards[district].sort()
        })
      } catch (error) {
        console.error('Error loading locations:', error)
      } finally {
        this.locationsLoading = false
      }
    },
    showAddAddressForm() {
      this.showAddAddress = !this.showAddAddress;
      if (this.showAddAddress) {
          this.loadLocations();
      }
    },
    async loadUserData() {
      this.loading = true
      try {
        if (this.currentUser) {
          this.user = { ...this.currentUser }
        } else {
          // Fetch user data if not in store
          const response = await this.$http.get('/api/users/me')
          this.user = response.data
          this.$store.commit('SET_USER', response.data)
        }
      } catch (error) {
        console.error('Error loading user data:', error)
        this.error = 'Failed to load user data.'
      } finally {
        this.loading = false
      }
    },
    async updateProfile() {
      this.updating = true
      this.message = ''
      this.error = ''

      try {
        const response = await this.$http.patch('/api/users/me', this.user)
        this.$store.commit('SET_USER', response.data.user)
        this.message = 'Profile updated successfully!'
      } catch (error) {
        console.error('Error updating profile:', error)
        this.error = error.response?.data?.message || 'Failed to update profile.'
      } finally {
        this.updating = false
      }
    },
    async addAddress() {
      this.newAddress.cityDistrictWard = `${this.selectedCity}, ${this.selectedDistrict}, ${this.selectedWard}`
      try {
        const response = await this.$http.post('/api/users/addresses', this.newAddress)
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.newAddress = {
          fullName: '',
          phoneNumber: '',
          cityDistrictWard: '',
          streetBuildingHouse: '',
          isDefault: false
        }
        this.selectedCity = ''
        this.selectedDistrict = ''
        this.selectedWard = ''
        this.showAddAddress = false
        this.message = 'Address added successfully!'
      } catch (error) {
        console.error('Error adding address:', error)
        this.error = error.response?.data?.message || 'Failed to add address.'
      }
    },
    async setDefaultAddress(index) {
      try {
        const addressId = this.user.addresses[index]._id
        const response = await this.$http.put(`/api/users/addresses/${addressId}`, {
          ...this.user.addresses[index],
          isDefault: true
        })
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.message = 'Default address updated!'
      } catch (error) {
        console.error('Error setting default address:', error)
        this.error = error.response?.data?.message || 'Failed to set default address.'
      }
    },
    async removeAddress(index) {
      if (!confirm('Are you sure you want to remove this address?')) return

      try {
        const addressId = this.user.addresses[index]._id
        const response = await this.$http.delete(`/api/users/addresses/${addressId}`)
        this.user.addresses = response.data.addresses
        this.$store.commit('SET_USER', { ...this.user, addresses: response.data.addresses })
        this.message = 'Address removed successfully!'
      } catch (error) {
        console.error('Error removing address:', error)
        this.error = error.response?.data?.message || 'Failed to remove address.'
      }
    },
    async loadOrders() {
      this.ordersLoading = true
      try {
        const response = await this.$http.get('/api/users/me/orders')
        this.orders = response.data
        // Try to fetch images for old orders that lack them
        this.fetchMissingImages()
      } catch (error) {
        console.error('Error loading orders:', error)
      } finally {
        this.ordersLoading = false
      }
    },
    async loadMyReviews() {
      try {
        const response = await this.$http.get('/api/products/reviews/my')
        const reviews = response.data || []
        this.reviewedKeys = new Set(reviews.map(r => r.orderId + ':' + r.productId))
      } catch (error) {
        console.error('Error loading user reviews:', error)
      }
    },
    async fetchMissingImages() {
      const productsToFetch = new Set()
      
      // Identify unique products with missing images
      this.orders.forEach(order => {
        order.products.forEach(p => {
          if (!p.image) {
            productsToFetch.add(p.productId)
          }
        })
      })

      // Fetch images for these products
      for (const productId of productsToFetch) {
        try {
          const response = await this.$http.get(`/api/products/${productId}`)
          const productImage = response.data.image
          
          if (productImage) {
            // Update all instances in local state
            this.orders.forEach(order => {
              order.products.forEach(p => {
                if (p.productId === productId && !p.image) {
                  p.image = productImage
                }
              })
            })
          }
        } catch (error) {
          // Silent failure if product no longer exists
          console.warn(`Could not fetch image for product ${productId}`)
        }
      }
    },
    getStatusClass(status) {
      const classes = {
        pending: 'text-warning',
        confirmed: 'text-info',
        processing: 'text-primary',
        shipped: 'text-secondary',
        delivered: 'text-success',
        cancelled: 'text-danger'
      }
      return classes[status] || 'text-muted'
    },
    viewOrderDetails(order) {
      this.orderDetail = order
      this.showOrderDetail = true
    },
    async cancelOrder(order) {
      if (!confirm('Are you sure you want to cancel this order?')) return
      try {
        await this.$http.patch(`/api/orders/${order._id}/cancel`)
        order.status = 'cancelled'
        this.$toast?.success('Order cancelled successfully.', { position: 'top-right', timeout: 3000 })
      } catch (error) {
        console.error('Error cancelling order:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to cancel order.', { position: 'top-right', timeout: 3000 })
      }
    },
    async confirmReceivedAndReview(order) {
      if (!confirm('Confirm you have received this order?')) return
      try {
        await this.$http.patch(`/api/orders/${order._id}/confirm-received`)
        order.status = 'completed'
        this.$toast?.success('Order marked as received!', { position: 'top-right', timeout: 3000 })
        const unreviewedProduct = order.products.find(p => !this.reviewedKeys.has(order._id + ':' + p.productId))
        if(unreviewedProduct) {
          this.openReviewModal(unreviewedProduct, order)
        }
      } catch (error) {
        console.error('Error confirming order:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to confirm order.', { position: 'top-right', timeout: 3000 })
      }
    },
    openRefundModal(order) {
      this.refundOrder = order;
      this.refundReason = 'Item damaged or broken';
      this.refundDescription = '';
      this.showRefundModal = true;
    },
    closeRefundModal() {
      this.showRefundModal = false;
      this.refundOrder = null;
    },
    async submitRefundRequest() {
      const order = this.refundOrder;
      if(!order) return;
      try {
        // Here we could send the reason and description to the backend if supported, 
        // but for now we just hit the existing refund endpoint
        await this.$http.patch(`/api/orders/${order._id}/request-refund`, {
          reason: this.refundReason,
          description: this.refundDescription
        })
        order.status = 'refund_requested'
        this.$toast?.success('Refund requested successfully.', { position: 'top-right', timeout: 3000 })
        this.closeRefundModal()
      } catch (error) {
        console.error('Error requesting refund:', error)
        this.$toast?.error('Failed to request refund.', { position: 'top-right', timeout: 3000 })
      }
    },
    contactSeller(order) {
      const firstProduct = order.products?.[0]
      const sellerId = firstProduct?.sellerId
      const sellerName = firstProduct?.sellerName || 'Seller'
      if (!sellerId) {
        this.$toast?.error('Seller info not available.', { position: 'top-right', timeout: 2000 })
        return
      }
      const productContext = firstProduct ? {
        productId: firstProduct.productId,
        name: firstProduct.productName || firstProduct.name || 'Product',
        image: (firstProduct.images && firstProduct.images[0]) || firstProduct.image || '',
        price: firstProduct.price
      } : null
      window.dispatchEvent(new CustomEvent('open-seller-chat', {
        detail: { sellerId, sellerName, productContext }
      }))
    },
    async loadVouchers() {
      this.vouchersLoading = true
      try {
        const token = localStorage.getItem('token')
        const response = await this.$http.get('/api/vouchers/my-vouchers', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.vouchers = response.data
      } catch (error) {
        console.error('Error loading vouchers:', error)
        this.vouchers = []
      } finally {
        this.vouchersLoading = false
      }
    },
    async loadCoins() {
      try {
        const token = localStorage.getItem('token')
        const response = await this.$http.get('/api/coins', {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.coins = response.data.coins
        this.dailyClaimed = response.data.dailyClaimed
      } catch (error) {
        console.error('Error loading coins:', error)
        this.coins = 0
        this.dailyClaimed = false
      }
    },
    async claimDailyCoins() {
      try {
        const token = localStorage.getItem('token')
        const response = await this.$http.post('/api/coins/claim-daily', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        this.coins = response.data.coins
        this.dailyClaimed = true
        this.$toast?.success('Daily coins claimed!', { position: 'top-right', timeout: 3000 })
      } catch (error) {
        console.error('Error claiming daily coins:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to claim daily coins', { position: 'top-right', timeout: 3000 })
      }
    },
    async buyVoucherWithCoins(voucher) {
      const coinPrice = voucher.fee || 0;

      if (coinPrice > 0 && this.coins < coinPrice) {
          this.$toast?.error('Not enough coins to buy this voucher.', { position: 'top-right', timeout: 3000 })
          return
      }

      try {
        const token = localStorage.getItem('token')
        await this.$http.post(`/api/vouchers/${voucher._id}/acquire`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        
        this.$toast?.success(coinPrice > 0 ? `Voucher "${voucher.code}" purchased successfully!` : `Voucher "${voucher.code}" acquired successfully!`, { position: 'top-right', timeout: 3000 })
        
        // Reload vouchers and coins to reflect new state
        await this.loadVouchers()
        await this.loadCoins()
      } catch (error) {
        console.error('Error acquiring voucher:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to acquire voucher.', { position: 'top-right', timeout: 3000 })
      }
    },
    getStatusDisplayText(status) {
      const statusText = {
        pending: 'Pending',
        confirmed: 'Confirmed',
        processing: 'Processing',
        shipped: 'Shipping',
        delivered: 'Delivered',
        cancelled: 'Cancelled',
        refund_requested: 'Refund',
        refund_approved: 'Refund Approved',
        refund_rejected: 'Refund Rejected',
        dispute_open: 'Dispute - Under Review',
        dispute_resolved: 'Dispute Resolved',
        approved: 'Approved',
        rejected: 'Rejected'
      }
      return statusText[status] || status
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
    },
    openReviewModal(product, order) {
      this.reviewTarget = { ...product, orderId: order._id, orderNumber: order.orderNumber }
      this.modalReview = { rating: 0, comment: '' }
      this.modalReviewError = ''
      this.modalReviewSuccess = ''
      this.showReviewModal = true
    },
    closeReviewModal() {
      this.showReviewModal = false
      this.reviewTarget = {}
      this.modalReview = { rating: 0, comment: '' }
      this.modalReviewError = ''
      this.modalReviewSuccess = ''
    },
    async submitModalReview() {
      this.modalReviewError = ''
      this.modalReviewSuccess = ''
      this.modalSubmitting = true

      try {
        const token = localStorage.getItem('token')
        const productId = this.reviewTarget.productId
        const orderId = this.reviewTarget.orderId
        await this.$http.post(`/api/products/${productId}/reviews`, {
          rating: this.modalReview.rating,
          comment: this.modalReview.comment,
          orderId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })

        this.modalReviewSuccess = 'Review submitted successfully!'
        this.reviewedKeys = new Set([...this.reviewedKeys, orderId + ':' + productId])
        // Reload coins to show the 500 reward
        await this.loadCoins()
        setTimeout(() => {
          this.closeReviewModal()
        }, 1500)
      } catch (error) {
        this.modalReviewError = error.response?.data?.message || 'Failed to submit review'
      } finally {
        this.modalSubmitting = false
      }
    },
    openTrackingModal(order) {
      this.trackingOrder = order
      this.showTrackingModal = true
    },
    async requestRefund(order) {
      if (!confirm('Are you sure you want to request a refund for this order?')) return
      try {
        await this.$http.patch(`/api/orders/${order._id}/request-refund`)
        order.status = 'refund_requested'
        this.$toast?.success('Refund request submitted successfully.', { position: 'top-right', timeout: 3000 })
      } catch (error) {
        console.error('Error requesting refund:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to request refund.', { position: 'top-right', timeout: 3000 })
      }
    },
    async openDispute(order) {
      if (!confirm('The seller rejected your refund. Do you want to escalate this to admin for review?')) return
      try {
        await this.$http.patch(`/api/orders/${order._id}/open-dispute`)
        order.status = 'dispute_open'
        this.$toast?.success('Dispute opened. Admin will review your case.', { position: 'top-right', timeout: 3000 })
      } catch (error) {
        console.error('Error opening dispute:', error)
        this.$toast?.error(error.response?.data?.message || 'Failed to open dispute.', { position: 'top-right', timeout: 3000 })
      }
    }
  }
}
</script>

<style scoped>
.profile {
  min-height: 70vh;
}

.list-group-item a {
  text-decoration: none;
  color: inherit;
}

.list-group-item a.active {
  font-weight: bold;
  color: #007bff;
}

/* Review Modal */
.modal-overlay {
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

.modal-content-custom {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 520px;
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

.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-body-custom {
  padding: 1.5rem;
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

/* Tracking Timeline */
.tracking-timeline {
  position: relative;
  padding-left: 30px;
}

.tracking-step {
  position: relative;
  padding-bottom: 24px;
  padding-left: 16px;
  opacity: 0.4;
  transition: opacity 0.3s ease;
}

.tracking-step.active {
  opacity: 1;
}

.tracking-step:not(:last-child)::before {
  content: '';
  position: absolute;
  left: -24px;
  top: 14px;
  width: 2px;
  height: calc(100% - 4px);
  background: #dee2e6;
}

.tracking-step.active:not(:last-child)::before {
  background: #198754;
}

.tracking-dot {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.tracking-content strong {
  font-size: 0.95rem;
}

.tracking-content small {
  font-size: 0.8rem;
}
</style>
