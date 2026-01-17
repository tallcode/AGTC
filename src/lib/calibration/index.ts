import type { FFTable } from '../types'
import { DEG2RAD, getInterpolatedValue, RAD2DEG } from './utils'

/**
 * Applies zero calibration (shifts max gain to Theta=90, Phi=0)
 */
export function applyCalibration(data: FFTable, zeroAz: boolean, zeroEl: boolean): FFTable {
  if (!zeroAz && !zeroEl)
    return data

  const oldTable = data.table

  // 1. Find Max Gain
  let maxVal = -Infinity
  let maxTheta = 0
  let maxPhi = 0

  for (let t = 0; t <= 180; t++) {
    for (let p = 0; p <= 360; p++) {
      const val = oldTable[t]![p]!
      if (val > maxVal) {
        maxVal = val
        maxTheta = t
        maxPhi = p
      }
    }
  }

  // 2. Calculate Offsets
  const offsetPhi = zeroAz ? -maxPhi : 0
  // Target Theta is 90 (Horizon/Elevation 0). Shift = Theta - 90.
  // Because inverse Rotation uses -shift.
  const betaRad = zeroEl ? (maxTheta - 90) * DEG2RAD : 0

  const cosBeta = Math.cos(betaRad)
  const sinBeta = Math.sin(betaRad)

  // 3. Create New Table
  const newTable: Float64Array[] = Array.from({ length: 181 }, () => new Float64Array(361).fill(-100.0))

  // 4. Fill
  for (let t = 0; t <= 180; t++) {
    const tRad = t * DEG2RAD
    const sinT = Math.sin(tRad)
    const cosT = Math.cos(tRad)

    for (let p = 0; p <= 360; p++) {
      const pRad = p * DEG2RAD
      const cosP = Math.cos(pRad)
      // sinP is needed? Yes for y_src.
      const sinP = Math.sin(pRad)

      // Inverse Rotation Logic (from test logic)
      let z_src = cosT * cosBeta - sinT * cosP * sinBeta
      if (z_src > 1.0)
        z_src = 1.0
      if (z_src < -1.0)
        z_src = -1.0

      const theta_src_rad = Math.acos(z_src)
      const theta_src = theta_src_rad * RAD2DEG

      const y_src = sinT * sinP
      const x_src = sinT * cosP * cosBeta + cosT * sinBeta
      const phi_src_rad = Math.atan2(y_src, x_src)
      let phi_src = phi_src_rad * RAD2DEG

      phi_src = phi_src - offsetPhi
      phi_src = phi_src % 360
      if (phi_src < 0)
        phi_src += 360

      newTable[t]![p] = getInterpolatedValue(oldTable, theta_src, phi_src)
    }
  }

  return {
    table: newTable,
    sliceMode: data.sliceMode, // Mode might be less relevant after full resampling but keep it
  }
}
