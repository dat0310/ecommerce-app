import apiClient from './client'

export const fetchProducts = async () => {
  const { data } = await apiClient.get('/api/products')
  return data
}

export const fetchProductById = async (id) => {
  const { data } = await apiClient.get(`/api/products/${id}`)
  return data
}

export const fetchProductReviews = async (productId) => {
  const { data } = await apiClient.get(`/api/products/${productId}/reviews`)
  return data
}

export const fetchShopProducts = async (sellerId) => {
  const { data } = await apiClient.get(`/api/products/seller/${sellerId}/public`)
  return data
}
