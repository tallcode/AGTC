import type { FFTable } from '../../types'

/**
 * Validates the antenna tilt based on the maximum gain position.
 * It searches for the maximum gain in the table and checks if the corresponding elevation
 * deviates significantly from the horizon (0 degrees elevation).
 *
 * @param data - The parsed FF file data object.
 * @throws {Error} Throws an error if the elevation of the maximum gain is >= 15 degrees or <= -15 degrees.
 */
export function checkTilt(data: FFTable): void {
  // Find the location (theta) of the Maximum Gain.
  let maxGain = -999
  let maxThetaIdx = -1

  for (let t = 0; t <= 180; t++) {
    for (let p = 0; p <= 360; p++) {
      const val = data.table[t]![p]!
      if (val > maxGain) {
        maxGain = val
        maxThetaIdx = t
      }
    }
  }

  if (maxThetaIdx !== -1) {
    // Convert Theta (0..180 where 0 is North Pole) to Elevation (90..-90)
    // Elevation = 90 - Theta
    const maxElev = 90 - maxThetaIdx

    // Check if the tilt exceeds the threshold (15 degrees)
    if (Math.abs(maxElev) >= 15) {
      throw new Error(`Max gain appears at Elevation ${maxElev} degrees! Model might be tilted.`)
    }
  }
}
