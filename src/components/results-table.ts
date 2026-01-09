import type { CalculationResult } from '../types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

@customElement('results-table')
export class ResultsTable extends LitElement {
  @property({ attribute: false })
  data?: CalculationResult

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

    const { rows, GTsys, T_rec, T_TL } = this.data

    return html`
      <table class="res-table">
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
          ${rows.map(row => html`
            <tr class="${row.isHighlight ? 'row-highlight' : ''}">
              <td>${row.alpha}</td>
              <td>${row.T_pattern.toFixed(3)}</td>
              <td>${this.formatNum(row.T_loss)}</td>
              <td>${this.formatNum(row.T_total)}</td>
              <td>${row.G_Ta_Str}</td>
            </tr>
          `)}
        </tbody>
      </table>

      <table class="res-table">
        <thead>
          <tr>
            <th> </th>
          </tr>
          <tr>
            <th>
              G/Tsys = ${GTsys.toFixed(2)} dB/K (alpha = 30 deg. T<sub>rec</sub> = ${T_rec.toFixed(2)} K, T<sub>TL</sub> = ${T_TL.toFixed(2)} K)
            </th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'results-table': ResultsTable
  }
}
