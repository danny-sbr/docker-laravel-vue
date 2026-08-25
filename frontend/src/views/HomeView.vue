<script setup>
const visible = ref(false)
</script>
<template>
  <h1 class="text-3xl font-bold underline">Hello world!</h1>

  <Button label="Show" @click="visible = true" />
  <Dialog
    v-model:visible="visible"
    modal
    header="Edit Profile"
    :style="{ width: '25rem' }"
  >
    <span class="text-surface-500 dark:text-surface-400 mb-8 block"
      >Update your information.</span
    >
    <div class="mb-4 flex items-center gap-4">
      <label for="username" class="w-24 font-semibold">Username</label>
      <InputText id="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="mb-8 flex items-center gap-4">
      <label for="email" class="w-24 font-semibold">Email</label>
      <InputText id="email" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
      <Button
        type="button"
        label="Cancel"
        severity="secondary"
        @click="visible = false"
      ></Button>
      <Button type="button" label="Save" @click="visible = false"></Button>
    </div>
  </Dialog>
  <Message severity="success">Success Message</Message>
  <Message severity="info">Info Message</Message>
  <Message severity="warn">Warn Message</Message>
  <Message severity="error">Error Message</Message>
  <Message severity="secondary">Secondary Message</Message>
  <Message severity="contrast">Contrast Message</Message>
</template>
<style scoped></style>
