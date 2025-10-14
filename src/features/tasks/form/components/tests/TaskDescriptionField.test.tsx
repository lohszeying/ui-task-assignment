import type { JSX } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { TaskDescriptionField } from '../TaskDescriptionField'
import type { TaskFieldApi, TaskFieldPath } from '../TaskFormSection.types'

vi.mock('../TaskFieldValidatorMessage', () => ({
  TaskFieldValidatorMessage: ({ field }: { field: TaskFieldApi }) => (
    <div data-testid="task-field-validator" data-valid={String(field.state.meta.isValid)} />
  ),
}))

type FieldState = {
  value: string
  meta: {
    isTouched: boolean
    isValid: boolean
    isValidating: boolean
    errors: string[]
  }
}

const createFieldContext = (value = '') => {
  const handleBlur = vi.fn()
  const handleChange = vi.fn()

  const state: FieldState = {
    value,
    meta: {
      isTouched: false,
      isValid: true,
      isValidating: false,
      errors: [],
    },
  }

  const Field = ({
    name,
    children,
  }: {
    name: TaskFieldPath
    children: (field: TaskFieldApi) => JSX.Element
  }) =>
    children({
      name,
      state,
      handleBlur,
      handleChange,
    } as unknown as TaskFieldApi)

  return { Field, state, handleBlur, handleChange }
}

describe('TaskDescriptionField', () => {
  it('renders the textarea and forwards blur/change events', () => {
    const { Field, handleBlur, handleChange } = createFieldContext()

    render(<TaskDescriptionField Field={Field} name="task.description" isDisabled={false} />)

    const textarea = screen.getByRole('textbox', { name: 'Task description' })
    expect(textarea).toHaveAttribute('id', 'task-description')
    expect(textarea).not.toBeDisabled()

    fireEvent.change(textarea, { target: { value: 'New description' } })
    fireEvent.blur(textarea)

    expect(handleChange).toHaveBeenCalledWith('New description')
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('disables the textarea when requested', () => {
    const { Field } = createFieldContext()

    render(<TaskDescriptionField Field={Field} name="task.description" isDisabled />)

    expect(screen.getByRole('textbox', { name: 'Task description' })).toBeDisabled()
  })
})

