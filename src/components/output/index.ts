import type { CalculationResult } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './table'
import './index.css'

@customElement('agtc-output')
export class Output extends LitElement {
  @property({ attribute: false })
  data?: CalculationResult

  // Disable Shadow DOM to inherit global styles
  protected createRenderRoot() {
    return this
  }

  protected updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('data')) {
      this.style.display = this.data ? 'block' : 'none'
    }
  }

  protected render() {
    if (!this.data)
      return html``

    const {
      avgGainNum,
      avgGaindB,
      La,
      maxGainVal,
      maxPhi,
      maxTheta,
      T_sky,
      T_earth,
      GTsys,
      T_rec,
      T_TL,
    } = this.data

    return html`
    <header>
      <div>
        Average Gain (AG) = <b>${avgGainNum.toFixed(4)} (/)</b>
        = <b>${avgGaindB.toFixed(2)}</b> dBi, 
        Loss Factor L_a = <b>${La.toFixed(4)}</b> (/)
      </div>
      <div>
        Max Gain = <b>${maxGainVal.toFixed(2)}</b> dBi
        at azimuth = <b>${maxPhi}</b> degree${maxPhi === 1 ? '' : 's'} 
        and elevation = <b>${90 - maxTheta}</b> degree${90 - maxTheta === 1 ? '' : 's'}
      </div>
      
      <div style="display:flex; gap:20px; color:#55F;">
        <span>T<sub>sky</sub> = <b>${T_sky.toFixed(2)}</b> K</span>
        <span>T<sub>earth</sub> = <b>${T_earth.toFixed(2)}</b> K</span>
      </div>
    </header>

    <data-table .data=${this.data.rows}></data-table>

    <footer>
      <div>G/Tsys = ${GTsys.toFixed(2)} dB/K (alpha = 30 deg. T<sub>rec</sub> = ${T_rec.toFixed(2)} K, T<sub>TL</sub> = ${T_TL.toFixed(2)} K)</div>
      ${avgGainNum >= 1.001
      ? html`<div class="warning">Computed AG >= 1.001, G/Ta corrections may be needed</div>`
      : ''}
    </footer>
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agtc-output': Output
  }
}
