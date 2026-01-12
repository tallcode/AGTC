import { html, LitElement } from 'lit'
import { customElement, query, state } from 'lit/decorators.js'
import './index.less'

@customElement('app-dialog')
export class AppDialog extends LitElement {
  @state()
  private _title: string = ''

  @state()
  private _message: string = ''

  @query('dialog')
  private _dialog!: HTMLDialogElement

  private _resolve: ((value: string) => void) | null = null

  // Disable Shadow DOM to allow global styles (or external CSS) to apply easily
  protected createRenderRoot() {
    return this
  }

  public async show(title: string, message: string): Promise<string> {
    this._title = title
    this._message = message
    await this.updateComplete

    this._dialog.showModal()

    return new Promise((resolve) => {
      this._resolve = resolve
    })
  }

  private _onClose() {
    const returnValue = this._dialog.returnValue
    if (this._resolve) {
      this._resolve(returnValue)
      this._resolve = null
    }
  }

  protected render() {
    return html`
      <dialog @close=${this._onClose}>
        <form method="dialog">
          <header>${this._title}</header>
          <article><pre>${this._message}</pre></article>
          <footer>
            <button value="ok">OK</button>
          </footer>
        </form>
      </dialog>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'app-dialog': AppDialog
  }
}
