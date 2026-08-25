import { ref } from 'vue'
import { defineStore } from 'pinia'
import { useExampleItemApi } from '@/composables/useExampleItemApi'

/**
 * @typedef {import('@/types/example-item').ExampleItem} ExampleItem
 */

export const useExampleItemStore = defineStore('exampleItem', () => {
  const api = useExampleItemApi()

  /** @type {import('vue').Ref<ExampleItem[]>} */
  const items = ref([])

  /** @type {import('vue').Ref<boolean>} */
  const loading = ref(false)

  /** @type {import('vue').Ref<number>} */
  const totalRecords = ref(0)

  /** @type {import('vue').Ref<number>} */
  const currentPage = ref(1)

  /** @type {(page?: number) => Promise<void>} */
  const fetchAll = async (page = 1) => {
    loading.value = true
    try {
      const res = await api.getAll(page)
      items.value = res.data.data
      totalRecords.value = res.data.total
      currentPage.value = res.data.current_page
    } finally {
      loading.value = false
    }
  }

  /** @type {(payload: import('@/types/example-item').CreateExampleItemPayload) => Promise<ExampleItem>} */
  const createItem = async (payload) => {
    const res = await api.create(payload)
    await fetchAll(currentPage.value)
    return res.data.data
  }

  /** @type {(id: number, payload: import('@/types/example-item').UpdateExampleItemPayload) => Promise<ExampleItem>} */
  const updateItem = async (id, payload) => {
    const res = await api.update(id, payload)
    await fetchAll(currentPage.value)
    return res.data.data
  }

  /** @type {(id: number) => Promise<void>} */
  const deleteItem = async (id) => {
    await api.remove(id)
    await fetchAll(currentPage.value)
  }

  return { items, loading, totalRecords, currentPage, fetchAll, createItem, updateItem, deleteItem }
})
