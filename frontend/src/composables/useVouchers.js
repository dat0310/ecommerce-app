import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useStore } from 'vuex'
import apiClient from '../api/client'

export function useMyVouchers() {
  const store = useStore()
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  return useQuery({
    queryKey: ['vouchers', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/vouchers/my-vouchers', {
        headers: { Authorization: `Bearer ${store.state.token}` }
      })
      return data
    },
    enabled: isAuthenticated
  })
}

export function useAcquireVoucher() {
  const queryClient = useQueryClient()
  const store = useStore()

  return useMutation({
    mutationFn: async (voucherId) => {
      const { data } = await apiClient.post(`/api/vouchers/${voucherId}/acquire`, {}, {
        headers: { Authorization: `Bearer ${store.state.token}` }
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vouchers'] })
      queryClient.invalidateQueries({ queryKey: ['coins'] })
    }
  })
}

export function useApplyVoucher() {
  return useMutation({
    mutationFn: async ({ code, orderTotal }) => {
      const { data } = await apiClient.post('/api/vouchers/apply', { code, orderTotal })
      return data
    }
  })
}

export function useCoins() {
  const store = useStore()
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  return useQuery({
    queryKey: ['coins'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/coins', {
        headers: { Authorization: `Bearer ${store.state.token}` }
      })
      return data
    },
    enabled: isAuthenticated
  })
}

export function useClaimDailyCoins() {
  const queryClient = useQueryClient()
  const store = useStore()

  return useMutation({
    mutationFn: async () => {
      const { data } = await apiClient.post('/api/coins/claim-daily', {}, {
        headers: { Authorization: `Bearer ${store.state.token}` }
      })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coins'] })
    }
  })
}
