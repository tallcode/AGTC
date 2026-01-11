import type { ParsedData } from './types'

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

function analyzeCoverage(tot_dB: Float64Array[]) {
  let thetaCount = 0
  let isFull360 = false
  let stepSize = 0

  // 1. Theta Count (using old logic: check index 0)
  for (let t = 0; t <= 180; t++) {
    // Check if index 0 is valid.
    // NOTE: If the scan doesn't start at phi=0, this might fail.
    // But usually FF tables start at 0.
    if (tot_dB[t][0] > -99.9) {
      thetaCount++
    }
  }

  // 2. Step Size & Full 360 Check
  // We need to find a populated row (theta) and scan its phi values
  let firstPopulatedTheta = -1
  for (let t = 0; t <= 180; t++) {
    // check if this row has *any* data?
    // or just check if [t][0] is there.
    if (tot_dB[t][0] > -99.9) {
      firstPopulatedTheta = t
      break
    }
  }

  if (firstPopulatedTheta !== -1) {
    const row = tot_dB[firstPopulatedTheta]
    let minPhi = 360
    let maxPhi = 0
    let prevPhi = -1
    let foundFirstStep = false

    for (let p = 0; p <= 360; p++) {
      if (row[p] > -99.9) {
        if (p < minPhi)
          minPhi = p
        if (p > maxPhi)
          maxPhi = p

        if (prevPhi !== -1 && !foundFirstStep) {
          stepSize = p - prevPhi
          foundFirstStep = true
        }
        prevPhi = p
      }
    }

    // Check full 360
    // If we have 0 and (360 or 359 depending on step)
    if (minPhi === 0 && maxPhi >= 359) {
      isFull360 = true
    }
    // Specific case: if step is 1, maxPhi could be 359 or 360.
    // If step is 10, 0, 10, ... 350. MaxPhi=350.
    // Is that "Full 360"?
    // The previous logic was: if (minPhi === 0 && maxPhi >= 359) isFull360 = true
    // If step=1, maxPhi can be 359.
    // If step=10, maxPhi=350. That is NOT >= 359.
    // So the previous logic might fail for coarse steps?
    // But the BASIC code checks for Step Size = 1. So maybe it assumes step 1.
    // If step > 1, validation fails anyway.

    // However, if we want to be robust:
    if (stepSize > 0 && minPhi === 0 && maxPhi === (360 - stepSize)) {
      // Is this considered full circle?
      // The original parser logic was:
      // if (minPhi === 0 && maxPhi >= 359) isFull360 = true
      // This implies it expects nearly 360.
    }
  }

  return { thetaCount, stepSize, isFull360 }
}

export function validateFFTable(data: ParsedData): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  const { thetaCount, stepSize, isFull360 } = analyzeCoverage(data.tot_dB)

  // 1. Slice Direction Check
  // "FF_elev_slices = Error..."
  if (data.sliceMode === 'phi') {
    errors.push('FFtab Slice Error: Slices are Elevation instead of Azimuth (slice direction is wrong)')
  }
  else if (data.sliceMode === 'unknown') {
    // If unknown, it might be weird format, but check simple parsing success
    if (thetaCount === 0) {
      errors.push('FFtab Error: Could not parse any valid data slices.')
    }
  }

  // 2. Step Size Check
  // BASIC: checks if step is 1
  if (stepSize !== 1 && stepSize !== 0) { // 0 if only 1 point?
    // If step size is not 1, it might be coarse.
    // But for G/T calculation, is 1 degree required?
    // The BASIC code says "FF Table step : 1 degree." and validates it strictly.
    errors.push(`FFtab Step Error: Step size is ${stepSize} degrees. Required: 1 degree.`)
  }

  // 3. Range Check
  // "FF_not_full range"
  if (!isFull360) {
    errors.push('FFtab Range Error: Azimuth range is incomplete (not full 360 degrees circle).')
  }

  // Check Elevation coverage for full sphere integration
  if (thetaCount !== 181) {
    errors.push(`FFtab Range Error: Elevation range is incomplete. Found ${thetaCount} slices, expected 181 for full sphere (0-180 deg).`)
  }

  // 4. Tilt Check (Warning)
  // "FF_tilt_30deg"
  // Find where Max Gain is.
  let maxGain = -999
  let maxThetaIdx = -1

  for (let t = 0; t <= 180; t++) {
    for (let p = 0; p <= 360; p++) {
      const val = data.tot_dB[t][p]
      if (val > maxGain) {
        maxGain = val
        maxThetaIdx = t
      }
    }
  }

  // maxThetaIdx = 90 means Elevation = 0 (Horizon).
  // Ideally max gain is at horizon for many antennas, or slightly elevated.
  // 30 degrees tilt means Elevation = 30 -> Theta = 60.
  // Or Elevation = 60 -> Theta = 30.
  // BASIC says: "FF_tilt_30deg = Entire model tilted = Elevation in model is 30 deg."
  // If max gain elevation is 30 deg (Theta 60), it's significant.
  // We check if it is far from horizon?
  // Actually, some antennas are designed for sky (satellite)?
  // But the warning "Calculated data not suitable for most uses" implies terrestrial use.

  // Let's implement the specific check mentioned: "Elevation 30 deg"
  // Theta = 90 - Elev. Elev = 90 - Theta.
  // Diff from 0?
  // Let's warn if Elevation > 5 deg or < -5 deg?
  // Wait, BASIC doesn't hardcode 30. It just mentions 30 as an example of tilt.
  // "FFtab valid, but max gain appears at 30 degrees!"
  // Let's check if |Elevation| > 15 degrees maybe?
  if (maxThetaIdx !== -1) {
    const maxElev = 90 - maxThetaIdx
    if (Math.abs(maxElev) >= 15) {
      warnings.push(`FFtab Warning: Max gain appears at Elevation ${maxElev} degrees! Model might be tilted.`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}
