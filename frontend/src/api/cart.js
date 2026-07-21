import apiClient from './client'

export const fetchCart = async () => {
  const { data } = await apiClient.get('/api/cart')
  return data
}

export const addCartItem = async ({ productId, quantity, selectedOptions }) => {
  const { data } = await apiClient.post('/api/cart/items', {
    productId,
    quantity,
    selectedOptions: selectedOptions || {}
  })
  return data
}

export const updateCartItem = async ({ productId, quantity, selectedOptions }) => {
  const { data } = await apiClient.patch(`/api/cart/items/${productId}`, {
    quantity,
    selectedOptions
  })
  return data
}

export const removeCartItem = async ({ productId, selectedOptions }) => {
  const { data } = await apiClient.delete(`/api/cart/items/${productId}`, {
    data: { selectedOptions }
  })
  return data
}

export const clearCartApi = async () => {
  const { data } = await apiClient.delete('/api/cart')
  return data
}
