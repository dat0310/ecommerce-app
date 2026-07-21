import apiClient from './client'

export const fetchOrders = async () => {
  const { data } = await apiClient.get('/api/orders')
  return data
}

export const fetchMyPurchases = async () => {
  const { data } = await apiClient.get('/api/my-purchases')
  return data
}

export const createOrder = async (orderData) => {
  const { data } = await apiClient.post('/api/orders', orderData)
  return data
}

export const fetchOrderById = async (orderId) => {
  const { data } = await apiClient.get(`/api/orders/${orderId}`)
  return data
}

export const updateOrderStatus = async ({ orderId, status }) => {
  const { data } = await apiClient.patch(`/api/orders/${orderId}/status`, { status })
  return data
}
