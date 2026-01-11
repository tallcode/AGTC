import type { FFTable } from './types'

export function parseFFtab(text: string): FFTable {
  const table: Float64Array[] = Array.from({ length: 181 })
  for (let i = 0; i < 181; i++) {
    table[i] = new Float64Array(361).fill(-100.0)
  }

  const lines = text.split(/\r?\n/)

  // Metadata collection
  let detectedSliceMode: 'phi' | 'theta' | 'unknown' = 'unknown'

  // State
  let currentVariable = -1 // The angle value from the header
  let sliceMode: 'phi' | 'theta' | null = null

  // Helper for comma decimals
  const parseVal = (s: string) => Number.parseFloat(s.replace(',', '.'))

  // Regexes
  const regexPhiHeader = /Phi angle\s*=\s*([-\d.,]+)/
  const regexThetaHeader = /Theta angle\s*=\s*([-\d.,]+)/
  const regexElevationHeader = /Elevation angle\s*=\s*([-\d.,]+)/

  const regexData = /^\s*(\d+)\s+([-\d.,]+)\s+([-\d.,]+)\s+([-\d.,]+)/

  for (const line of lines) {
    // Check headers
    const phiMatch = line.match(regexPhiHeader)
    if (phiMatch) {
      currentVariable = parseVal(phiMatch[1])
      sliceMode = 'phi'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'phi'
      continue
    }

    const thetaMatch = line.match(regexThetaHeader)
    if (thetaMatch) {
      currentVariable = parseVal(thetaMatch[1])
      sliceMode = 'theta'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta'
      continue
    }

    const elevMatch = line.match(regexElevationHeader)
    if (elevMatch) {
      // Convert Elevation to Theta: Theta = 90 - Elevation
      currentVariable = 90.0 - parseVal(elevMatch[1])
      sliceMode = 'theta'
      if (detectedSliceMode === 'unknown')
        detectedSliceMode = 'theta'
      continue
    }

    // Check for Data line
    const dataMatch = line.match(regexData)
    if (dataMatch && sliceMode) {
      const deg = Number.parseInt(dataMatch[1])
      const val = parseVal(dataMatch[4]) // Tot dB is 4th capture group

      let theta = 0
      let phi = 0

      if (sliceMode === 'phi') {
        const fixedPhi = currentVariable
        if (deg <= 180) {
          theta = deg
          phi = fixedPhi
        }
        else {
          theta = 360 - deg
          phi = (fixedPhi + 180) % 360
        }
      }
      else if (sliceMode === 'theta') {
        theta = currentVariable
        phi = deg
      }

      // Store Data
      if (theta >= 0 && theta <= 180 && phi >= 0 && phi <= 360) {
        const t_idx = Math.round(theta)
        const p_idx = Math.round(phi)

        if (t_idx < 181 && p_idx < 361) {
          table[t_idx][p_idx] = val

          // Handle 360 wrap consistency
          if (p_idx === 0)
            table[t_idx][360] = val
          if (p_idx === 360)
            table[t_idx][0] = val
        }
      }
    }
  }

  return {
    table,
    sliceMode: detectedSliceMode,
  }
}
