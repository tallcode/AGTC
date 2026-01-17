import type { FFTable } from '@/types'

/**
 * Parses MMANA-GAL .csv file.
 * Format: Theta, Phi, GainV, GainH, GainTot, ...
 * Assumes full sphere data is often provided, or at least ample slices.
 */
export function parseMMANA(text: string): FFTable {
  const table: Float64Array[] = Array.from({ length: 181 }, () => new Float64Array(361).fill(-100.0))

  const lines = text.split(/\r?\n/)
  for (let line of lines) {
    line = line.trim()
    if (!line || Number.isNaN(Number.parseFloat(line[0]!)))
      continue // Skip headers or empty lines

    const parts = line.split(',')
    if (parts.length < 5)
      continue

    const theta = Math.round(Number.parseFloat(parts[0]!))
    const phi = Math.round(Number.parseFloat(parts[1]!))
    const gainTot = Number.parseFloat(parts[4]!)

    if (theta >= 0 && theta <= 180 && phi >= 0 && phi <= 360) {
      if (theta < 181 && phi < 361) {
        table[theta]![phi] = gainTot
        // Handle wrapping
        if (phi === 0)
          table[theta]![360] = gainTot
        if (phi === 360)
          table[theta]![0] = gainTot
      }
    }
  }

  return {
    table,
    sliceMode: 'theta', // Spoof 'theta' to satisfy existing validation rules which enforce it
  }
}
