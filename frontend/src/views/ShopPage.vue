<template>
  <div class="shop-page">
    <!-- Loading -->
    <div v-if="isLoading" class="loading-state">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p>Loading shop...</p>
    </div>

    <!-- Shop Content -->
    <div v-else-if="shopData">
      <!-- Shop Header -->
      <section class="shop-header">
        <div class="container">
          <div class="shop-header-content" data-aos="fade-up">
            <div class="shop-avatar-wrapper">
              <img
                v-if="shopData.seller?.avatar"
                :src="shopData.seller.avatar"
                :alt="shopName"
                class="shop-avatar"
              >
              <div v-else class="shop-avatar-placeholder">
                <i class="bi bi-shop"></i>
              </div>
            </div>
            <div class="shop-info">
              <h1 class="shop-name">{{ shopName }}</h1>
              <div class="shop-meta">
                <span class="shop-meta-item">
                  <i class="bi bi-box-seam"></i>
                  {{ shopProducts.length }} Products
                </span>
                <span v-if="shopData.seller?.joinedAt" class="shop-meta-item">
                  <i class="bi bi-calendar3"></i>
                  Joined {{ formatDate(shopData.seller.joinedAt) }}
                </span>
              </div>
            </div>
            <div class="shop-actions">
              <button v-if="isAuthenticated" class="btn-chat-seller" @click="openChat">
                <i class="bi bi-chat-dots"></i>
                Chat with Seller
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- Products Section -->
      <section class="shop-products-section">
        <div class="container">
          <!-- Filter Bar -->
          <div class="filter-bar" data-aos="fade-up" data-aos-delay="100">
            <div class="filter-info">
              <span class="product-count">
                <i class="bi bi-grid-3x3-gap-fill"></i>
                {{ filteredProducts.length }} Products
              </span>
              <span v-if="selectedCategory" class="active-filter">
                {{ selectedCategory }}
                <button @click="selectedCategory = ''" class="filter-remove">
                  <i class="bi bi-x"></i>
                </button>
              </span>
            </div>
            <div class="filter-controls">
              <select v-if="categories.length > 1" v-model="selectedCategory" class="sort-select category-select">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
              <select v-model="sortBy" class="sort-select">
                <option value="newest">Newest First</option>
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          <!-- Empty State -->
          <div v-if="filteredProducts.length === 0" class="empty-state" data-aos="fade-up">
            <div class="empty-icon">
              <i class="bi bi-bag-x"></i>
            </div>
            <h3>No products found</h3>
            <p>This shop hasn't listed any products yet, or no products match your filter.</p>
            <button v-if="selectedCategory" @click="selectedCategory = ''" class="btn btn-primary">
              <i class="bi bi-arrow-clockwise me-2"></i>
              Clear Filter
            </button>
          </div>

          <!-- Products Grid -->
          <div v-else class="products-grid">
            <article
              v-for="(product, index) in paginatedProducts"
              :key="product._id"
              class="product-card-wrapper"
              data-aos="fade-up"
              :data-aos-delay="50 * (index % 4)"
            >
              <div class="product-card" @click="$router.push('/products/' + product._id)">
                <div class="product-image">
                  <img
                    :src="(product.images && product.images[0]) || product.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'"
                    :alt="product.name"
                    loading="lazy"
                  >
                  <div class="product-badges">
                    <span v-if="product.stock > 0" class="badge badge-stock in-stock">In Stock</span>
                    <span v-else class="badge badge-stock out-of-stock">Out of Stock</span>
                  </div>
                  <button
                    class="wishlist-btn"
                    @click.stop="toggleWishlist(product)"
                    :class="{ 'active': isWishlisted(product._id) }"
                    :aria-label="isWishlisted(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'"
                  >
                    <i :class="isWishlisted(product._id) ? 'bi bi-heart-fill' : 'bi bi-heart'"></i>
                  </button>
                  <span class="product-category">{{ product.category || 'Uncategorized' }}</span>
                </div>
                <div class="product-info">
                  <h3 class="product-name">{{ product.name }}</h3>
                  <p class="product-description">{{ truncateText(product.description, 80) }}</p>
                  <div class="product-footer">
                    <span class="product-price">{{ getDisplayPrice(product) }}</span>
                    <span class="product-stock">{{ product.stock || 0 }} left</span>
                  </div>
                </div>
              </div>
            </article>
          </div>

          <!-- Pagination -->
          <nav v-if="totalPages > 1" class="pagination-wrapper" aria-label="Shop products pagination">
            <ul class="pagination">
              <li>
                <button class="page-btn" @click="currentPage = 1" :disabled="currentPage === 1" aria-label="First page">
                  <i class="bi bi-chevron-double-left"></i>
                </button>
              </li>
              <li>
                <button class="page-btn" @click="currentPage--" :disabled="currentPage === 1" aria-label="Previous page">
                  <i class="bi bi-chevron-left"></i>
                </button>
              </li>
              <li v-for="page in visiblePages" :key="page">
                <button class="page-btn" :class="{ active: page === currentPage }" @click="currentPage = page">
                  {{ page }}
                </button>
              </li>
              <li>
                <button class="page-btn" @click="currentPage++" :disabled="currentPage === totalPages" aria-label="Next page">
                  <i class="bi bi-chevron-right"></i>
                </button>
              </li>
              <li>
                <button class="page-btn" @click="currentPage = totalPages" :disabled="currentPage === totalPages" aria-label="Last page">
                  <i class="bi bi-chevron-double-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </section>
    </div>

    <!-- Error / Not Found -->
    <div v-else class="empty-state">
      <div class="empty-icon">
        <i class="bi bi-shop-window"></i>
      </div>
      <h3>Shop not found</h3>
      <p>The shop you're looking for doesn't exist or has been removed.</p>
      <router-link to="/" class="btn btn-primary">
        <i class="bi bi-house me-2"></i>
        Back to Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, getCurrentInstance, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { useShopProducts } from '../composables/useProducts'

const route = useRoute()
const store = useStore()
const { proxy } = getCurrentInstance()

const sellerId = computed(() => route.params.sellerId)
const { data: shopData, isLoading } = useShopProducts(sellerId)

const isAuthenticated = computed(() => store.getters.isAuthenticated)

const sortBy = ref('newest')
const selectedCategory = ref('')
const currentPage = ref(1)
const itemsPerPage = 12
const wishlistIds = ref([])

const shopName = computed(() => {
  if (shopData.value?.seller?.name) return shopData.value.seller.name
  if (shopData.value?.products?.length > 0) return shopData.value.products[0].sellerName
  return 'Shop'
})

const shopProducts = computed(() => shopData.value?.products || [])

const categories = computed(() => {
  const cats = new Set(shopProducts.value.map(p => p.category).filter(Boolean))
  return [...cats].sort()
})

const sortProducts = (items) => {
  const sorted = [...items]
  switch (sortBy.value) {
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price)
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price)
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    case 'name':
    default:
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
  }
}

const filteredProducts = computed(() => {
  let filtered = shopProducts.value
  if (selectedCategory.value) {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }
  return sortProducts(filtered)
})

const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

const getDisplayPrice = (product) => {
  if (product.productCombinations && product.productCombinations.length > 0) {
    const prices = product.productCombinations.map(c => c.price)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    if (minPrice === maxPrice) return `$${minPrice}`
    return `$${minPrice} - $${maxPrice}`
  }
  return `$${product.price}`
}

const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

// Wishlist
const loadWishlist = () => {
  try {
    const raw = localStorage.getItem('wishlist')
    const items = raw ? JSON.parse(raw) : []
    wishlistIds.value = items.map(item => item._id)
  } catch (_) {
    wishlistIds.value = []
  }
}

const isWishlisted = (productId) => wishlistIds.value.includes(productId)

const toggleWishlist = (product) => {
  if (!product) return
  let items = []
  try {
    items = JSON.parse(localStorage.getItem('wishlist') || '[]')
  } catch (_) {
    items = []
  }
  const index = items.findIndex(it => it._id === product._id)
  if (index >= 0) {
    items.splice(index, 1)
    proxy.$toast && proxy.$toast.info('Removed from wishlist', { position: 'top-right', timeout: 1800 })
  } else {
    items.push({ _id: product._id, name: product.name, price: product.price, image: (product.images && product.images[0]) || product.image || '' })
    proxy.$toast && proxy.$toast.success('Added to wishlist', { position: 'top-right', timeout: 1800 })
  }
  localStorage.setItem('wishlist', JSON.stringify(items))
  wishlistIds.value = items.map(it => it._id)
  window.dispatchEvent(new Event('wishlist-updated'))
}

const openChat = () => {
  window.dispatchEvent(new CustomEvent('open-seller-chat', {
    detail: { sellerId: sellerId.value, sellerName: shopName.value }
  }))
}

loadWishlist()

watch(selectedCategory, () => { currentPage.value = 1 })
watch(sortBy, () => { currentPage.value = 1 })
</script>

<style scoped>
/* ═══════════════════════════════════════════════════════════════════════════
   Shop Page Premium Styles
   ═══════════════════════════════════════════════════════════════════════════ */

/* Shop Header */
.shop-header {
  background: var(--gradient-hero);
  padding: 48px 0;
  position: relative;
  overflow: hidden;
}

.shop-header::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 50%;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
}

.shop-header-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 24px;
}

.shop-avatar-wrapper {
  flex-shrink: 0;
}

.shop-avatar {
  width: 88px;
  height: 88px;
  border-radius: var(--radius-xl);
  object-fit: cover;
  border: 3px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.shop-avatar-placeholder {
  width: 88px;
  height: 88px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border-radius: var(--radius-xl);
  border: 3px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.9);
  font-size: 2rem;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-family: var(--font-heading);
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: 8px;
}

.shop-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.shop-meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
}

.shop-meta-item i {
  font-size: 0.85rem;
}

.shop-actions {
  flex-shrink: 0;
}

.btn-chat-seller {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-full);
  color: var(--white);
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-chat-seller:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

/* Products Section */
.shop-products-section {
  padding: 40px 0 80px;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  margin-bottom: 32px;
}

.filter-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-count {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: var(--text-primary);
}

.product-count i {
  color: var(--primary);
}

.active-filter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
}

.filter-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  background: var(--primary);
  border: none;
  border-radius: var(--radius-full);
  color: var(--white);
  font-size: 0.75rem;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.filter-remove:hover {
  background: var(--primary-hover);
}

.filter-controls {
  display: flex;
  gap: 12px;
}

.sort-select {
  min-width: 180px;
  padding: 10px 36px 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
  background: var(--gray-50);
  border: 2px solid transparent;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23475569' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
}

.sort-select:hover {
  background-color: var(--white);
}

.sort-select:focus {
  border-color: var(--primary);
  background-color: var(--white);
  outline: none;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.loading-state p,
.empty-state p {
  color: var(--text-secondary);
  margin-top: 16px;
}

.empty-icon {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gray-50);
  border-radius: var(--radius-full);
  font-size: 2rem;
  color: var(--text-muted);
  margin-bottom: 24px;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

/* Products Grid */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  align-items: stretch;
}

.product-card-wrapper {
  height: 100%;
}

.product-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  overflow: hidden;
  cursor: pointer;
  transition: all var(--transition-smooth);
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-card-hover);
  border-color: transparent;
}

.product-image {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 4/3;
  overflow: hidden;
  padding: 12px;
  background: var(--white);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  transition: transform var(--transition-slow);
}

.product-card:hover .product-image img {
  transform: scale(1.05);
}

.product-badges {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 2;
}

.badge-stock {
  padding: 4px 10px;
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.badge-stock.in-stock {
  background: var(--success-light);
  color: var(--success);
}

.badge-stock.out-of-stock {
  background: var(--danger-light);
  color: var(--danger);
}

.wishlist-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--white);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  z-index: 2;
}

.wishlist-btn:hover {
  transform: scale(1.1);
}

.wishlist-btn.active {
  color: var(--danger);
}

.product-category {
  position: absolute;
  bottom: 12px;
  left: 12px;
  padding: 4px 12px;
  background: var(--gradient-primary);
  color: var(--white);
  font-size: 0.7rem;
  font-weight: 600;
  border-radius: var(--radius-full);
  text-transform: uppercase;
  letter-spacing: 0.02em;
  z-index: 2;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.product-name {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-description {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 16px;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid var(--border-light);
}

.product-price {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

.product-stock {
  font-size: 0.8rem;
  color: var(--text-muted);
}

/* Pagination */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 48px;
}

.pagination {
  display: flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.page-btn.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: var(--white);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ═══════════════════════════════════════════════════════════════════════════
   RESPONSIVE
   ═══════════════════════════════════════════════════════════════════════════ */
@media (max-width: 768px) {
  .shop-header {
    padding: 32px 0;
  }

  .shop-header-content {
    flex-direction: column;
    text-align: center;
  }

  .shop-name {
    font-size: 1.4rem;
  }

  .shop-meta {
    justify-content: center;
  }

  .filter-bar {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .filter-info {
    justify-content: center;
  }

  .filter-controls {
    flex-direction: column;
  }

  .sort-select {
    width: 100%;
    min-width: unset;
  }

  .products-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 576px) {
  .products-grid {
    grid-template-columns: 1fr;
  }

  .shop-avatar,
  .shop-avatar-placeholder {
    width: 72px;
    height: 72px;
  }

  .pagination {
    gap: 4px;
  }

  .page-btn {
    min-width: 36px;
    height: 36px;
    font-size: 0.8rem;
  }
}
</style>
