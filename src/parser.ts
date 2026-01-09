import type { ParsedData } from './types'

export function parseFFtab(text: string): ParsedData {
  const tot_dB: Float64Array[] = Array.from({ length: 181 })
  for (let i = 0; i < 181; i++) {
    tot_dB[i] = new Float64Array(361).fill(-100.0)
  }

  const lines = text.split(/\r?\n/)

  // Metadata collection
  let detectedSliceMode: 'phi_fixed' | 'theta_fixed' | 'unknown' = 'unknown'
  let firstStepDiff = 0
  let isFull360 = false
  let minPhi = 360
  let maxPhi = 0
  let firstVarName = ''

  // State
  let currentVariable = -1 // The angle value from the header
  let sliceMode: 'phi_fixed' | 'theta_fixed' | null = null
  let previousDeg = -1

  // Helper for comma decimals
  const parseVal = (s: string) => Number.parseFloat(s.replace(',', '.'))

  // Regexes
  const regexPhiHeader = /Phi angle\s*=\s*([-\d.,]+)/
  const regexThetaHeader = /Theta angle\s*=\s*([-\d.,]+)/
  const regexElevationHeader = /Elevation angle\s*=\s*([-\d.,]+)/
  // Check for Azimuth/Elevation generic headers to capture "First Variable" for error reporting
  // E.g. "Azimuth Angle" usually implies Azimuth Slices (Theta fixed)
  // "Elevation Angle" implies Elevation Slices (Phi fixed)

  const regexData = /^\s*(\d+)\s+([-\d.,]+)\s+([-\d.,]+)\s+([-\d.,]+)/

  for (const line of lines) {
    // Check headers
    const phiMatch = line.match(regexPhiHeader)
    if (phiMatch) {
      currentVariable = parseVal(phiMatch[1])
      sliceMode = 'phi_fixed'
      previousDeg = -1
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'phi_fixed'
      continue
    }

    const thetaMatch = line.match(regexThetaHeader)
    if (thetaMatch) {
      currentVariable = parseVal(thetaMatch[1])
      sliceMode = 'theta_fixed'
      previousDeg = -1
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta_fixed'
      continue
    }

    const elevMatch = line.match(regexElevationHeader)
    if (elevMatch) {
      // Convert Elevation to Theta: Theta = 90 - Elevation
      currentVariable = 90.0 - parseVal(elevMatch[1])
      sliceMode = 'theta_fixed'
      previousDeg = -1
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta_fixed'
      continue
    }

    // Check for explicit "Azimuth" or "Elevation" line that determines file type in BASIC logic
    if (line.trim().startsWith('Azimuth')) {
      if (!firstVarName)
        firstVarName = 'Azimuth'
    }
    else if (line.trim().startsWith('Elevation')) {
      // If it starts with Elevation (and not "Elevation angle ="), it might be the title
      if (!firstVarName && !line.includes('='))
        firstVarName = 'Elevation'
    }

    // Check for Data line
    const dataMatch = line.match(regexData)
    if (dataMatch && sliceMode) {
      const deg = Number.parseInt(dataMatch[1])
      const val = parseVal(dataMatch[4]) // Tot dB is 4th capture group

      // Capture step size from the very first data block we see
      if (previousDeg !== -1 && firstStepDiff === 0) {
        firstStepDiff = Math.abs(deg - previousDeg)
      }
      previousDeg = deg

      let theta = 0
      let phi = 0

      if (sliceMode === 'phi_fixed') {
        const fixedPhi = currentVariable
        // ... (logic handled below)
        if (deg <= 180) {
          theta = deg
          phi = fixedPhi
        }
        else {
          theta = 360 - deg
          phi = (fixedPhi + 180) % 360
        }
      }
      else if (sliceMode === 'theta_fixed') {
        theta = currentVariable
        phi = deg
        minPhi = Math.min(minPhi, phi)
        maxPhi = Math.max(maxPhi, phi)
      }

      // Store Data
      if (theta >= 0 && theta <= 180 && phi >= 0 && phi <= 360) {
        const t_idx = Math.round(theta)
        const p_idx = Math.round(phi)

        if (t_idx < 181 && p_idx < 361) {
          tot_dB[t_idx][p_idx] = val

          // Handle 360 wrap consistency
          if (p_idx === 0)
            tot_dB[t_idx][360] = val
          if (p_idx === 360)
            tot_dB[t_idx][0] = val
        }
      }
    }
  }

  // Determine if full 360
  if (detectedSliceMode === 'theta_fixed') {
    if (minPhi === 0 && maxPhi >= 359)
      isFull360 = true
    // check if it reaches 360? 360 is same as 0.
    // If data goes 0..359 that is full circle (360 points).
    // If data goes 0..360 that is also full circle.
    // If data goes -90..+90, minPhi would be handled differently?
    // But parser expects deg to be positive usually or handled.
    // The regex \d+ implies positive integers for Degree column.
  }

  // Count populated theta rows to verify coverage
  let populatedRows = 0
  for (let i = 0; i < 181; i++) {
    // Check if row has any data != -100 (assuming -100 is default empty)
    // Actually -100 could be valid value? Better check if touched.
    // But float array initialized to -100. Let's assume > -99 or use a flag?
    // For now, let's just use the metadata we gathered.
    if (tot_dB[i][0] > -99.9)
      populatedRows++
  }

  return {
    tot_dB,
    metadata: {
      sliceMode: detectedSliceMode,
      stepSize: firstStepDiff,
      isFull360,
      firstVariable: firstVarName,
      thetaCount: populatedRows,
    },
  }
}
