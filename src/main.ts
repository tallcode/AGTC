import type { InputParams } from './types'
import { calculateMetrics } from './calculate'
import { showDialog } from './components/dialog/index'
import { renderResults } from './display'
import { parseFFtab } from './parser'
import { validateFFTable } from './validations'
import './components/field/index'
import './style.css'

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
    const parsedData = parseFFtab(text)
    const validation = validateFFTable(parsedData)
    if (!validation.isValid) {
      renderResults(null)
      await showDialog('Error', validation.error)
      return
    }
    const result = calculateMetrics(parsedData, params)
    renderResults(result)
  }
  catch (error) {
    console.error('Error processing file:', error)
  }
}

document.getElementById('calcBtn')?.addEventListener('click', main)
