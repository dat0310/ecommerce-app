import apiClient from './client'

export const fetchVouchers = async () => {
  const { data } = await apiClient.get('/api/vouchers')
  return data
}

export const applyVoucher = async (code) => {
  const { data } = await apiClient.post('/api/vouchers/apply', { code })
  return data
}
