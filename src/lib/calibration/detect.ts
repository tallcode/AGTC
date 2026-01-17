import type { FFTable } from '@/types'

export interface DetectResult {
  needed: boolean
  reason?: string
  maxTheta: number
  maxPhi: number
  maxVal: number
}

/**
 * Detects if the antenna pattern requires calibration.
 * Checks if the maximum gain is aligned with the horizon (Theta=90) and Azimuth=0.
 *
 * @param data - The parsed FF file data object.
 */
export function detect(data: FFTable): DetectResult {
  let maxVal = -Infinity
  let maxTheta = -1
  let maxPhi = -1

  const table = data.table

  // Find max gain position
  for (let t = 0; t <= 180; t++) {
    for (let p = 0; p <= 360; p++) {
      const val = table[t]![p]!
      if (val > maxVal) {
        maxVal = val
        maxTheta = t
        maxPhi = p
      }
    }
  }

  // Check deviation
  // Target: Theta = 90 (Elevation 0), Phi = 0
  const isThetaAligned = maxTheta === 90
  const isPhiAligned = maxPhi === 0

  const needed = !isThetaAligned || !isPhiAligned

  let reason = ''
  if (needed) {
    const reasons: string[] = []
    if (!isThetaAligned)
      reasons.push(`Max gain at Elevation ${90 - maxTheta}° (Expected 0°)`)
    if (!isPhiAligned)
      reasons.push(`Max gain at Azimuth ${maxPhi}° (Expected 0°)`)

    reason = reasons.join('; ')
  }

  return {
    needed,
    reason,
    maxTheta,
    maxPhi,
    maxVal,
  }
}
