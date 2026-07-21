import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useStore } from 'vuex'
import { loginApi, registerApi, fetchUserProfile } from '../api/users'

export function useLogin() {
  const store = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (data) => {
      store.commit('SET_TOKEN', data.token)
      store.commit('SET_REFRESH_TOKEN', data.refreshToken)
      store.commit('SET_USER', data.user)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      queryClient.invalidateQueries({ queryKey: ['user', 'profile'] })
    }
  })
}

export function useRegister() {
  const store = useStore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: registerApi,
    onSuccess: (data) => {
      store.commit('SET_TOKEN', data.token)
      store.commit('SET_REFRESH_TOKEN', data.refreshToken)
      store.commit('SET_USER', data.user)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useUserProfile() {
  const store = useStore()
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: fetchUserProfile,
    enabled: isAuthenticated
  })
}

export function useLogout() {
  const store = useStore()
  const queryClient = useQueryClient()

  const logout = () => {
    store.dispatch('logoutUser')
    queryClient.clear()
  }

  return { logout }
}
