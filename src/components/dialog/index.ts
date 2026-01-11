import type { AppDialog } from './html'
import './html'

let dialogInstance: AppDialog | null = null

function getDialogInstance(): AppDialog {
  if (!dialogInstance) {
    dialogInstance = document.querySelector('app-dialog')
    if (!dialogInstance) {
      dialogInstance = document.createElement('app-dialog')
      document.body.appendChild(dialogInstance)
    }
  }
  return dialogInstance
}

export async function showDialog(title: string, message: string): Promise<void> {
  const dialog = getDialogInstance()
  await dialog.show(title, message)
}
