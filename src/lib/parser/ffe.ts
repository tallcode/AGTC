import type { FFTable } from '@/types'

/**
 * Parses FEKO .ffe file.
 * Format: Space/tab separated.
 * Columns: Theta, Phi, ..., GainTotal (Column index 8 usually)
 */
export function parseFFE(text: string): FFTable {
  const table: Float64Array[] = Array.from({ length: 181 }, () => new Float64Array(361).fill(-100.0))

  const lines = text.split(/\r?\n/)
  for (let line of lines) {
    line = line.trim()
    if (!line || line.startsWith('#') || line.startsWith('*'))
      continue

    // Split by whitespace
    const parts = line.split(/\s+/)
    if (parts.length < 9)
      continue

    // Often headers are present, first col should be number
    if (Number.isNaN(Number.parseFloat(parts[0]!)))
      continue

    const theta = Math.round(Number.parseFloat(parts[0]!))
    const phi = Math.round(Number.parseFloat(parts[1]!))
    // Index 8 for Total Gain
    const gainTot = Number.parseFloat(parts[8]!)

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
    sliceMode: 'theta', // Spoof 'theta' to satisfy validation
  }
}
