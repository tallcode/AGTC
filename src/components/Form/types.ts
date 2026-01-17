import type { InjectionKey, Ref } from 'vue'

export interface FieldContext {
  validate: (value: any) => void
  setError: (error: string | null) => void
  isError: Ref<boolean>
}

export const FieldContextKey: InjectionKey<FieldContext> = Symbol('FieldContext')

export type RuleValidator = (value: any) => string | boolean | Promise<string | boolean>

export interface FieldRule {
  validator: RuleValidator
  message?: string
}

export interface SelectOption {
  value: string | number
  label: string
}
