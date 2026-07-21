import { computed, unref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { fetchProducts, fetchProductById, fetchProductReviews, fetchShopProducts } from '../api/products'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts
  })
}

export function useProduct(id) {
  return useQuery({
    queryKey: computed(() => ['products', unref(id)]),
    queryFn: () => fetchProductById(unref(id)),
    enabled: computed(() => !!unref(id))
  })
}

export function useProductReviews(productId) {
  return useQuery({
    queryKey: computed(() => ['products', unref(productId), 'reviews']),
    queryFn: () => fetchProductReviews(unref(productId)),
    enabled: computed(() => !!unref(productId))
  })
}

export function useShopProducts(sellerId) {
  return useQuery({
    queryKey: computed(() => ['shop', unref(sellerId)]),
    queryFn: () => fetchShopProducts(unref(sellerId)),
    enabled: computed(() => !!unref(sellerId))
  })
}
