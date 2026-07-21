import apiClient from './client'

export const createPaymentIntent = async (paymentData) => {
  const { data } = await apiClient.post('/api/payments/create-payment-intent', paymentData)
  return data
}
