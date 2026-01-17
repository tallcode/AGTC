<script setup lang="ts">
import { inject } from 'vue'
import { FieldContextKey } from './types'

const props = defineProps<{
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

function onBlur() {
  if (field) {
    field.validate(props.modelValue)
  }
}
</script>

<template>
  <input
    type="file"
    v-bind="$attrs"
    :accept="accept"
    class="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 rounded bg-transparent border-0 py-3 px-3 focus:ring-0 outline-none"
    @change="onChange"
    @blur="onBlur"
  >
</template>
