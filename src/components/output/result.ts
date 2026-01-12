import type { Result } from '@/types'
import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './table'

@customElement('agtc-result')
export class Main extends LitElement {
  @property({ attribute: false })
  data?: Result

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
      skyTemp,
      earthTemp,
      systemAt30,
    } = this.data

    const { GTsys, receiverTemp, transLineTemp } = systemAt30

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
      <div class="temps">
        <span>T<sub>sky</sub> = <b>${skyTemp.toFixed(2)}</b> K</span>
        <span>T<sub>earth</sub> = <b>${earthTemp.toFixed(2)}</b> K</span>
      </div>
    </header>
    <main>
      <data-table .data=${this.data.rows}></data-table>
    </main>

    <footer>
      <div>G/Tsys = ${GTsys.toFixed(2)} dB/K (alpha = 30 deg. T<sub>rec</sub> = ${receiverTemp.toFixed(2)} K, T<sub>TL</sub> = ${transLineTemp.toFixed(2)} K)</div>
      ${avgGainNum >= 1.001
      ? html`<div class="warning">Computed AG >= 1.001, G/Ta corrections may be needed</div>`
      : ''}
    </footer>
  `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'agtc-result': Main
  }
}
