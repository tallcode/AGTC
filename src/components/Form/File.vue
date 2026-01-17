<script setup lang="ts">
import { inject } from 'vue'
import { FieldContextKey } from './types'

defineProps<{
  modelValue?: File | null
  accept?: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: File | null): void
}>()

const field = inject(FieldContextKey, null)

function onChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0] || null
  emit('update:modelValue', file)
  if (field) {
    field.validate(file)
  }
}
</script>

<template>
  <input
    type="file"
    v-bind="$attrs"
    :accept="accept"
    class="file-input block w-full text-base text-gray-200 bg-transparent border-0 px-3 py-3 focus:ring-0 outline-none cursor-pointer"
    @change="onChange"
  >
</template>

<style scoped>
.file-input::file-selector-button {
  display: none;
}

.file-input::-webkit-file-upload-button {
  display: none;
}

.file-input::-ms-browse {
  display: none;
}
</style>
