import { html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './index.css'

type FieldType = 'text' | 'number' | 'file'

// Validation rules configuration
export interface Rule {
  name: string
  label: string
  memo: string
  required: boolean
  min?: number
  max?: number
  type?: 'number' | 'file' | 'text'
}

@customElement('app-field')
export class Field extends LitElement {
  @property()
  name: string = '' // acts as ID too

  @property()
  label: string = ''

  @property()
  memo: string = ''

  @property({ type: Boolean })
  required: boolean = false

  @property({ type: Number })
  min?: number

  @property({ type: Number })
  max?: number

  @property()
  type: FieldType = 'text'

  @property()
  value: string = ''

  @property()
  step: number = 1

  @property()
  accept: string = '' // for file inputs

  createRenderRoot() {
    return this
  }

  get inputElement(): HTMLInputElement | null {
    return this.querySelector('input')
  }

  // Helper to construct a Rule object from current props
  private get rule(): Rule {
    return {
      name: this.name,
      label: this.label,
      memo: this.memo,
      required: this.required,
      min: this.min,
      max: this.max,
      type: this.type as FieldType,
    }
  }

  private validateValue(rule: Rule, value: any): { valid: boolean, parsed?: number | File | string, error?: string } {
    if (rule.type === 'file') {
      let file: File | null = null
      if (value instanceof HTMLInputElement) {
        file = value.files && value.files.length > 0 ? value.files[0] : null
      }
      else if (value instanceof FileList) {
        file = value.length > 0 ? value[0] : null
      }
      else if (value instanceof File) {
        file = value
      }

      if (rule.required && !file) {
        return { valid: false, error: `Please select a ${rule.label} first.` }
      }
      // If not required and no file, valid.
      return { valid: true, parsed: file || undefined }
    }

    // For numbers/text
    // If value is HTMLInputElement, get .value
    let strVal = ''
    if (value instanceof HTMLInputElement) {
      strVal = value.value.trim()
    }
    else {
      strVal = String(value || '').trim()
    }

    if (strVal === '') {
      if (rule.required) {
        return { valid: false, error: `${rule.label} is required` }
      }
      return { valid: true, parsed: undefined }
    }

    if (rule.type === 'text') {
      return { valid: true, parsed: strVal }
    }

    const num = Number.parseFloat(strVal)
    if (Number.isNaN(num)) {
      return { valid: false, error: `Invalid ${rule.label}` }
    }

    if (rule.min !== undefined && num < rule.min) {
      return { valid: false, error: `${rule.label} must be >= ${rule.min}` }
    }

    if (rule.max !== undefined && num > rule.max) {
      return { valid: false, error: `${rule.label} must be <= ${rule.max.toLocaleString('en-US')}` }
    }

    return { valid: true, parsed: num }
  }

  // Expose validated value getter
  get parsedValue(): number | File | string | null | undefined {
    const input = this.inputElement
    if (!input)
      return null

    const result = this.validateValue(this.rule, input)
    return result.valid ? result.parsed : null
  }

  // Public validate method
  validate(): boolean {
    const input = this.inputElement
    if (!input)
      return true

    // Remove old error
    this.clearError()

    const result = this.validateValue(this.rule, input)
    if (!result.valid && result.error) {
      this.showError(result.error)
      return false
    }
    return true
  }

  private showError(message: string) {
    const input = this.inputElement
    if (input) {
      input.classList.add('input-error')
      let errorMsg = this.querySelector('.error-message') as HTMLElement
      if (!errorMsg) {
        errorMsg = document.createElement('div')
        errorMsg.className = 'error-message'
        this.appendChild(errorMsg)
      }
      errorMsg.textContent = message
    }
  }

  private clearError() {
    const input = this.inputElement
    if (input) {
      input.classList.remove('input-error')
    }
    const errorMsg = this.querySelector('.error-message')
    if (errorMsg) {
      errorMsg.remove()
    }
  }

  firstUpdated() {
    this.classList.add('input-group')

    const input = this.inputElement
    if (!input)
      return

    if (this.type === 'file') {
      input.addEventListener('change', () => this.validate())
    }
    else {
      input.addEventListener('blur', () => this.validate())
      input.addEventListener('input', () => this.clearError())
    }
  }

  render() {
    const labelText = `${this.label}${this.memo ? ` (${this.memo})` : ''}:`

    if (this.type === 'file') {
      return html`
        <label for="${this.name}">${labelText}</label>
        <input 
          type="file" 
          id="${this.name}" 
          accept="${this.accept}"
        >
      `
    }

    return html`
      <label for="${this.name}">${labelText}</label>
      <input 
        type="${this.type}" 
        id="${this.name}" 
        value="${this.value}" 
        step="${this.step}"
      >
    `
  }
}
