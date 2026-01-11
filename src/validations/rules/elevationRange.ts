import type { FFTable } from '../../types'

export function checkElevationRange(data: FFTable): void {
  const { table } = data
  let thetaCount = 0

  for (let t = 0; t <= 180; t++) {
    // Check if index 0 is valid.
    if (table[t][0] > -99.9) {
      thetaCount++
    }
  }

  // Check Elevation coverage for full sphere integration
  if (thetaCount !== 181) {
    throw new Error(`Elevation range is incomplete. Found ${thetaCount} slices, expected 181 for full sphere (0-180 deg).`)
  }
}
