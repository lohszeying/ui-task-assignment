import type { JSX } from 'react'
import type { Skill } from '../../../types/tasks'
import type { TaskFormValues } from '../utils/taskFormHelpers'

export type TaskFieldPath = string
export type TaskArrayFieldPath = string

export interface TaskFieldMeta {
  isTouched: boolean
  isValid: boolean
  isValidating: boolean
  errors: string[]
}

export interface TaskFieldState<Value> {
  value: Value
  meta: TaskFieldMeta
}

export interface TaskFieldApi<Value = unknown> {
  name: string
  state: TaskFieldState<Value>
  handleBlur: () => void
  handleChange: (value: Value) => void
}

export interface TaskFormSectionForm {
  Field: (props: {
    name: TaskFieldPath
    validators?: {
      onChange?: (args: { value: string }) => string | undefined
      onChangeAsyncDebounceMs?: number
      onChangeAsync?: (args: { value: string }) => Promise<string | undefined>
    }
    children: (field: TaskFieldApi) => JSX.Element
  }) => JSX.Element
  pushFieldValue: (field: TaskArrayFieldPath, value: TaskFormValues) => void
  deleteField: (field: TaskFieldPath) => void
}

export interface TaskFormSectionProps {
  form: TaskFormSectionForm
  fieldPath: TaskFieldPath | null
  depth: number
  availableSkills: Skill[]
  isLoadingSkills: boolean
  skillsErrorMessage: string | null
  isDisabled: boolean
}
