import { calculateMetrics } from './calculator'
import { showDialog } from './components/dialog/index'
import { validateFFTable } from './data-validation'
import { renderResults } from './display'
import { parseFFtab } from './parser'
import { getAndValidateInputs, validateFileSelection } from './validation'
import './components/field/index'
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
  // const fileInput = document.getElementById('fileInput') as HTMLInputElement // Now handled via component query in validateFileSelection
  const params = getAndValidateInputs()

  // validateFileSelection will look up the component
  const file = validateFileSelection(null as any)

  if (!params || !file) {
    return
  }
  try {
    const text = await readFile(file)
    const parsedData = parseFFtab(text)

    // Validate Parsed Data
    const validation = validateFFTable(parsedData)

    if (!validation.isValid) {
      renderResults(null)
      await showDialog('Calculation Aborted:', validation.errors.join('\n'))
      return
    }

    if (validation.warnings.length > 0) {
      renderResults(null)
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

// initValidation() // Components handle their own validation events
document.getElementById('calcBtn')?.addEventListener('click', processFile)
