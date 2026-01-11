import type { FFTable } from '../../types'

export function checkTilt(data: FFTable): void {
  // 4. Tilt Check (Warning)
  // Find where Max Gain is.
  let maxGain = -999
  let maxThetaIdx = -1

  for (let t = 0; t <= 180; t++) {
    for (let p = 0; p <= 360; p++) {
      const val = data.table[t][p]
      if (val > maxGain) {
        maxGain = val
        maxThetaIdx = t
      }
    }
  }

  if (maxThetaIdx !== -1) {
    const maxElev = 90 - maxThetaIdx
    if (Math.abs(maxElev) >= 15) {
      throw new Error(`Max gain appears at Elevation ${maxElev} degrees! Model might be tilted.`)
    }
  }
}
