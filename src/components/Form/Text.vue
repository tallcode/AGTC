<script setup lang="ts">
import { inject } from 'vue'
import { FieldContextKey } from './types'

const props = defineProps<{
  modelValue?: string | number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const field = inject(FieldContextKey, null)

function onInput(e: Event) {
  const val = (e.target as HTMLInputElement).value
  emit('update:modelValue', val)
}

function onBlur() {
  if (field) {
    field.validate(props.modelValue)
  }
}
</script>

<template>
  <input
    type="text"
    v-bind="$attrs"
    :value="modelValue"
    class="block w-full bg-transparent border-0 py-3 px-3 text-gray-200 placeholder:text-gray-600 focus:ring-0 sm:text-base sm:leading-6 outline-none"
    @input="onInput"
    @blur="onBlur"
  >
</template>
