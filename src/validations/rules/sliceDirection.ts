import type { FFTable } from '../../types'

export function checkSliceDirection(data: FFTable): void {
  const { sliceMode } = data

  if (sliceMode !== 'theta') {
    throw new Error('Slice direction is not Theta.')
  }
}
