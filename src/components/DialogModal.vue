<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useDialog } from '../lib/modal'

const dialog = ref<HTMLDialogElement>()
const { state, close } = useDialog()

onMounted(() => {
  state.isMounted = true
})

onUnmounted(() => {
  state.isMounted = false
})

watch(() => state.isOpen, (val) => {
  if (val) {
    dialog.value?.showModal()
  }
  else {
    dialog.value?.close()
  }
})

function onCancel() {
  close(false)
}

function onConfirm() {
  close(true)
}
</script>

<template>
  <dialog
    ref="dialog"
    class="bg-transparent p-0 backdrop:bg-black/80 m-auto"
    @cancel.prevent="onCancel"
  >
    <div class="bg-neutral-800 text-slate-200 border border-neutral-700 rounded-lg shadow-2xl w-100 max-w-full p-6 flex flex-col gap-6" @click.stop>
      <h3 class="text-xl font-medium text-white">
        {{ state.title }}
      </h3>

      <p class="text-slate-300 text-base leading-relaxed">
        {{ state.message }}
      </p>

      <div class="flex justify-end gap-3">
        <button
          v-if="state.type === 'confirm'"
          class="px-4 py-2 rounded text-sm font-medium hover:bg-white/10 transition-colors text-slate-300"
          @click="onCancel"
        >
          Cancel
        </button>
        <button
          class="bg-sky-600 hover:bg-sky-500 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
          @click="onConfirm"
        >
          OK
        </button>
      </div>
    </div>
  </dialog>
</template>
