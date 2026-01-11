import type { InputParams } from '@/types'
import { calculateMetrics } from '@/calculate'
import { showDialog } from '@/components/dialog/index'
import { render } from '@/display'
import { parseFFTab } from '@/parse'
import { validateFFTab } from '@/validations'
import '@/components/field/index'
import '@/style.css'

// Gather and validate inputs from the form fields
function getAndValidateInputs(): InputParams | null {
  const skyTempField = document.querySelector('app-field[name="skyTemp"]') as any
  const earthTempField = document.querySelector('app-field[name="earthTemp"]') as any
  const translineLossField = document.querySelector('app-field[name="translineLoss"]') as any
  const receiverNFField = document.querySelector('app-field[name="ReceiverNF"]') as any
  const fileField = document.querySelector('app-field[name="fileInput"]') as any

  if ([
    skyTempField,
    earthTempField,
    translineLossField,
    receiverNFField,
    fileField,
  ].some(f => !f?.validate?.())
  ) {
    return null
  }

  return {
    skyTemp: skyTempField?.parsedValue,
    earthTemp: earthTempField?.parsedValue,
    translineLoss: translineLossField?.parsedValue,
    receiverNF: receiverNFField?.parsedValue,
    file: fileField?.parsedValue,
  }
}

// Read the uploaded file and return its text content
function readFile(uploadedFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = e => reject(e)
    reader.readAsText(uploadedFile)
  })
}

async function main() {
  const params = getAndValidateInputs()
  if (!params) {
    return
  }
  try {
    const text = await readFile(params.file)
    const data = parseFFTab(text)
    const validation = validateFFTab(data)
    if (!validation.isValid) {
      render(null)
      await showDialog('Error', validation.error)
      return
    }
    const result = calculateMetrics(data, params)
    render(result)
  }
  catch (error) {
    console.error('Error processing file:', error)
  }
}

document.getElementById('calcBtn')?.addEventListener('click', main)
