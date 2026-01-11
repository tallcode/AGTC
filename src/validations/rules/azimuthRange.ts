import type { FFTable } from '@/types'

/**
 * Validates that the antenna pattern data covers the full azimuth range (0 to 360 degrees).
 * It scans for valid gain data points (greater than -99.9 dB) to determine coverage.
 */
export function checkAzimuthRange(data: FFTable): void {
  const { table } = data
  let isFull360 = false

  // Find the first theta row that contains valid data to use for azimuth scanning
  let firstPopulatedTheta = -1
  for (let t = 0; t <= 180; t++) {
    // -99.9 is used as a sentinel for "no data" or "invalid data"
    if (table[t][0] > -99.9) {
      firstPopulatedTheta = t
      break
    }
  }

  if (firstPopulatedTheta !== -1) {
    const row = table[firstPopulatedTheta]
    let minPhi = 360
    let maxPhi = 0

    // Scan all phi angles to find the min and max populated azimuths
    for (let p = 0; p <= 360; p++) {
      if (row[p] > -99.9) {
        if (p < minPhi)
          minPhi = p
        if (p > maxPhi)
          maxPhi = p
      }
    }

    // Determine if the range effectively covers the full circle.
    // We expect data to start at 0 and go up to at least 359 (allowing for 1-degree steps)
    if (minPhi === 0 && maxPhi >= 359) {
      isFull360 = true
    }
  }

  // validation failed if not full 360
  if (!isFull360) {
    throw new Error('Azimuth range is incomplete (not full 360 degrees circle).')
  }
}
