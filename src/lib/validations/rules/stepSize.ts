import type { FFTable } from '@/types'

/**
 * Validates that the step size of the data is 1 degree.
 * It scans the first populated Theta row to determine the Phi step size.
 *
 * @param data - The parsed FF file data object containing the table.
 * @throws {Error} Throws an error if the detected step size is not 1 degree (ignoring 0 for single points).
 */
export function checkStepSize(data: FFTable): void {
  const { table } = data
  let stepSize = 0

  // Find the first theta row that has valid data at phi=0
  let firstPopulatedTheta = -1
  for (let t = 0; t <= 180; t++) {
    if (table[t]![0]! > -99.9) {
      firstPopulatedTheta = t
      break
    }
  }

  if (firstPopulatedTheta !== -1) {
    const row = table[firstPopulatedTheta]!
    let prevPhi = -1
    let foundFirstStep = false

    // Scan phi values in the row to calculate the step size
    for (let p = 0; p <= 360; p++) {
      if (row[p]! > -99.9) {
        if (prevPhi !== -1 && !foundFirstStep) {
          stepSize = p - prevPhi
          foundFirstStep = true
        }
        prevPhi = p
      }
    }
  }

  // Validate that the step size is exactly 1 degree.
  // We allow 0 to pass to handle cases with only a single point (no step detected).
  if (stepSize !== 1 && stepSize !== 0) {
    throw new Error(`Step size is ${stepSize} degrees. Required: 1 degree.`)
  }
}
