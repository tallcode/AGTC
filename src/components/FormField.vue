<script setup lang="ts">
import { computed } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

const props = defineProps<{
  label: string
  memo?: string
  type: 'text' | 'number' | 'file' | 'select'
  value?: any
  accept?: string
  min?: number
  max?: number
  step?: number
  required?: boolean
  options?: SelectOption[]
  error?: string | null
}>()

const emit = defineEmits<{
  (e: 'update', value: any): void
}>()

const availableOptions = computed(() => props.options ?? [])

const componentTag = computed(() => {
  if (props.type === 'select')
    return 'select'

  if (props.type === 'file')
    return 'input'

  return 'input'
})

const baseInputClass = 'block w-full rounded bg-neutral-800 border-0 py-2 px-3 text-gray-200 shadow-sm ring-1 ring-inset ring-gray-600 placeholder:text-gray-500 focus:ring-1 focus:ring-inset focus:ring-sky-600 sm:text-base sm:leading-6 outline-none'

const inputProps = computed(() => {
  if (props.type === 'select') {
    return {
      value: props.value,
      class: `${baseInputClass} pr-10 appearance-none bg-no-repeat`,
      style: {
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%239ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.75rem center',
        backgroundSize: '1.5em 1.5em',
      },
    }
  }

  if (props.type === 'file') {
    return {
      type: 'file',
      accept: props.accept,
      class: 'block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600 rounded bg-neutral-800 ring-1 ring-inset ring-gray-600 py-1.5 px-2 focus:ring-1 focus:ring-inset focus:ring-sky-600 outline-none',
    }
  }

  return {
    type: props.type,
    value: props.value,
    min: props.min,
    max: props.max,
    step: props.step ?? 1,
    required: props.required,
    class: baseInputClass,
  }
})

function emitChange(event: Event) {
  const target = event.target as HTMLInputElement | HTMLSelectElement

  if (props.type === 'file') {
    const file = (target as HTMLInputElement).files?.[0] || null
    emit('update', file)
    return
  }

  if (props.type === 'number') {
    emit('update', Number((target as HTMLInputElement).value))
    return
  }

  emit('update', (target as HTMLInputElement).value)
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-[240px_1fr] gap-2 items-center">
    <label class="block text-base text-gray-300">
      {{ label }}<span v-if="memo">:</span>
      <span v-if="memo" class="text-gray-300"> ({{ memo }})</span>
      <span v-if="!memo">:</span>
    </label>
    <div class="w-full">
      <component
        :is="componentTag"
        v-bind="inputProps"
        @change="emitChange"
        @input="emitChange"
      >
        <option v-for="opt in availableOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </component>
      <p v-if="error" class="mt-1 text-sm text-red-500">
        {{ error }}
      </p>
    </div>
  </div>
</template>
