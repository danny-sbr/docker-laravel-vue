import apiClient from '@/utils/axios'

/**
 * @typedef {import('@/types/example-item').ExampleItem} ExampleItem
 * @typedef {import('@/types/example-item').CreateExampleItemPayload} CreateExampleItemPayload
 * @typedef {import('@/types/example-item').UpdateExampleItemPayload} UpdateExampleItemPayload
 * @typedef {import('@/types/example-item').PaginatedResponse} PaginatedResponse
 */

/** ExampleItem API composable */
export function useExampleItemApi() {
  /** @type {(page?: number) => Promise<import('axios').AxiosResponse<PaginatedResponse<ExampleItem>>>} */
  const getAll = (page = 1) => apiClient.get('/example', { params: { page } })

  /** @type {(id: number) => Promise<import('axios').AxiosResponse<{ data: ExampleItem }>>} */
  const getById = (id) => apiClient.get(`/example/${id}`)

  /** @type {(payload: CreateExampleItemPayload) => Promise<import('axios').AxiosResponse<{ data: ExampleItem }>>} */
  const create = (payload) => apiClient.post('/example', payload)

  /** @type {(id: number, payload: UpdateExampleItemPayload) => Promise<import('axios').AxiosResponse<{ data: ExampleItem }>>} */
  const update = (id, payload) => apiClient.put(`/example/${id}`, payload)

  /** @type {(id: number) => Promise<import('axios').AxiosResponse<void>>} */
  const remove = (id) => apiClient.delete(`/example/${id}`)

  return { getAll, getById, create, update, remove }
}
