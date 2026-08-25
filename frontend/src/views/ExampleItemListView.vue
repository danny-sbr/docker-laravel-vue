<script setup>
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { useExampleItemStore } from '@/stores/exampleItem'
import ExampleItemDialog from '@/components/ExampleItemDialog.vue'

/**
 * @typedef {import('@/types/example-item').ExampleItem} ExampleItem
 */

const store = useExampleItemStore()
const toast = useToast()
const confirm = useConfirm()

/** @type {import('vue').Ref<boolean>} */
const dialogVisible = ref(false)

/** @type {import('vue').Ref<ExampleItem | null>} */
const editingItem = ref(null)

/** 狀態標籤對應的 severity */
const statusSeverityMap = {
  active: 'success',
  inactive: 'warn',
  archived: 'secondary',
}

/** 狀態標籤對應的顯示文字 */
const statusLabelMap = {
  active: '啟用',
  inactive: '停用',
  archived: '封存',
}

/** 載入資料 */
onMounted(() => {
  store.fetchAll()
})

/** 開啟新增 Dialog */
const openCreate = () => {
  editingItem.value = null
  dialogVisible.value = true
}

/** 開啟編輯 Dialog */
/** @type {(item: ExampleItem) => void} */
const openEdit = (item) => {
  editingItem.value = item
  dialogVisible.value = true
}

/** 處理 Dialog 儲存事件 */
/** @type {(event: { payload: any, id: number | null }) => Promise<void>} */
const handleSaved = async (event) => {
  try {
    if (event.id) {
      await store.updateItem(event.id, event.payload)
      toast.add({ severity: 'success', summary: '成功', detail: '更新成功', life: 3000 })
    } else {
      await store.createItem(event.payload)
      toast.add({ severity: 'success', summary: '成功', detail: '新增成功', life: 3000 })
    }
  } catch (err) {
    const message = err?.response?.data?.message || '操作失敗'
    toast.add({ severity: 'error', summary: '錯誤', detail: message, life: 5000 })
  }
}

/** 刪除確認 */
/** @type {(item: ExampleItem) => void} */
const confirmDelete = (item) => {
  confirm.require({
    message: `確定要刪除「${item.name}」嗎？`,
    header: '刪除確認',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: '確定刪除',
    rejectLabel: '取消',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await store.deleteItem(item.id)
        toast.add({ severity: 'success', summary: '成功', detail: '刪除成功', life: 3000 })
      } catch {
        toast.add({ severity: 'error', summary: '錯誤', detail: '刪除失敗', life: 5000 })
      }
    },
  })
}

/** 分頁切換 */
/** @type {(event: { page: number }) => void} */
const onPageChange = (event) => {
  store.fetchAll(event.page + 1)
}
</script>

<template>
  <div class="p-4">
    <Toolbar class="mb-4">
      <template #start>
        <h2 class="text-xl font-bold">範例項目管理</h2>
      </template>
      <template #end>
        <Button label="新增" icon="pi pi-plus" @click="openCreate" />
      </template>
    </Toolbar>

    <DataTable
      :value="store.items"
      :loading="store.loading"
      :lazy="true"
      :paginator="true"
      :rows="15"
      :total-records="store.totalRecords"
      @page="onPageChange"
    >
      <Column field="id" header="ID" style="width: 80px" />
      <Column field="name" header="名稱" />
      <Column field="description" header="描述" />
      <Column field="status" header="狀態" style="width: 100px">
        <template #body="{ data }">
          <Tag :value="statusLabelMap[data.status]" :severity="statusSeverityMap[data.status]" />
        </template>
      </Column>
      <Column header="操作" style="width: 150px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button icon="pi pi-pencil" severity="info" text rounded @click="openEdit(data)" />
            <Button
              icon="pi pi-trash"
              severity="danger"
              text
              rounded
              @click="confirmDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <ExampleItemDialog v-model:visible="dialogVisible" :item="editingItem" @saved="handleSaved" />
  </div>
</template>
