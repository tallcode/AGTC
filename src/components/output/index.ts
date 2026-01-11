import type { Result } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import './result'
import './index.css'

const HTML2CANVAS_CDN = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'

@customElement('agtc-output')
export class Output extends LitElement {
  @property({ attribute: false })
  data?: Result

  @state()
  private cdnAvailable = false

  // Disable Shadow DOM to inherit global styles
  protected createRenderRoot() {
    return this
  }

  private async checkCdn() {
    if (this.cdnAvailable) return

    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), 3000)
      const res = await fetch(HTML2CANVAS_CDN, { method: 'HEAD', signal: controller.signal })
      clearTimeout(id)
      if (res.ok) {
        this.cdnAvailable = true
      }
    } catch (e) {
      console.warn('CDN check failed:', e)
      this.cdnAvailable = false
    }
  }

  protected updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('data')) {
      this.style.display = this.data ? 'block' : 'none'
      if (this.data && !this.cdnAvailable) {
        this.checkCdn()
      }
    }
  }

  private async loadHtml2Canvas(): Promise<any> {
    if ((window as any).html2canvas) return (window as any).html2canvas

    return new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = HTML2CANVAS_CDN
      script.onload = () => resolve((window as any).html2canvas)
      script.onerror = reject
      document.head.appendChild(script)
    })
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
      ${this.cdnAvailable
        ? html`<div><button id="save" @click=${this.saveResult}>Save Result</button></div>`
        : html``}
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agtc-output': Output
  }
}
