import { computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import { useStore } from 'vuex'
import { fetchCart, addCartItem, updateCartItem, removeCartItem, clearCartApi } from '../api/cart'

// Cart item key helpers (moved from Vuex store)
const normalizeSelectedOptions = (selectedOptions = {}) => {
  const raw = selectedOptions instanceof Map
    ? Object.fromEntries(selectedOptions)
    : (selectedOptions || {})

  return Object.keys(raw)
    .sort()
    .reduce((acc, key) => {
      acc[key] = raw[key]
      return acc
    }, {})
}

const buildCartItemKey = (productId, selectedOptions = {}) =>
  `${productId}::${JSON.stringify(normalizeSelectedOptions(selectedOptions))}`

const hydrateCartItem = (item = {}) => {
  const productId = item._id || item.productId
  const normalizedOptions = normalizeSelectedOptions(item.selectedOptions)
  return {
    ...item,
    _id: productId,
    selectedOptions: normalizedOptions,
    cartItemKey: item.cartItemKey || buildCartItemKey(productId, normalizedOptions)
  }
}

const hydrateCartItems = (items = []) => items.map(hydrateCartItem)

const mapCartItemsFromApi = (items = []) => hydrateCartItems(items.map(i => ({
  _id: i.productId,
  name: i.name,
  price: i.price,
  image: i.image,
  category: i.category || '',
  stock: i.stock || 99,
  quantity: i.quantity,
  sellerId: i.sellerId,
  sellerName: i.sellerName,
  selectedOptions: i.selectedOptions instanceof Map
    ? Object.fromEntries(i.selectedOptions)
    : (i.selectedOptions || {})
})))

export { normalizeSelectedOptions, buildCartItemKey, hydrateCartItem, hydrateCartItems, mapCartItemsFromApi }

export function useCart() {
  const store = useStore()
  const isAuthenticated = computed(() => store.getters.isAuthenticated)

  const query = useQuery({
    queryKey: ['cart'],
    queryFn: fetchCart,
    enabled: isAuthenticated,
    select: (data) => {
      const items = mapCartItemsFromApi(data?.items || [])
      return {
        ...data,
        items
      }
    }
  })

  const cartItems = computed(() => query.data.value?.items || [])
  const cartItemCount = computed(() => cartItems.value.reduce((total, item) => total + item.quantity, 0))
  const cartTotal = computed(() => cartItems.value.reduce((total, item) => total + (item.price * item.quantity), 0))

  return {
    ...query,
    cartItems,
    cartItemCount,
    cartTotal
  }
}

export function useAddToCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: addCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: removeCartItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}

export function useClearCart() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: clearCartApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] })
    }
  })
}
