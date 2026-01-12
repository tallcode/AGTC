import type { Result } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './result'
import './index.less'

@customElement('agtc-output')
export class Output extends LitElement {
  @property({ attribute: false })
  data?: Result

  // Disable Shadow DOM to inherit global styles
  protected createRenderRoot() {
    return this
  }

  protected updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('data')) {
      this.style.display = this.data ? 'block' : 'none'
    }
  }

  private async loadHtml2Canvas(): Promise<any> {
    const module = await import('html2canvas')
    return module.default
  }

  private async saveResult() {
    const element = this.querySelector('agtc-result') as HTMLElement
    if (!element) return

    try {
      const html2canvas = await this.loadHtml2Canvas()
      const canvas = await html2canvas(element, {
        backgroundColor: '#000',
        scale: 2
      })
      const link = document.createElement('a')
      link.download = 'agtc-result.png'
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (e) {
      console.error(e)
    }
  }

  protected render() {
    if (!this.data)
      return html``


    return html`
      <agtc-result .data=${this.data}></agtc-result>
      <div><button id="save" @click=${this.saveResult}>Save Result</button></div>
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agtc-output': Output
  }
}
