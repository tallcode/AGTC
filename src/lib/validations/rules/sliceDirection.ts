import type { FFTable } from '@/types'

/**
 * Validates if the slice direction is Theta.
 * Currently, the system only supports processing slice data in the Theta direction.
 *
 * @param data - The parsed FF file data object.
 * @throws {Error} Throws an error if the slice mode is not 'theta'.
 */
export function checkSliceDirection(data: FFTable): void {
  const { sliceMode } = data

  // Check slice mode, must be 'theta'
  if (sliceMode !== 'theta') {
    throw new Error('Slice direction is not Theta.')
  }
}
