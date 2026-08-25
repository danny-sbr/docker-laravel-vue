/** ExampleItem 狀態列舉 */
export type ExampleItemStatus = 'active' | 'inactive' | 'archived'

/** ExampleItem 資料模型 */
export interface ExampleItem {
  id: number
  name: string
  description: string | null
  status: ExampleItemStatus
  createdAt: string
  updatedAt: string
}

/** 新增 ExampleItem 請求資料 */
export type CreateExampleItemPayload = {
  name: string
  description?: string | null
  status: ExampleItemStatus
}

/** 更新 ExampleItem 請求資料 */
export type UpdateExampleItemPayload = {
  name?: string
  description?: string | null
  status?: ExampleItemStatus
}

/** Laravel 分頁回應 */
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}
