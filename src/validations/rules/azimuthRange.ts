import type { FFTable } from '../../types'

export function checkAzimuthRange(data: FFTable): void {
  const { table } = data
  let isFull360 = false

  // We need to find a populated row (theta) and scan its phi values
  let firstPopulatedTheta = -1
  for (let t = 0; t <= 180; t++) {
    if (table[t][0] > -99.9) {
      firstPopulatedTheta = t
      break
    }
  }

  if (firstPopulatedTheta !== -1) {
    const row = table[firstPopulatedTheta]
    let minPhi = 360
    let maxPhi = 0

    for (let p = 0; p <= 360; p++) {
      if (row[p] > -99.9) {
        if (p < minPhi)
          minPhi = p
        if (p > maxPhi)
          maxPhi = p
      }
    }

    // Check full 360
    // If we have 0 and (360 or 359 depending on step)
    if (minPhi === 0 && maxPhi >= 359) {
      isFull360 = true
    }
  }

  // "FF_not_full range"
  if (!isFull360) {
    throw new Error('Azimuth range is incomplete (not full 360 degrees circle).')
  }
}
