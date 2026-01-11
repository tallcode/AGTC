import type { FFTable } from '@/types'

/**
 * Validates that the far-field data covers the full elevation range (Theta: 0 to 180 degrees),
 * which is required for full sphere gain/temperature integration.
 *
 * Checks if valid data exists for every degree of Theta from 0 to 180.
 */
export function checkElevationRange(data: FFTable): void {
  const { table } = data
  let thetaCount = 0

  // Iterate explicitly from 0 to 180 degrees to verify full coverage
  for (let t = 0; t <= 180; t++) {
    // Check if data exists for this elevation angle.
    // We check index 0 (Phi=0) as a representative sample.
    // Values <= -99.9 are considered invalid or missing data.
    if (table[t][0] > -99.9) {
      thetaCount++
    }
  }

  // Check Elevation coverage for full sphere integration
  if (thetaCount !== 181) {
    throw new Error(`Elevation range is incomplete. Found ${thetaCount} slices, expected 181 for full sphere (0-180 deg).`)
  }
}
