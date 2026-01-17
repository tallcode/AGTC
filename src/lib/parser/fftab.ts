import type { FFTable } from '@/types'

/**
 * Parses the Far Field Table text content into a structured 2D array.
 *
 * Supports processing files with Phi or Theta/Elevation slices.
 * Initializes a [181][361] table (Theta 0-180, Phi 0-360) with a default value of -100.0.
 *
 * @param text - The raw text content of the FF file.
 * @returns An object containing the parsed table and the detected slice mode.
 */
export function parseFFTab(text: string): FFTable {
  // Initialize table: Theta (0..180) x Phi (0..360)
  // Default value -100.0 represents a noise floor or invalid data
  const table: Float64Array[] = Array.from({ length: 181 }, () => new Float64Array(361).fill(-100.0))

  const lines = text.split(/\r?\n/)

  // Metadata collection
  let detectedSliceMode: 'phi' | 'theta' | 'unknown' = 'unknown'

  // State
  let currentVariable = -1 // The fixed angle value from the current section header
  let sliceMode: 'phi' | 'theta' | null = null

  // Helper for comma decimals (e.g., "12,5" -> 12.5)
  const parseVal = (s: string) => Number.parseFloat(s.replace(',', '.'))

  // Regexes for parsing headers and data lines
  const regexPhiHeader = /Phi angle\s*=\s*([-\d.,]+)/
  const regexThetaHeader = /Theta angle\s*=\s*([-\d.,]+)/
  const regexElevationHeader = /Elevation angle\s*=\s*([-\d.,]+)/

  // Matches data line: Degree  Ang  Mag  S(dB) ...
  // Group 1: Degree (0..360)
  // Group 4: Total dB (Target Value)
  const regexData = /^\s*(\d+)\s+([-\d.,]+)\s+([-\d.,]+)\s+([-\d.,]+)/

  for (const line of lines) {
    // --- Header Parsing ---
    const phiMatch = line.match(regexPhiHeader)
    if (phiMatch) {
      currentVariable = parseVal(phiMatch[1]!)
      sliceMode = 'phi'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'phi'
      continue
    }

    const thetaMatch = line.match(regexThetaHeader)
    if (thetaMatch) {
      currentVariable = parseVal(thetaMatch[1]!)
      sliceMode = 'theta'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta'
      continue
    }

    const elevMatch = line.match(regexElevationHeader)
    if (elevMatch) {
      // Convert Elevation to Theta: Theta = 90 - Elevation
      // Elevation typically runs -90 to 90, mapping to Theta 180 to 0
      currentVariable = 90.0 - parseVal(elevMatch[1]!)
      sliceMode = 'theta'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta'
      continue
    }

    // --- Data Parsing ---
    const dataMatch = line.match(regexData)
    if (dataMatch && sliceMode) {
      const deg = Number.parseInt(dataMatch[1]!) // The scanning angle
      const val = parseVal(dataMatch[4]!) // Tot dB is 4th capture group

      let theta = 0
      let phi = 0

      if (sliceMode === 'phi') {
        const fixedPhi = currentVariable
        // In a Phi slice, we sweep Theta.
        // Usually 0-180 is the front side, 180-360 is the back side (requires phi flip).
        if (deg <= 180) {
          theta = deg
          phi = fixedPhi
        }
        else {
          // If scanning angle > 180, it corresponds to the opposite side of the sphere.
          // Theta mirrors back (360 - deg), and Phi shifts by 180 degrees.
          theta = 360 - deg
          phi = (fixedPhi + 180) % 360
        }
      }
      else if (sliceMode === 'theta') {
        // In a Theta slice, we sweep Phi directly.
        theta = currentVariable
        phi = deg
      }

      // Store Data into the table
      if (theta >= 0 && theta <= 180 && phi >= 0 && phi <= 360) {
        // Map floating point angles to nearest integer indices
        const t_idx = Math.round(theta)
        const p_idx = Math.round(phi)

        if (t_idx < 181 && p_idx < 361) {
          table[t_idx]![p_idx] = val

          // Handle 0/360 wrap consistency for Phi
          if (p_idx === 0)
            table[t_idx]![360] = val
          if (p_idx === 360)
            table[t_idx]![0] = val
        }
      }
    }
  }

  return {
    table,
    sliceMode: detectedSliceMode,
  }
}
