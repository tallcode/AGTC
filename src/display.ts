import type { CalculationResult } from './types'
import { html, render } from 'lit'
import './components/calculation-results'

export function renderResults(result: CalculationResult) {
  const resultsDiv = document.getElementById('results')
  if (!resultsDiv)
    return

  resultsDiv.style.display = 'block'

  const template = html`<calculation-results .data=${result}></calculation-results>`

  render(template, resultsDiv)
}

export function hideResults() {
  const resultsDiv = document.getElementById('results')
  if (resultsDiv)
    resultsDiv.style.display = 'none'
}
