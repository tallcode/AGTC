import type { InputParams } from './types'

// Validation rules configuration
interface Rule {
  name: string
  label: string
  required: boolean
  min?: number
  max?: number
  type?: 'number' | 'file'
}

const RULES: Record<string, Rule> = {
  skyTemp: {
    name: 'skyTemp',
    label: 'Sky Temperature',
    required: true,
    min: 0,
    max: 9_999_999,
    type: 'number',
  },
  earthTemp: {
    name: 'earthTemp',
    label: 'Earth Temperature',
    required: true,
    min: 0,
    max: 9_999_999,
    type: 'number',
  },
  translineLoss: {
    name: 'translineLoss',
    label: 'Trans. Line Loss',
    required: true,
    min: 0,
    type: 'number',
  },
  ReceiverNF: {
    name: 'ReceiverNF',
    label: 'Receiver NF',
    required: true,
    min: 0,
    type: 'number',
  },
  fileInput: {
    name: 'fileInput',
    label: 'Far Field Table (FFtab) file',
    required: true,
    type: 'file',
  },
}

function showError(input: HTMLInputElement, message: string) {
  input.classList.add('input-error')

  // Create or update error message element
  let errorMsg = input.parentElement?.querySelector('.error-message') as HTMLElement
  if (!errorMsg) {
    errorMsg = document.createElement('div')
    errorMsg.className = 'error-message'
    input.parentElement?.appendChild(errorMsg)
  }
  errorMsg.textContent = message
}

function clearError(input: HTMLInputElement) {
  input.classList.remove('input-error')
  const errorMsg = input.parentElement?.querySelector('.error-message')
  if (errorMsg) {
    errorMsg.remove()
  }
}

function validateSingleInput(input: HTMLInputElement): number | File | null {
  const rule = RULES[input.id]
  if (!rule)
    return null

  clearError(input)

  if (rule.type === 'file') {
    if (rule.required && (!input.files || !input.files.length)) {
      showError(input, `Please select a ${rule.label} first.`)
      return null
    }
    return input.files && input.files[0] ? input.files[0] : null
  }

  const value = input.value.trim()

  if (value === '') {
    if (rule.required) {
      showError(input, `${rule.label} is required`)
      return null
    }
    return null
  }

  const num = Number.parseFloat(value)
  if (Number.isNaN(num)) {
    showError(input, `Invalid ${rule.label}`)
    return null
  }

  if (rule.min !== undefined && num < rule.min) {
    showError(input, `${rule.label} must be >= ${rule.min}`)
    return null
  }

  if (rule.max !== undefined && num > rule.max) {
    showError(input, `${rule.label} must be <= ${rule.max.toLocaleString('en-US')}`)
    return null
  }

  return num
}

export function initValidation() {
  Object.keys(RULES).forEach((id) => {
    const input = document.getElementById(id) as HTMLInputElement
    if (!input)
      return

    if (RULES[id].type === 'file') {
      input.addEventListener('change', () => {
        validateSingleInput(input)
      })
    }
    else {
      // Validate on blur
      input.addEventListener('blur', () => {
        validateSingleInput(input)
      })
      // Clear error on input
      input.addEventListener('input', () => {
        clearError(input)
      })
    }
  })
}

export function getAndValidateInputs(): InputParams | null {
  const skyTempInput = document.getElementById('skyTemp') as HTMLInputElement
  const earthTempInput = document.getElementById('earthTemp') as HTMLInputElement
  const translineLossInput = document.getElementById('translineLoss') as HTMLInputElement
  const receiverNFInput = document.getElementById('ReceiverNF') as HTMLInputElement

  // Validate all inputs
  const skyTemp = validateSingleInput(skyTempInput) as number | null
  const earthTemp = validateSingleInput(earthTempInput) as number | null
  const translineLoss = validateSingleInput(translineLossInput) as number | null
  const receiverNF = validateSingleInput(receiverNFInput) as number | null

  if (skyTemp === null || earthTemp === null || translineLoss === null || receiverNF === null) {
    return null
  }

  return {
    skyTemp,
    earthTemp,
    translineLoss,
    receiverNF,
  }
}

export function validateFileSelection(fileInput: HTMLInputElement): File | null {
  const result = validateSingleInput(fileInput)
  return result instanceof File ? result : null
}
