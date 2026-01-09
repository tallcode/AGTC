export function showDialog(title: string, message: string): Promise<void> {
  const dialog = document.getElementById('appDialog') as HTMLDialogElement
  const titleEl = document.getElementById('dialogTitle')
  const msgEl = document.getElementById('dialogMessage')

  if (titleEl)
    titleEl.textContent = title
  if (msgEl)
    msgEl.textContent = message

  dialog.showModal()

  return new Promise((resolve) => {
    dialog.addEventListener('close', () => {
      resolve()
    }, { once: true })
  })
}
