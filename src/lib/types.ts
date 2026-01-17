export interface InputParams {
  /** Sky noise temperature in Kelvin */
  skyTemp: number
  /** Earth noise temperature in Kelvin */
  earthTemp: number
  /** Transmission line loss in dB */
  translineLoss: number
  /** Receiver Noise Figure in dB */
  receiverNF: number
  /** The antenna pattern file (Far Field Table) */
  file: File
}

export interface FFTable {
  /**
   * 2D array storing Far Field data (Gain in dB).
   * Dimensions: 181 rows (theta 0..180), each 361 cols (phi 0..360).
   * Initialized with -100.0 dB for missing data.
   */
  table: Float64Array[]
  /** Detected slice direction from the source file */
  sliceMode: 'phi' | 'theta' | 'unknown'
}

export interface ResultRow {
  /** Antenna tilt angle in degrees (0 = Horizon) */
  alpha: number
  /** Antenna noise temperature derived from pattern integration (Kelvin) */
  T_pattern: number
  /** Noise temperature due to internal ohmic loss (Kelvin) */
  T_loss: number
  /** Total antenna noise temperature (Kelvin) */
  T_total: number
  /** System G/T value in dB/K */
  G_Ta_dB: number
  /** Formatted string of G/T for display */
  G_Ta_Str: string
}

export interface SystemAt30Metrics {
  /** System G/T at 30 degrees tilt (dB/K) */
  GTsys: number
  /** Receiver noise temperature (Kelvin) */
  receiverTemp: number
  /** Transmission line noise temperature (Kelvin) */
  transLineTemp: number
  /** Total system noise temperature (Kelvin) */
  systemTemp: number
}

export interface Result {
  /** Average gain (linear scale) over 4pi steradians */
  avgGainNum: number
  /** Average gain in dB */
  avgGaindB: number
  /** Ohmic loss factor (linear, >= 1). Calculated as 1 / avgGainNum */
  La: number
  /** Equivalent noise temperature due to ohmic loss (Kelvin) */
  lossTemp: number
  /** Maximum gain value found in the pattern (dBi) */
  maxGainVal: number // dBi
  /** Phi angle of maximum gain (degrees) */
  maxPhi: number
  /** Theta angle of maximum gain (degrees) */
  maxTheta: number
  /** Sky temperature used in calculation (Kelvin) */
  skyTemp: number
  /** Earth temperature used in calculation (Kelvin) */
  earthTemp: number
  /** Array of calculation results for various tilt angles */
  rows: ResultRow[]

  /** System parameters captured specifically at 30 degrees tilt */
  systemAt30: SystemAt30Metrics
}
