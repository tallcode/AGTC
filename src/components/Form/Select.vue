<script setup lang="ts">
import type { SelectOption } from './types'
import { inject } from 'vue'
import { FieldContextKey } from './types'

const props = defineProps<{
  modelValue?: any
  options: SelectOption[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const field = inject(FieldContextKey, null)

function onChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value
  emit('update:modelValue', val)
  if (field) {
    field.validate(val)
  }
}

function onBlur() {
  if (field) {
    field.validate(props.modelValue)
  }
}

const baseInputClass = 'block w-full rounded bg-transparent border-0 py-3 px-3 text-gray-200 focus:ring-0 sm:text-base sm:leading-6 outline-none'
</script>

<template>
  <select
    v-bind="$attrs"
    :value="modelValue"
    :class="[
      baseInputClass,
      'pr-10 appearance-none bg-no-repeat',
    ]"
    style="background-image: url(&quot;data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e&quot;); background-position: right 0.75rem center; background-size: 1.5em 1.5em;"
    @change="onChange"
    @blur="onBlur"
  >
    <option v-for="opt in options" :key="opt.value" :value="opt.value" class="bg-neutral-800">
      {{ opt.label }}
    </option>
  </select>
</template>
