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

  private async exportPNG() {
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

  private exportCSV() {
    if (!this.data || !this.data.rows) return

    const header = ['Alpha (deg)', 'T_pattern (K)', 'T_loss (K)', 'T_total (K)', 'G/T (dB/K)']
    const rows = this.data.rows.map((row) => [
      row.alpha.toFixed(1),
      row.T_pattern.toFixed(2),
      row.T_loss.toFixed(2),
      row.T_total.toFixed(2),
      row.G_Ta_dB.toFixed(2)
    ])

    const csvContent = [header.join(','), ...rows.map((r) => r.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'agtc_data.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  protected render() {
    if (!this.data)
      return html``


    return html`
      <agtc-result .data=${this.data}></agtc-result>
      <div class="actions">
        <button id="export-png" @click=${this.exportPNG}>Export PNG</button>
        <button id="export-csv" @click=${this.exportCSV}>Export CSV</button>
      </div>
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agtc-output': Output
  }
}
