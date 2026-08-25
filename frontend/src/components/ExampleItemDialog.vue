<script setup>
import { useToast } from 'primevue/usetoast'

/**
 * @typedef {import('@/types/example-item').ExampleItem} ExampleItem
 * @typedef {import('@/types/example-item').ExampleItemStatus} ExampleItemStatus
 */

const props = defineProps({
  visible: { type: Boolean, required: true },
  item: {
    /** @type {import('vue').PropType<ExampleItem | null>} */
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:visible', 'saved'])

const toast = useToast()

/** @type {import('vue').Ref<string>} */
const name = ref('')

/** @type {import('vue').Ref<string>} */
const description = ref('')

/** @type {import('vue').Ref<ExampleItemStatus>} */
const status = ref('active')

/** @type {import('vue').Ref<string>} */
const errorMessage = ref('')

/** @type {import('vue').Ref<boolean>} */
const submitting = ref(false)

/** 狀態選項 */
const statusOptions = [
  { label: '啟用', value: 'active' },
  { label: '停用', value: 'inactive' },
  { label: '封存', value: 'archived' },
]

/** 是否為編輯模式 */
const isEdit = computed(() => props.item !== null)

/** Dialog 標題 */
const dialogTitle = computed(() => (isEdit.value ? '編輯項目' : '新增項目'))

/** 監聽 item 變化，填入表單 */
watch(
  () => props.item,
  (val) => {
    if (val) {
      name.value = val.name
      description.value = val.description || ''
      status.value = val.status
    } else {
      name.value = ''
      description.value = ''
      status.value = 'active'
    }
    errorMessage.value = ''
  },
)

/** 監聯 visible 變化，重置錯誤 */
watch(
  () => props.visible,
  (val) => {
    if (val && !props.item) {
      name.value = ''
      description.value = ''
      status.value = 'active'
      errorMessage.value = ''
    }
  },
)

/** 關閉 Dialog */
const close = () => {
  emit('update:visible', false)
}

/** 送出表單 */
const submit = async () => {
  errorMessage.value = ''

  if (!name.value.trim()) {
    errorMessage.value = '名稱為必填欄位'
    return
  }

  submitting.value = true
  try {
    const payload = {
      name: name.value.trim(),
      description: description.value.trim() || null,
      status: status.value,
    }

    emit('saved', { payload, id: props.item?.id || null })
    close()
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    :header="dialogTitle"
    modal
    :style="{ width: '450px' }"
    @update:visible="close"
  >
    <div class="flex flex-col gap-4">
      <div v-if="errorMessage" class="text-red-500 text-sm">
        {{ errorMessage }}
      </div>

      <div class="flex flex-col gap-2">
        <label for="name">名稱 *</label>
        <InputText id="name" v-model="name" placeholder="請輸入名稱" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="description">描述</label>
        <Textarea id="description" v-model="description" rows="3" placeholder="請輸入描述" />
      </div>

      <div class="flex flex-col gap-2">
        <label for="status">狀態</label>
        <Select
          id="status"
          v-model="status"
          :options="statusOptions"
          option-label="label"
          option-value="value"
        />
      </div>
    </div>

    <template #footer>
      <Button label="取消" severity="secondary" @click="close" />
      <Button :label="isEdit ? '更新' : '新增'" :loading="submitting" @click="submit" />
    </template>
  </Dialog>
</template>
