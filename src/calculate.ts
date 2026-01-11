import type { FFTable, InputParams, Result, ResultRow, SystemAt30Metrics } from './types'

const PI = Math.PI

export function calculateMetrics(data: FFTable, params: InputParams): Result {
  const { table } = data
  const { skyTemp, earthTemp, translineLoss, receiverNF: ReceiverNF } = params

  // 1. Precompute linear elements
  // arrays for integration
  const element: Float64Array[] = Array.from({ length: 361 })
  let maxGainVal = -1000
  let maxPhi = 0
  let maxTheta = 0

  for (let p = 0; p <= 360; p++) {
    element[p] = new Float64Array(181)
    for (let t = 0; t <= 180; t++) {
      const db = table[t][p]
      if (db > maxGainVal) {
        maxGainVal = db
        maxPhi = p
        maxTheta = t
      }
      // BASIC Formula: 10^(Tot_dB/10) * SIN(theta) * (PI/180)^2
      const linear = 10 ** (db / 10.0)
      const sinTheta = Math.sin(t * PI / 180.0)
      element[p][t] = linear * sinTheta * (PI / 180.0) ** 2
    }
  }

  // Helper for integration
  function trapezoidal_sums(b_phi: number, e_phi: number, b_theta: number, e_theta: number) {
    const sum_phi = new Float64Array(361)

    for (let p = b_phi; p <= e_phi; p++) {
      let s = 0
      // Inner loop: theta from b_theta+1 to e_theta-1
      for (let t = b_theta + 1; t <= e_theta - 1; t++) {
        s += element[p][t]
      }
      // Add endpoints / 2
      s += element[p][b_theta] / 2.0
      s += element[p][e_theta] / 2.0
      sum_phi[p] = s
    }

    let sum_sum = 0
    // Outer loop: phi from b_phi+1 to e_phi-1
    for (let p = b_phi + 1; p <= e_phi - 1; p++) {
      sum_sum += sum_phi[p]
    }
    // Add endpoints / 2
    sum_sum += sum_phi[b_phi] / 2.0
    sum_sum += sum_phi[e_phi] / 2.0

    return sum_sum
  }

  function calculate_regions(alpha: number) {
    // Sky1: 0-90 phi, 0 to 90+alpha theta
    const sky1 = trapezoidal_sums(0, 90, 0, 90 + alpha)
    // Sky2: 270-360 phi, 0 to 90+alpha theta
    const sky2 = trapezoidal_sums(270, 360, 0, 90 + alpha)
    // Sky3: 90-270 phi, 0 to 90-alpha theta
    const sky3 = trapezoidal_sums(90, 270, 0, 90 - alpha)

    const sum_Sky = sky1 + sky2 + sky3

    // Earth1: 0-90 phi, 90+alpha to 180 theta
    const earth1 = trapezoidal_sums(0, 90, 90 + alpha, 180)
    // Earth2: 270-360 phi, 90+alpha to 180 theta
    const earth2 = trapezoidal_sums(270, 360, 90 + alpha, 180)
    // Earth3: 90-270 phi, 90-alpha to 180 theta
    const earth3 = trapezoidal_sums(90, 270, 90 - alpha, 180)

    const sum_Earth = earth1 + earth2 + earth3

    return { sum_Sky, sum_Earth }
  }

  // 2. Calculate Avg Gain (Alpha = 0)
  const res0 = calculate_regions(0)
  const sum_Total_0 = res0.sum_Sky + res0.sum_Earth
  const avg_gain_num = sum_Total_0 / (4 * PI)
  const La = 1 / avg_gain_num
  const avg_gain_dB = 10 * Math.log10(avg_gain_num)
  const loss_temperature = 290 * ((1.0 / avg_gain_num) - 1.0)

  // 3. Loop Alpha and build rows
  const rows: ResultRow[] = []

  // System parameters captured when alpha = 30 deg
  let systemAt30: SystemAt30Metrics = {
    GTsys: 0,
    receiverTemp: 0,
    transLineTemp: 0,
    systemTemp: 0,
  }

  const formatNum = (n: number) => (n >= 0 ? '+ ' : '- ') + Math.abs(n).toFixed(3)

  for (let alpha = 0; alpha <= 90; alpha += 5) {
    const res = calculate_regions(alpha)
    const sumS = res.sum_Sky
    const sumE = res.sum_Earth

    const T_pattern = (skyTemp * sumS + earthTemp * sumE) / (sumS + sumE)
    // Note: Original code uses global `avg_gain_num` here which is calculated at alpha=0
    const T_total = (T_pattern - 290) * avg_gain_num + 290

    let G_Ta_dB = 0
    let G_Ta_Str: string

    if (T_total <= 0) {
      G_Ta_Str = '-99.999 *'
    }
    else {
      G_Ta_dB = maxGainVal - 10 * Math.log10(T_total)
      G_Ta_Str = formatNum(G_Ta_dB)
    }

    const T_loss = loss_temperature * avg_gain_num

    rows.push({
      alpha,
      T_pattern,
      T_loss,
      T_total,
      G_Ta_dB,
      G_Ta_Str,
    })

    // System calculation at 30 deg
    if (alpha === 30) {
      const translineLossFactor = translineLoss / 10
      const L_TL_val = 10 ** translineLossFactor
      const transLineTemp = (L_TL_val - 1) * 290

      const ReceiverNFFactor = ReceiverNF / 10
      const receiverTemp = 290 * (10 ** ReceiverNFFactor - 1)

      const systemTemp = T_pattern + (La - 1) * 290 + La * (L_TL_val - 1) * 290 + La * L_TL_val * receiverTemp

      const maxGainValLinear = maxGainVal / 10
      const D_num = La * (10 ** maxGainValLinear)
      const D_dB = 10 * Math.log10(D_num)
      const GTsys = D_dB - 10 * Math.log10(systemTemp)

      systemAt30 = {
        GTsys,
        receiverTemp,
        transLineTemp,
        systemTemp,
      }
    }
  }

  return {
    avgGainNum: avg_gain_num,
    avgGaindB: avg_gain_dB,
    La,
    lossTemp: loss_temperature,
    maxGainVal,
    maxPhi,
    maxTheta,
    skyTemp,
    earthTemp,
    rows,
    systemAt30,
  }
}
