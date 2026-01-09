import type { CalculationResult } from '../types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './results-table'

@customElement('calculation-results')
export class CalculationResults extends LitElement {
  @property({ attribute: false })
  data?: CalculationResult

  // Disable Shadow DOM to inherit global styles
  protected createRenderRoot() {
    return this
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
      hasGainWarning,
    } = this.data

    return html`
    <div class="res-header">
      <div>
        Average Gain (AG) = <span class="val-avg"><b>${avgGainNum.toFixed(4)} (/)</b></span>
        = <span class="val-avg"><b>${avgGaindB.toFixed(2)}</b> dBi</span>, 
        Loss Factor L_a = <span class="val-loss"><b>${La.toFixed(4)}</b> (/)</span>
      </div>
      <div>
        Max Gain = <span class="val-avg"><b>${maxGainVal.toFixed(2)}</b> dBi</span> 
        at azimuth = <b>${maxPhi}</b> degree${maxPhi === 1 ? '' : 's'} and elevation = <b>${90 - maxTheta}</b> degree${90 - maxTheta === 1 ? '' : 's'}
      </div>
      
      <div style="display:flex; gap:20px;">
        <span class="val-sky">T<sub>sky</sub> = <b>${T_sky.toFixed(2)}</b> K</span>
        <span class="val-earth">T<sub>earth</sub> = <b>${T_earth.toFixed(2)}</b> K</span>
      </div>
    </div>

    <results-table .data=${this.data}></results-table>

    ${hasGainWarning
      ? html`<div class="res-gta-neg" style="margin-top:10px">Computed AG >= 1.001, G/Ta corrections may be needed</div>`
      : ''}
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'calculation-results': CalculationResults
  }
}
