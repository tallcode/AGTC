import type { CalculationResult } from './types'
import './components/output'

export function renderResults(result: CalculationResult | null | undefined) {
  const resultsEl = document.getElementById('agtc-output') as any
  if (!resultsEl)
    return
  resultsEl.data = result
}
