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
      <div class="review-modal">
        <!-- Header -->
        <div class="review-modal-header">
          <div class="review-header-icon">
            <i class="bi bi-star-fill"></i>
          </div>
          <h4>Write a Review</h4>
          <p class="review-subtitle">Share your thoughts about this product</p>
          <button class="review-close-btn" @click="closeReviewModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Product Card -->
        <div class="review-product-card">
          <img
            :src="reviewTarget.image || 'https://via.placeholder.com/80'"
            alt="Product"
            class="review-product-img"
          >
          <div class="review-product-info">
            <h6>{{ reviewTarget.productName || reviewTarget.name }}</h6>
            <span class="review-order-id">
              <i class="bi bi-receipt me-1"></i>{{ reviewTarget.orderNumber }}
            </span>
          </div>
        </div>

        <!-- Coin Reward -->
        <div class="review-reward-banner">
          <div class="reward-icon">
            <i class="bi bi-coin"></i>
          </div>
          <div class="reward-text">
            <span class="reward-title">Earn 500 ShopHub Coins!</span>
            <span class="reward-desc">Complete this review to earn rewards</span>
          </div>
          <div class="reward-coins">+500</div>
        </div>

        <!-- Alerts -->
        <div v-if="modalReviewError" class="review-alert review-alert-error">
          <i class="bi bi-exclamation-circle"></i>
          <span>{{ modalReviewError }}</span>
        </div>
        <div v-if="modalReviewSuccess" class="review-alert review-alert-success">
          <i class="bi bi-check-circle"></i>
          <span>{{ modalReviewSuccess }}</span>
        </div>

        <!-- Rating Section -->
        <div class="review-section">
          <label class="review-label">
            <i class="bi bi-stars me-2"></i>How would you rate this product?
          </label>
          <div class="review-stars">
            <div class="stars-container">
              <i v-for="n in 5" :key="'modal-star-'+n"
                :class="['star-icon', n <= modalReview.rating ? 'star-filled' : 'star-empty']"
                @click="modalReview.rating = n"
                @mouseenter="hoverRating = n"
                @mouseleave="hoverRating = 0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </i>
            </div>
            <span class="rating-text" v-if="modalReview.rating > 0">
              {{ ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][modalReview.rating] }}
            </span>
          </div>
        </div>

        <!-- Comment Section -->
        <div class="review-section">
          <label class="review-label">
            <i class="bi bi-chat-quote me-2"></i>Write your review
          </label>
          <div class="review-textarea-wrapper">
            <textarea
              v-model="modalReview.comment"
              class="review-textarea"
              rows="4"
              placeholder="What did you like or dislike? How was the quality?"
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ modalReview.comment?.length || 0 }}/500</span>
          </div>
        </div>

        <!-- Footer -->
        <div class="review-modal-footer">
          <button class="review-btn review-btn-cancel" @click="closeReviewModal">
            Cancel
          </button>
          <button
            class="review-btn review-btn-submit"
            :disabled="modalReview.rating === 0 || modalSubmitting"
            @click="submitModalReview"
          >
            <span v-if="modalSubmitting">
              <i class="bi bi-arrow-repeat spin me-2"></i>Submitting...
            </span>
            <span v-else>
              <i class="bi bi-send-fill me-2"></i>Submit Review
            </span>
          </button>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetail && orderDetail" class="modal-overlay" @click.self="showOrderDetail = false">
      <div class="order-detail-modal">
        <!-- Header -->
        <div class="order-detail-header">
          <div class="order-header-content">
            <div class="order-header-icon">
              <i class="bi bi-receipt-cutoff"></i>
            </div>
            <div>
              <h4>Order Details</h4>
              <span class="order-number-badge">{{ orderDetail.orderNumber }}</span>
            </div>
          </div>
          <button class="order-close-btn" @click="showOrderDetail = false">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="order-detail-body">
          <!-- Status Banner -->
          <div class="order-status-banner" :class="getStatusClass(orderDetail.status)">
            <div class="status-icon">
              <i :class="getStatusIcon(orderDetail.status)"></i>
            </div>
            <div class="status-info">
              <span class="status-label">Order Status</span>
              <span class="status-value">{{ getStatusDisplayText(orderDetail.status) }}</span>
            </div>
            <div class="status-date">
              <i class="bi bi-calendar3 me-1"></i>
              {{ new Date(orderDetail.createdAt).toLocaleDateString('vi-VN') }}
            </div>
          </div>

          <!-- Shop Card -->
          <div class="order-shop-card">
            <div class="shop-info">
              <div class="shop-avatar">
                <i class="bi bi-shop"></i>
              </div>
              <div>
                <span class="shop-name">{{ orderDetail.products[0]?.sellerName || 'Shop' }}</span>
                <span class="shop-label">Seller</span>
              </div>
            </div>
            <button class="shop-chat-btn" @click="contactSeller(orderDetail); showOrderDetail = false">
              <i class="bi bi-chat-dots-fill"></i>
              Chat
            </button>
          </div>

          <!-- Products List -->
          <div class="order-products">
            <div class="section-title">
              <i class="bi bi-bag-check me-2"></i>Items Ordered
            </div>
            <div v-for="product in orderDetail.products" :key="product.productId" class="order-product-item">
              <img
                :src="(product.images && product.images[0]) || product.image || 'https://via.placeholder.com/80'"
                @error="$event.target.src = 'https://via.placeholder.com/80'"
                class="product-image"
                alt="Product"
              >
              <div class="product-details">
                <h6 class="product-name">{{ product.productName || product.name || 'Product' }}</h6>
                <div v-if="product.selectedOptions && Object.keys(product.selectedOptions).length > 0" class="product-options">
                  <span v-for="(value, key) in product.selectedOptions" :key="key" class="option-tag">
                    {{ key }}: {{ value }}
                  </span>
                </div>
                <span class="product-qty">Qty: {{ product.quantity }}</span>
              </div>
              <div class="product-price">
                {{ formatCurrency(product.price) }}
              </div>
            </div>
          </div>

          <!-- Order Summary -->
          <div class="order-summary">
            <div class="section-title">
              <i class="bi bi-calculator me-2"></i>Order Summary
            </div>
            <div class="summary-row">
              <span>Subtotal ({{ orderDetail.products.reduce((s, p) => s + p.quantity, 0) }} items)</span>
              <span>{{ formatCurrency(orderDetail.products.reduce((s, p) => s + p.price * p.quantity, 0)) }}</span>
            </div>
            <div class="summary-row" v-if="orderDetail.voucher && orderDetail.voucher.discountAmount">
              <span class="discount-label">
                <i class="bi bi-ticket-perforated me-1"></i>Voucher ({{ orderDetail.voucher.code }})
              </span>
              <span class="discount-value">-{{ formatCurrency(orderDetail.voucher.discountAmount) }}</span>
            </div>
            <div class="summary-row" v-if="orderDetail.coinDiscount && orderDetail.coinDiscount > 0">
              <span class="discount-label">
                <i class="bi bi-coin me-1"></i>Coins Used ({{ orderDetail.coinsUsed }})
              </span>
              <span class="discount-value">-{{ formatCurrency(orderDetail.coinDiscount) }}</span>
            </div>
            <div class="summary-row shipping">
              <span><i class="bi bi-truck me-1"></i>Shipping</span>
              <span :class="orderDetail.shippingFee > 0 ? '' : 'free-shipping'">
                {{ orderDetail.shippingFee > 0 ? formatCurrency(orderDetail.shippingFee) : 'Free' }}
              </span>
            </div>
            <div class="summary-total">
              <span>Total</span>
              <span class="total-amount">{{ formatCurrency(orderDetail.totalAmount) }}</span>
            </div>
          </div>

          <!-- Shipping & Payment Info -->
          <div class="order-info-grid">
            <!-- Shipping Address -->
            <div class="info-card shipping-card" v-if="orderDetail.shippingAddress">
              <div class="info-card-header">
                <i class="bi bi-geo-alt-fill"></i>
                <span>Shipping Address</span>
              </div>
              <div class="info-card-body">
                <div class="recipient-name">{{ orderDetail.shippingAddress.fullName }}</div>
                <div class="recipient-phone" v-if="orderDetail.shippingAddress.phoneNumber">
                  <i class="bi bi-telephone me-1"></i>{{ orderDetail.shippingAddress.phoneNumber }}
                </div>
                <div class="recipient-address">
                  {{ orderDetail.shippingAddress.streetBuildingHouse || orderDetail.shippingAddress.street || '' }}
                  <template v-if="orderDetail.shippingAddress.cityDistrictWard">, {{ orderDetail.shippingAddress.cityDistrictWard }}</template>
                </div>
              </div>
            </div>

            <!-- Payment Info -->
            <div class="info-card payment-card">
              <div class="info-card-header">
                <i class="bi bi-credit-card-fill"></i>
                <span>Payment Method</span>
              </div>
              <div class="info-card-body">
                <div class="payment-method">
                  <i :class="getPaymentIcon(orderDetail.paymentMethod)" class="payment-icon"></i>
                  <span>{{ getPaymentLabel(orderDetail.paymentMethod) }}</span>
                </div>
                <div class="payment-status" :class="orderDetail.paymentStatus === 'completed' ? 'paid' : 'pending'">
                  <i :class="orderDetail.paymentStatus === 'completed' ? 'bi bi-check-circle-fill' : 'bi bi-clock'"></i>
                  {{ orderDetail.paymentStatus === 'completed' ? 'Paid' : 'Pending' }}
                </div>
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
    <!-- Refund Modal -->
    <div v-if="showRefundModal && refundOrder" class="modal-overlay" @click.self="closeRefundModal">
      <div class="refund-modal">
        <!-- Header -->
        <div class="refund-modal-header">
          <div class="refund-header-icon">
            <i class="bi bi-arrow-counterclockwise"></i>
          </div>
          <h4>Request Refund</h4>
          <p class="refund-subtitle">Tell us why you want to return this order</p>
          <button class="refund-close-btn" @click="closeRefundModal">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Order Info Preview -->
        <div class="refund-order-preview">
          <div class="preview-label">
            <i class="bi bi-receipt me-2"></i>Order
          </div>
          <div class="preview-value">{{ refundOrder.orderNumber }}</div>
          <div class="preview-amount">{{ formatCurrency(refundOrder.totalAmount) }}</div>
        </div>

        <!-- Refund Reasons -->
        <div class="refund-section">
          <label class="refund-label">
            <i class="bi bi-question-circle me-2"></i>What's the reason for your refund?
          </label>
          <div class="refund-reasons">
            <label 
              v-for="reason in refundReasons" 
              :key="reason.value"
              class="reason-option"
              :class="{ selected: refundReason === reason.value }"
            >
              <input 
                type="radio" 
                :value="reason.value" 
                v-model="refundReason"
                class="reason-radio"
              >
              <div class="reason-icon">
                <i :class="reason.icon"></i>
              </div>
              <span class="reason-text">{{ reason.label }}</span>
              <i class="bi bi-check-circle-fill check-icon"></i>
            </label>
          </div>
        </div>

        <!-- Description -->
        <div class="refund-section">
          <label class="refund-label">
            <i class="bi bi-chat-text me-2"></i>Additional Details <span class="optional-tag">Optional</span>
          </label>
          <div class="refund-textarea-wrapper">
            <textarea
              v-model="refundDescription"
              class="refund-textarea"
              rows="3"
              placeholder="Describe the issue in more detail to help us process your request faster..."
              maxlength="500"
            ></textarea>
            <span class="char-count">{{ refundDescription?.length || 0 }}/500</span>
          </div>
        </div>

        <!-- Info Notice -->
        <div class="refund-notice">
          <i class="bi bi-info-circle"></i>
          <span>Your refund request will be reviewed by the seller within 2-3 business days. You'll be notified once a decision is made.</span>
        </div>

        <!-- Footer -->
        <div class="refund-modal-footer">
          <button class="refund-btn refund-btn-cancel" @click="closeRefundModal">
            Cancel
          </button>
          <button
            class="refund-btn refund-btn-submit"
            :disabled="!refundReason"
            @click="submitRefundRequest"
          >
            <i class="bi bi-send-fill me-2"></i>Submit Request
          </button>
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
      hoverRating: 0,
      // Order Detail Modal
      showOrderDetail: false,
      orderDetail: null,
      // Tracking Modal
      showTrackingModal: false,
      trackingOrder: null,
      // Refund Modal
      showRefundModal: false,
      refundOrder: null,
      refundReason: '',
      refundDescription: '',
      refundReasons: [
        { value: 'Item damaged or broken', label: 'Item damaged or broken', icon: 'bi bi-box-seam' },
        { value: 'Item does not match description', label: 'Doesn\'t match description', icon: 'bi bi-exclamation-triangle' },
        { value: 'Missing quantity/accessories', label: 'Missing items/accessories', icon: 'bi bi-dash-circle' },
        { value: 'Wrong item received', label: 'Wrong item received', icon: 'bi bi-shuffle' },
        { value: 'Other', label: 'Other reason', icon: 'bi bi-three-dots' }
      ]
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
        pending: 'status-pending',
        confirmed: 'status-confirmed',
        processing: 'status-processing',
        shipped: 'status-shipped',
        delivered: 'status-delivered',
        completed: 'status-completed',
        cancelled: 'status-cancelled',
        refund_requested: 'status-refund',
        refund_approved: 'status-refund',
        refund_rejected: 'status-cancelled'
      }
      return classes[status] || 'status-pending'
    },
    getStatusIcon(status) {
      const icons = {
        pending: 'bi bi-clock-fill',
        confirmed: 'bi bi-check-circle-fill',
        processing: 'bi bi-gear-fill',
        shipped: 'bi bi-truck',
        delivered: 'bi bi-box-seam-fill',
        completed: 'bi bi-check-all',
        cancelled: 'bi bi-x-circle-fill',
        refund_requested: 'bi bi-arrow-repeat',
        refund_approved: 'bi bi-arrow-counterclockwise',
        refund_rejected: 'bi bi-x-octagon-fill'
      }
      return icons[status] || 'bi bi-clock-fill'
    },
    getPaymentIcon(method) {
      const icons = {
        stripe: 'bi bi-stripe',
        credit_card: 'bi bi-credit-card-fill',
        paypal: 'bi bi-paypal',
        cash_on_delivery: 'bi bi-cash-stack'
      }
      return icons[method] || 'bi bi-wallet2'
    },
    getPaymentLabel(method) {
      const labels = {
        stripe: 'Stripe',
        credit_card: 'Credit Card',
        paypal: 'PayPal',
        cash_on_delivery: 'Cash on Delivery'
      }
      return labels[method] || method || 'COD'
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
/* ===== Profile Page - Premium Design System ===== */
.profile {
  min-height: 70vh;
}

/* Sidebar Navigation */
.list-group-item {
  border: none;
  border-radius: var(--radius-md) !important;
  margin-bottom: 0.25rem;
  padding: 0.875rem 1rem;
  transition: var(--transition-fast);
}

.list-group-item:hover {
  background: rgba(99, 102, 241, 0.05);
}

.list-group-item a {
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: var(--transition-fast);
}

.list-group-item a.active,
.list-group-item a:hover {
  color: var(--primary);
  font-weight: 600;
}

/* Cards */
.card {
  border: none;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  background: var(--surface);
}

.card-header {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 1.25rem 1.5rem;
  border-radius: var(--radius-xl) var(--radius-xl) 0 0 !important;
}

.card-header h5,
.card-header h4 {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-body {
  padding: 1.5rem;
}

/* Form Controls */
.form-label {
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.form-control,
.form-select {
  border-radius: var(--radius-lg);
  border: 2px solid var(--border);
  padding: 0.75rem 1rem;
  font-family: var(--font-body);
  transition: var(--transition-fast);
}

.form-control:focus,
.form-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
  outline: none;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-family: var(--font-body);
  transition: var(--transition-fast);
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.25);
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.35);
}

.btn-outline-primary {
  border: 2px solid var(--primary);
  border-radius: var(--radius-lg);
  font-weight: 600;
  color: var(--primary);
  background: transparent;
  transition: var(--transition-fast);
}

.btn-outline-primary:hover {
  background: rgba(99, 102, 241, 0.1);
  color: var(--primary);
  border-color: var(--primary);
}

.btn-outline-secondary {
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--surface);
  transition: var(--transition-fast);
}

.btn-outline-secondary:hover {
  border-color: var(--primary-light);
  color: var(--primary);
}

/* Avatar */
.rounded-circle {
  border: 4px solid var(--surface);
  box-shadow: var(--shadow-lg);
}

/* Badges */
.badge.bg-primary {
  background: linear-gradient(135deg, var(--primary), var(--secondary)) !important;
}

.badge.bg-success {
  background: linear-gradient(135deg, var(--success), #059669) !important;
}

.badge.bg-warning {
  background: linear-gradient(135deg, var(--warning), #D97706) !important;
  color: white !important;
}

.badge.bg-danger {
  background: linear-gradient(135deg, var(--danger), #DC2626) !important;
}

/* Review Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(15, 23, 42, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  backdrop-filter: blur(8px);
}

.modal-content-custom {
  background: var(--surface);
  border-radius: var(--radius-2xl);
  width: 90%;
  max-width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
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
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.modal-header-custom h5 {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-body-custom {
  padding: 1.5rem;
}

.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
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
  background: var(--border);
}

.tracking-step.active:not(:last-child)::before {
  background: var(--success);
}

.tracking-dot {
  position: absolute;
  left: -30px;
  top: 4px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 2px rgba(0,0,0,0.1);
}

.tracking-content strong {
  font-size: 0.95rem;
  font-family: var(--font-heading);
  color: var(--text-primary);
}

.tracking-content small {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Tables */
.table {
  --bs-table-bg: transparent;
}

.table thead th {
  font-family: var(--font-heading);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 2px solid var(--border);
  padding: 1rem;
}

.table tbody td {
  padding: 1rem;
  vertical-align: middle;
  border-bottom: 1px solid var(--border);
  color: var(--text-secondary);
}

/* Alerts */
.alert {
  border: none;
  border-radius: var(--radius-lg);
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.alert-danger {
  background: rgba(239, 68, 68, 0.1);
  color: #DC2626;
}

/* Coins Display */
.text-warning {
  color: var(--warning) !important;
}

/* ===== Responsive Styles ===== */
@media (max-width: 992px) {
  .list-group {
    flex-direction: row;
    overflow-x: auto;
    gap: 0.5rem;
    padding-bottom: 0.5rem;
  }

  .list-group-item {
    white-space: nowrap;
    flex-shrink: 0;
  }
}

@media (max-width: 768px) {
  .card-body {
    padding: 1.25rem;
  }
}

@media (max-width: 576px) {
  .modal-content-custom {
    width: 95%;
    border-radius: var(--radius-xl);
  }

  .modal-header-custom,
  .modal-body-custom,
  .modal-footer-custom {
    padding: 1rem;
  }
}

/* ===== Review Modal Styles ===== */
.review-modal {
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(255, 255, 255, 0.1);
  animation: reviewModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes reviewModalIn {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.review-modal-header {
  position: relative;
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 24px 24px 0 0;
  color: white;
}

.review-header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  backdrop-filter: blur(10px);
}

.review-header-icon i {
  font-size: 1.75rem;
  color: #fbbf24;
}

.review-modal-header h4 {
  margin: 0 0 0.25rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.review-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.review-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.review-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.review-product-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin: -1.5rem 1.5rem 1rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.review-product-img {
  width: 70px;
  height: 70px;
  border-radius: 12px;
  object-fit: cover;
  border: 2px solid #f1f5f9;
}

.review-product-info h6 {
  margin: 0 0 0.5rem;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.95rem;
  line-height: 1.3;
}

.review-order-id {
  font-size: 0.8rem;
  color: #64748b;
  background: #f1f5f9;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  display: inline-flex;
  align-items: center;
}

.review-reward-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 1.5rem 1.25rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border-radius: 12px;
  border: 1px solid #fbbf24;
}

.reward-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.reward-icon i {
  font-size: 1.25rem;
  color: white;
}

.reward-text {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.reward-title {
  font-weight: 700;
  color: #92400e;
  font-size: 0.9rem;
}

.reward-desc {
  font-size: 0.75rem;
  color: #a16207;
}

.reward-coins {
  font-weight: 800;
  font-size: 1.25rem;
  color: #b45309;
  background: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.review-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 1.5rem 1rem;
  padding: 0.875rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
}

.review-alert-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.review-alert-success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.review-section {
  padding: 0 1.5rem;
  margin-bottom: 1.25rem;
}

.review-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.review-stars {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stars-container {
  display: flex;
  gap: 0.25rem;
}

.star-icon {
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.star-icon svg {
  width: 36px;
  height: 36px;
}

.star-icon:hover {
  transform: scale(1.2);
}

.star-filled {
  color: #fbbf24;
  filter: drop-shadow(0 2px 4px rgba(251, 191, 36, 0.4));
}

.star-empty {
  color: #d1d5db;
}

.star-empty:hover {
  color: #fcd34d;
}

.rating-text {
  font-weight: 600;
  color: #f59e0b;
  font-size: 0.95rem;
  background: #fef3c7;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.review-textarea-wrapper {
  position: relative;
}

.review-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.review-textarea:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.review-textarea::placeholder {
  color: #94a3b8;
}

.char-count {
  position: absolute;
  bottom: 0.75rem;
  right: 1rem;
  font-size: 0.75rem;
  color: #94a3b8;
}

.review-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.review-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.review-btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.review-btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.review-btn-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.review-btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.review-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ===== Order Detail Modal Styles ===== */
.order-detail-modal {
  background: #ffffff;
  border-radius: 24px;
  width: 95%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: orderModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes orderModalIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.order-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%);
  color: white;
}

.order-header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.order-header-icon {
  width: 50px;
  height: 50px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.order-header-content h4 {
  margin: 0 0 0.25rem;
  font-weight: 700;
  font-size: 1.25rem;
}

.order-number-badge {
  font-size: 0.75rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-family: monospace;
}

.order-close-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.order-close-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: rotate(90deg);
}

.order-detail-body {
  max-height: calc(90vh - 90px);
  overflow-y: auto;
  padding: 0;
}

/* Status Banner */
.order-status-banner {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  margin: 1rem 1rem 0;
  border-radius: 12px;
}

.order-status-banner.status-pending {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  border: 1px solid #f59e0b;
}

.order-status-banner.status-confirmed,
.order-status-banner.status-processing {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border: 1px solid #3b82f6;
}

.order-status-banner.status-shipped {
  background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
  border: 1px solid #6366f1;
}

.order-status-banner.status-delivered,
.order-status-banner.status-completed {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  border: 1px solid #10b981;
}

.order-status-banner.status-cancelled {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  border: 1px solid #ef4444;
}

.order-status-banner.status-refund {
  background: linear-gradient(135deg, #fae8ff 0%, #f5d0fe 100%);
  border: 1px solid #a855f7;
}

.status-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.status-pending .status-icon { color: #f59e0b; }
.status-confirmed .status-icon, .status-processing .status-icon { color: #3b82f6; }
.status-shipped .status-icon { color: #6366f1; }
.status-delivered .status-icon, .status-completed .status-icon { color: #10b981; }
.status-cancelled .status-icon { color: #ef4444; }
.status-refund .status-icon { color: #a855f7; }

.status-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.status-label {
  font-size: 0.75rem;
  opacity: 0.7;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-weight: 700;
  font-size: 1rem;
  text-transform: capitalize;
}

.status-date {
  font-size: 0.8rem;
  opacity: 0.8;
}

/* Shop Card */
.order-shop-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  margin: 1rem 1rem 0;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.shop-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.1rem;
}

.shop-name {
  font-weight: 600;
  color: #1e293b;
  display: block;
}

.shop-label {
  font-size: 0.75rem;
  color: #64748b;
}

.shop-chat-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: none;
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.shop-chat-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
}

/* Products List */
.order-products {
  padding: 1rem 1.5rem;
}

.section-title {
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.order-product-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 0.75rem;
  border: 1px solid #e2e8f0;
}

.product-image {
  width: 70px;
  height: 70px;
  border-radius: 10px;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-details {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
  font-size: 0.95rem;
  line-height: 1.3;
}

.product-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.option-tag {
  font-size: 0.75rem;
  background: #e2e8f0;
  color: #475569;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.product-qty {
  font-size: 0.8rem;
  color: #64748b;
}

.product-price {
  font-weight: 700;
  color: #ef4444;
  font-size: 1rem;
  white-space: nowrap;
}

/* Order Summary */
.order-summary {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  margin: 0 1rem;
  border-radius: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.6rem 0;
  font-size: 0.9rem;
  color: #64748b;
  border-bottom: 1px dashed #e2e8f0;
}

.summary-row:last-of-type {
  border-bottom: none;
}

.discount-label {
  color: #10b981;
}

.discount-value {
  color: #10b981;
  font-weight: 600;
}

.free-shipping {
  color: #10b981;
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  margin-top: 0.5rem;
  border-top: 2px solid #e2e8f0;
}

.summary-total span:first-child {
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
}

.total-amount {
  font-weight: 800;
  color: #ef4444;
  font-size: 1.35rem;
}

/* Info Grid */
.order-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 1rem;
}

.info-card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
}

.info-card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  color: white;
}

.shipping-card .info-card-header {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.payment-card .info-card-header {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
}

.info-card-body {
  padding: 1rem;
}

.recipient-name {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.recipient-phone {
  font-size: 0.85rem;
  color: #64748b;
  margin-bottom: 0.5rem;
}

.recipient-address {
  font-size: 0.85rem;
  color: #475569;
  line-height: 1.4;
}

.payment-method {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.payment-icon {
  font-size: 1.25rem;
  color: #6366f1;
}

.payment-status {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  padding: 0.3rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
}

.payment-status.paid {
  background: #d1fae5;
  color: #059669;
}

.payment-status.pending {
  background: #fef3c7;
  color: #d97706;
}

/* Order Detail Responsive */
@media (max-width: 576px) {
  .order-detail-modal {
    width: 98%;
    border-radius: 20px;
    max-height: 95vh;
  }

  .order-detail-header {
    padding: 1rem;
  }

  .order-header-icon {
    width: 42px;
    height: 42px;
    font-size: 1.25rem;
  }

  .order-header-content h4 {
    font-size: 1.1rem;
  }

  .order-status-banner {
    margin: 0.75rem;
    padding: 0.875rem 1rem;
    flex-wrap: wrap;
  }

  .status-date {
    width: 100%;
    margin-top: 0.5rem;
    text-align: right;
  }

  .order-shop-card {
    margin: 0.75rem;
  }

  .order-products {
    padding: 0.75rem;
  }

  .order-product-item {
    padding: 0.75rem;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .order-summary {
    margin: 0 0.75rem;
  }

  .order-info-grid {
    grid-template-columns: 1fr;
    padding: 0.75rem;
  }

  .total-amount {
    font-size: 1.2rem;
  }
}

/* ===== Refund Modal Styles ===== */
.refund-modal {
  background: #ffffff;
  border-radius: 24px;
  width: 95%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
  animation: refundModalIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
}

@keyframes refundModalIn {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.refund-modal-header {
  position: relative;
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.refund-header-icon {
  width: 60px;
  height: 60px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  backdrop-filter: blur(10px);
}

.refund-header-icon i {
  font-size: 1.75rem;
}

.refund-modal-header h4 {
  margin: 0 0 0.25rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.refund-subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 0.9rem;
}

.refund-close-btn {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.refund-close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.refund-order-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin: -1rem 1rem 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  z-index: 1;
}

.preview-label {
  font-size: 0.8rem;
  color: #64748b;
}

.preview-value {
  flex: 1;
  font-weight: 600;
  color: #1e293b;
  font-family: monospace;
  font-size: 0.9rem;
}

.preview-amount {
  font-weight: 700;
  color: #ef4444;
  font-size: 1.1rem;
}

.refund-section {
  padding: 0 1.5rem;
  margin-bottom: 1.25rem;
}

.refund-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.optional-tag {
  font-size: 0.75rem;
  font-weight: 400;
  color: #94a3b8;
  background: #f1f5f9;
  padding: 0.15rem 0.5rem;
  border-radius: 10px;
  margin-left: 0.5rem;
}

.refund-reasons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.reason-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.reason-option:hover {
  border-color: #f97316;
  background: #fff7ed;
}

.reason-option.selected {
  border-color: #f97316;
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
}

.reason-radio {
  display: none;
}

.reason-icon {
  width: 36px;
  height: 36px;
  background: #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.reason-option.selected .reason-icon {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  color: white;
}

.reason-text {
  flex: 1;
  font-weight: 500;
  color: #374151;
  font-size: 0.9rem;
}

.reason-option.selected .reason-text {
  color: #c2410c;
  font-weight: 600;
}

.check-icon {
  color: #f97316;
  font-size: 1.1rem;
  opacity: 0;
  transform: scale(0);
  transition: all 0.2s ease;
}

.reason-option.selected .check-icon {
  opacity: 1;
  transform: scale(1);
}

.refund-textarea-wrapper {
  position: relative;
}

.refund-textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.95rem;
  resize: none;
  transition: all 0.2s ease;
  background: #f8fafc;
}

.refund-textarea:focus {
  outline: none;
  border-color: #f97316;
  background: white;
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.1);
}

.refund-textarea::placeholder {
  color: #94a3b8;
}

.refund-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 1.5rem 1.25rem;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #1e40af;
  line-height: 1.5;
}

.refund-notice i {
  font-size: 1rem;
  margin-top: 0.1rem;
  flex-shrink: 0;
}

.refund-modal-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #fff;
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
}

.refund-btn {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refund-btn-cancel {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.refund-btn-cancel:hover {
  background: #e2e8f0;
  color: #475569;
}

.refund-btn-submit {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4);
}

.refund-btn-submit:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(249, 115, 22, 0.5);
}

.refund-btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Refund Modal Responsive */
@media (max-width: 576px) {
  .refund-modal {
    width: 98%;
    border-radius: 20px;
  }

  .refund-modal-header {
    padding: 1.5rem 1rem 1.25rem;
  }

  .refund-header-icon {
    width: 50px;
    height: 50px;
  }

  .refund-modal-header h4 {
    font-size: 1.25rem;
  }

  .refund-order-preview {
    margin: -0.75rem 0.75rem 0.75rem;
    flex-wrap: wrap;
  }

  .preview-amount {
    width: 100%;
    text-align: right;
    margin-top: 0.5rem;
  }

  .refund-section {
    padding: 0 1rem;
  }

  .refund-notice {
    margin: 0 1rem 1rem;
  }

  .refund-modal-footer {
    padding: 1rem;
  }

  .reason-option {
    padding: 0.75rem;
  }

  .reason-icon {
    width: 32px;
    height: 32px;
  }
}

/* Review Modal Responsive */
@media (max-width: 576px) {
  .review-modal {
    width: 95%;
    border-radius: 20px;
  }

  .review-modal-header {
    padding: 1.5rem 1rem 1.25rem;
    border-radius: 20px 20px 0 0;
  }

  .review-header-icon {
    width: 50px;
    height: 50px;
  }

  .review-modal-header h4 {
    font-size: 1.25rem;
  }

  .review-product-card {
    margin: -1rem 1rem 1rem;
    padding: 0.875rem;
  }

  .review-product-img {
    width: 60px;
    height: 60px;
  }

  .review-reward-banner,
  .review-section,
  .review-alert {
    margin-left: 1rem;
    margin-right: 1rem;
  }

  .review-modal-footer {
    padding: 1rem;
  }

  .star-icon svg {
    width: 32px;
    height: 32px;
  }
}
</style>
