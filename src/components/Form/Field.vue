<script setup lang="ts">
import type { FieldRule } from './types'
import { computed, provide, ref, watch } from 'vue'
import { FieldContextKey } from './types'

const props = defineProps<{
  label: string
  memo?: string
  required?: boolean
  rules?: FieldRule[]
  error?: string | null
  min?: number
  max?: number
}>()

const internalError = ref<string | null>(null)
const isError = computed(() => !!internalError.value)

function validate(value: any) {
  internalError.value = null

  if (props.required) {
    const isEmpty = value === null || value === undefined || value === ''
    if (isEmpty) {
      internalError.value = `${props.label} is Required`
      return
    }
  }

  if (value !== null && value !== undefined && value !== '') {
    const numVal = Number(value)
    if (!Number.isNaN(numVal)) {
      if (props.min !== undefined && numVal < props.min) {
        internalError.value = `${props.label} must be >= ${props.min}`
        return
      }
      if (props.max !== undefined && numVal > props.max) {
        internalError.value = `${props.label} must be <= ${props.max.toLocaleString()}`
        return
      }
    }
  }

  if (props.rules && props.rules.length > 0) {
    for (const rule of props.rules) {
      const result = rule.validator(value)
      // If validation fails
      if (result === false) {
        internalError.value = rule.message || 'Validation failed'
        return
      }
      if (typeof result === 'string') {
        internalError.value = result
        return
      }
    }
  }
}

function setError(err: string | null) {
  internalError.value = err
}

watch(() => props.error, (val) => {
  if (val)
    internalError.value = val
})

provide(FieldContextKey, {
  validate,
  setError,
  isError,
})

defineExpose({
  validate,
  setError,
})
</script>

<template>
  <div class="relative pb-6">
    <div class="relative group">
      <fieldset
        class="absolute inset-0 border rounded pointer-events-none transition-colors border-gray-600 group-focus-within:border-sky-600 group-focus-within:border-2 -mt-2"
        :class="{ 'border-red-700!': internalError }"
      >
        <legend class="ml-2 px-1 text-sm text-gray-300">
          {{ label }}
          <span v-if="required" class="ml-0.5" :class="internalError ? 'text-red-700' : 'text-red-400'">*</span>
        </legend>
      </fieldset>

      <div class="relative z-10">
        <slot />
      </div>

      <span
        v-if="memo"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      >
        {{ memo }}
      </span>
    </div>

    <div class="absolute bottom-0 left-0 w-full h-5 px-1 flex items-center">
      <p v-if="internalError" class="text-sm text-red-700 truncate" :title="internalError">
        {{ internalError }}
      </p>
    </div>
  </div>
</template>
