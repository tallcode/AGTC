import type { CalculationResultRow } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('data-table')
export class DataTable extends LitElement {
  @property({ attribute: false })
  data?: CalculationResultRow[]

  // Disable Shadow DOM to inherit global styles (style.css)
  protected createRenderRoot() {
    return this
  }

  private formatNum(n: number) {
    return (n >= 0 ? '+ ' : '- ') + Math.abs(n).toFixed(3)
  }

  protected render() {
    if (!this.data)
      return html``

    return html`
      <table>
        <thead>
          <tr>
            <th>Alpha (deg.)</th>
            <th>T<sub>pattern</sub> (K)</th>
            <th>T<sub>loss</sub> (K)</th>
            <th>T<sub>total</sub> (K)</th>
            <th>G/Ta (dB)</th>
          </tr>
        </thead>
        <tbody>
          ${this.data.map(row => html`
            <tr class="${row.isHighlight ? 'highlight' : ''}">
              <td>${row.alpha}</td>
              <td>${row.T_pattern.toFixed(3)}</td>
              <td>${this.formatNum(row.T_loss)}</td>
              <td>${this.formatNum(row.T_total)}</td>
              <td>${row.G_Ta_Str}</td>
            </tr>
          `)}
        </tbody>
      </table>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'data-table': DataTable
  }
}
