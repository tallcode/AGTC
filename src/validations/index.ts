import type { FFTable } from '../types'
import { checkAzimuthRange } from './rules/azimuthRange'
import { checkElevationRange } from './rules/elevationRange'
import { checkSliceDirection } from './rules/sliceDirection'
import { checkStepSize } from './rules/stepSize'
import { checkTilt } from './rules/tilt'

export interface ValidationResult {
  isValid: boolean
  error: string
}

const validators = [
  checkSliceDirection,
  checkAzimuthRange,
  checkElevationRange,
  checkStepSize,
  checkTilt,
]

export function validateFFTable(data: FFTable): ValidationResult {
  for (const validator of validators) {
    try {
      validator(data)
    }
    catch (e: any) {
      // console.error(e)
      const msg = typeof e === 'string' ? e : e.message || String(e)
      return {
        isValid: false,
        error: msg,
      }
    }
  }

  return {
    isValid: true,
    error: '',
  }
}
