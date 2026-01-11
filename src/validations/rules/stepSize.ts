import type { FFTable } from '../../types'

export function checkStepSize(data: FFTable): void {
  const { table } = data
  let stepSize = 0

  // We need to find a populated row (theta) and scan its phi values
  let firstPopulatedTheta = -1
  for (let t = 0; t <= 180; t++) {
    if (table[t][0] > -99.9) {
      firstPopulatedTheta = t
      break
    }
  }

  if (firstPopulatedTheta !== -1) {
    const row = table[firstPopulatedTheta]
    let prevPhi = -1
    let foundFirstStep = false

    for (let p = 0; p <= 360; p++) {
      if (row[p] > -99.9) {
        if (prevPhi !== -1 && !foundFirstStep) {
          stepSize = p - prevPhi
          foundFirstStep = true
        }
        prevPhi = p
      }
    }
  }

  // BASIC: checks if step is 1
  if (stepSize !== 1 && stepSize !== 0) { // 0 if only 1 point?
    throw new Error(`Step size is ${stepSize} degrees. Required: 1 degree.`)
  }
}
