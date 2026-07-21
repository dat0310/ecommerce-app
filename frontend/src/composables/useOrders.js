import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useStore } from 'vuex'
import apiClient from '../api/client'

export function useMyOrders() {
  const store = useStore()
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  return useQuery({
    queryKey: ['orders', 'my'],
    queryFn: async () => {
      const { data } = await apiClient.get('/api/users/me/orders')
      return data
    },
    enabled: isAuthenticated
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderData) => {
      const { data } = await apiClient.post('/api/orders', orderData)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId) => {
      const { data } = await apiClient.patch(`/api/orders/${orderId}/cancel`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export function useConfirmReceived() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId) => {
      const { data } = await apiClient.patch(`/api/orders/${orderId}/confirm-received`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export function useRequestRefund() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ orderId, reason }) => {
      const { data } = await apiClient.patch(`/api/orders/${orderId}/request-refund`, { reason })
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}

export function useOpenDispute() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (orderId) => {
      const { data } = await apiClient.patch(`/api/orders/${orderId}/open-dispute`)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    }
  })
}
