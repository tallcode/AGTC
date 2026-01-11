import type { InputParams } from './types'

export function getAndValidateInputs(): InputParams | null {
  const skyTempField = document.querySelector('app-field[name="skyTemp"]') as any
  const earthTempField = document.querySelector('app-field[name="earthTemp"]') as any
  const translineLossField = document.querySelector('app-field[name="translineLoss"]') as any
  const receiverNFField = document.querySelector('app-field[name="ReceiverNF"]') as any

  // Validate all inputs - calling public validate on component
  const v1 = skyTempField?.validate?.()
  const v2 = earthTempField?.validate?.()
  const v3 = translineLossField?.validate?.()
  const v4 = receiverNFField?.validate?.()

  if (!v1 || !v2 || !v3 || !v4) {
    return null
  }

  // Retrieve validated values
  const skyTemp = skyTempField?.parsedValue
  const earthTemp = earthTempField?.parsedValue
  const translineLoss = translineLossField?.parsedValue
  const receiverNF = receiverNFField?.parsedValue

  if (skyTemp === null || earthTemp === null || translineLoss === null || receiverNF === null
    || skyTemp === undefined || earthTemp === undefined || translineLoss === undefined || receiverNF === undefined) {
    return null
  }

  return {
    skyTemp,
    earthTemp,
    translineLoss,
    receiverNF,
  }
}

export function validateFileSelection(_unused?: any): File | null {
  // We ignore arguments and look for the component
  const el = document.querySelector('app-field[name="fileInput"]') as any
  if (el) {
    if (!el.validate())
      return null
    return el.parsedValue instanceof File ? el.parsedValue : null
  }
  return null
}
