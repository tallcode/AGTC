export interface InputParams {
  skyTemp: number
  earthTemp: number
  translineLoss: number
  receiverNF: number
  file: File
}

export interface FFTable {
  /** 181 rows (theta 0..180), each 361 cols (phi 0..360) */
  table: Float64Array[]
  sliceMode: 'phi' | 'theta' | 'unknown'
}

export interface ResultRow {
  alpha: number
  T_pattern: number
  T_loss: number
  T_total: number
  G_Ta_dB: number
  G_Ta_Str: string
}

export interface SystemAt30Metrics {
  GTsys: number
  receiverTemp: number
  transLineTemp: number
  systemTemp: number
}

export interface Result {
  avgGainNum: number
  avgGaindB: number
  La: number
  lossTemp: number
  maxGainVal: number // dBi
  maxPhi: number
  maxTheta: number
  skyTemp: number
  earthTemp: number
  rows: ResultRow[]

  // System parameters at alpha=30
  systemAt30: SystemAt30Metrics
}
