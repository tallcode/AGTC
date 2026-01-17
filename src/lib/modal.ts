import { createApp, reactive } from 'vue'
import DialogModal from '@/components/Dialog/index.vue'

interface ModalState {
  isOpen: boolean
  title: string
  message: string
  type: 'alert' | 'confirm'
  resolve: ((value: boolean) => void) | null
  isMounted: boolean
}

const state = reactive<ModalState>({
  isOpen: false,
  title: '',
  message: '',
  type: 'alert',
  resolve: null,
  isMounted: false,
})

function ensureMounted() {
  if (state.isMounted)
    return

  const div = document.createElement('div')
  document.body.appendChild(div)
  const app = createApp(DialogModal)
  app.mount(div)
}

export function useDialog() {
  function show(type: 'alert' | 'confirm', message: string, title?: string) {
    ensureMounted()
    return new Promise<boolean>((resolve) => {
      state.type = type
      state.message = message
      state.title = title || (type === 'alert' ? 'Error' : 'Confirm')
      state.isOpen = true
      state.resolve = resolve
    })
  }

  const alert = (message: string, title?: string) => show('alert', message, title)
  const confirm = (message: string, title?: string) => show('confirm', message, title)

  function close(value: boolean) {
    state.isOpen = false
    if (state.resolve) {
      state.resolve(value)
      state.resolve = null
    }
  }

  return { state, alert, confirm, close }
}

export const alert = (message: string, title?: string) => useDialog().alert(message, title)
export const confirm = (message: string, title?: string) => useDialog().confirm(message, title)
