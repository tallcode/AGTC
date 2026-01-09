import { calculateMetrics } from './calculator'
import { validateFFTable } from './data-validation'
import { showDialog } from './dialog'
import { hideResults, renderResults } from './display'
import { parseFFtab } from './parser'
import { getAndValidateInputs, initValidation, validateFileSelection } from './validation'
import './style.css'

function readFile(uploadedFile: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = e => reject(e)
    reader.readAsText(uploadedFile)
  })
}

async function processFile() {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement
  const params = getAndValidateInputs()
  const file = validateFileSelection(fileInput)

  if (!params || !file) {
    return
  }
  try {
    const text = await readFile(file)
    const parsedData = parseFFtab(text)

    // Validate Parsed Data
    const validation = validateFFTable(parsedData)

    if (!validation.isValid) {
      hideResults()
      await showDialog('Calculation Aborted:', validation.errors.join('\n'))
      return
    }

    if (validation.warnings.length > 0) {
      hideResults()
      await showDialog('Warning:', validation.warnings.join('\n'))
      return
    }

    const result = calculateMetrics(parsedData, params)
    renderResults(result)
  }
  catch (error) {
    console.error('Error processing file:', error)
  }
}

initValidation()
document.getElementById('calcBtn')?.addEventListener('click', processFile)
