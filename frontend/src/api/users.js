import apiClient from './client'

export const loginApi = async (credentials) => {
  const { data } = await apiClient.post('/api/users/login', credentials)
  return data
}

export const registerApi = async (userData) => {
  const { data } = await apiClient.post('/api/users/register', userData)
  return data
}

export const fetchUserProfile = async () => {
  const { data } = await apiClient.get('/api/users/me')
  return data
}

export const refreshTokenApi = async (refreshToken) => {
  const { data } = await apiClient.post('/api/users/refresh-token', { refreshToken })
  return data
}

export const updateUserProfile = async (profileData) => {
  const { data } = await apiClient.put('/api/users/me', profileData)
  return data
}

export const deleteAccountApi = async () => {
  const { data } = await apiClient.delete('/api/users/me')
  return data
}
