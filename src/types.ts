export interface InputParams {
  skyTemp: number
  earthTemp: number
  translineLoss: number
  receiverNF: number
}

export interface ParsedData {
  /** 181 rows (theta 0..180), each 361 cols (phi 0..360) */
  tot_dB: Float64Array[]
  metadata: {
    sliceMode: 'phi_fixed' | 'theta_fixed' | 'unknown'
    stepSize: number
    isFull360: boolean
    firstVariable: string
    thetaCount: number // How many theta steps covering 0-180
  }
}

export interface CalculationResultRow {
  alpha: number
  T_pattern: number
  T_loss: number
  T_total: number
  G_Ta_dB: number
  G_Ta_Str: string
  isHighlight: boolean
}

export interface CalculationResult {
  avgGainNum: number
  avgGaindB: number
  La: number
  lossTemp: number
  maxGainVal: number // dBi
  maxPhi: number
  maxTheta: number
  T_sky: number
  T_earth: number
  rows: CalculationResultRow[]

  // System parameters at alpha=30
  GTsys: number
  T_rec: number
  T_TL: number
  Tsys: number

  // Warning flags
  hasGainWarning: boolean
}
