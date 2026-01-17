import type { FFTable, InputParams, Result, ResultRow, SystemAt30Metrics } from './types'

const PI = Math.PI

export function calculateMetrics(data: FFTable, params: InputParams): Result {
  const { table } = data
  const { skyTemp, earthTemp, translineLoss, receiverNF } = params

  // 1. Precompute linear elements
  // arrays for integration
  const element: Float64Array[] = Array.from({ length: 361 }, () => new Float64Array(181))
  let maxGainVal = -1000
  let maxPhi = 0
  let maxTheta = 0

  for (let p = 0; p <= 360; p++) {
    for (let t = 0; t <= 180; t++) {
      const db = table[t]![p]!
      if (db > maxGainVal) {
        maxGainVal = db
        maxPhi = p
        maxTheta = t
      }
      // Calculate linear power gain multiplied by the integration element (sin(theta) * d_theta * d_phi)
      // Original Formula: 10^(db/10) * sin(theta) * (PI/180)^2
      const linear = 10 ** (db / 10.0)
      const sinTheta = Math.sin(t * PI / 180.0)
      element[p]![t] = linear * sinTheta * (PI / 180.0) ** 2
    }
  }

  // Helper for numerical integration using the Trapezoidal Rule over a 2D grid (phi, theta)
  function trapezoidal_sums(b_phi: number, e_phi: number, b_theta: number, e_theta: number) {
    const sum_phi = new Float64Array(361)

    for (let p = b_phi; p <= e_phi; p++) {
      let s = 0
      // Inner loop: theta from b_theta+1 to e_theta-1
      for (let t = b_theta + 1; t <= e_theta - 1; t++) {
        s += element[p]![t]!
      }
      // Add endpoints / 2
      s += element[p]![b_theta]! / 2.0
      s += element[p]![e_theta]! / 2.0
      sum_phi[p] = s
    }

    let sum_sum = 0
    // Outer loop: phi from b_phi+1 to e_phi-1
    for (let p = b_phi + 1; p <= e_phi - 1; p++) {
      sum_sum += sum_phi[p]!
    }
    // Add endpoints / 2
    sum_sum += sum_phi[b_phi]! / 2.0
    sum_sum += sum_phi[e_phi]! / 2.0

    return sum_sum
  }

  // Calculate the integrated sums for Sky and Earth regions based on the tilt angle alpha.
  // The integration limits are adjusted as the antenna tilts relative to the horizon.
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

  // 2. Calculate Average Gain and Antenna Loss Factor (La)
  // This is calculated at alpha = 0 (horizon) to establish the baseline efficiency.
  const res0 = calculate_regions(0)
  const sum_Total_0 = res0.sum_Sky + res0.sum_Earth
  const avg_gain_num = sum_Total_0 / (4 * PI) // Average gain over 4pi steradians
  const La = 1 / avg_gain_num // Antenna internal loss factor (Ohmic loss)
  const avg_gain_dB = 10 * Math.log10(avg_gain_num)
  const loss_temperature = 290 * ((1.0 / avg_gain_num) - 1.0)

  // 3. Loop through tilt angles (Alpha) from 0 to 90 degrees and calculate system metrics for each step.
  const rows: ResultRow[] = []

  // System parameters captured specifically when alpha = 30 deg for reference
  let systemAt30: SystemAt30Metrics = {
    GTsys: 0,
    receiverTemp: 0,
    transLineTemp: 0,
    systemTemp: 0,
  }

  for (let alpha = 0; alpha <= 90; alpha += 5) {
    const { sum_Sky, sum_Earth } = calculate_regions(alpha)
    const T_pattern = (sum_Sky * skyTemp + sum_Earth * earthTemp) / (sum_Sky + sum_Earth)
    const T_loss = loss_temperature
    const T_total = T_pattern + T_loss

    // Calculate System Temperature
    const Tr = 290 * (10 ** (receiverNF / 10.0) - 1.0)
    const T_tl = 290 * (10 ** (translineLoss / 10.0) - 1.0)

    // Formula: G/T = G_max - 10*log10(T_ant + T_sys_components)
    // But here we might be calculating T_sys first.
    // T_sys (referred to antenna terminal) = T_ant + T_loss_line + T_rx_ref_to_ant
    // Note: The original basic code uses a specific aggregation.
    // T_total (Antenna) = T_pattern + T_ohmic_loss
    // Recalculating system G/T based on the provided params.

    // Using simplified T_sys for G/Ta display in table?
    // The table shows G/Ta (dB).
    // G/Ta = G_max_dB - 10*log10(T_total)
    // Wait, T_total here is just Antenna Noise Temperature (Pattern + Ohmic).
    // So G/Ta is Antenna Gain / Antenna Noise Temp.
    const G_Ta_dB = maxGainVal - 10 * Math.log10(T_total)
    const sign = G_Ta_dB >= 0 ? '+' : '-'
    const G_Ta_Str = `${sign} ${Math.abs(G_Ta_dB).toFixed(3)}`

    rows.push({
      alpha,
      T_pattern,
      T_loss,
      T_total,
      G_Ta_dB,
      G_Ta_Str,
    })

    if (alpha === 30) {
      // Calculate System G/T at 30 deg including Receiver and Line
      // T_sys = T_total + T_tl + Tr * L_line
      // L_line (linear) = 10^(loss/10)
      const L_line = 10 ** (translineLoss / 10.0)
      const SysTemp = T_total + T_tl + Tr * L_line
      const GTsys = maxGainVal - 10 * Math.log10(SysTemp)

      systemAt30 = {
        GTsys,
        receiverTemp: Tr,
        transLineTemp: T_tl,
        systemTemp: SysTemp,
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
