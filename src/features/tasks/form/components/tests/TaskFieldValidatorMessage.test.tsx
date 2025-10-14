import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TaskFieldValidatorMessage } from '../TaskFieldValidatorMessage'
import type { TaskFieldApi } from '../TaskFormSection.types'

type MetaOverrides = Partial<{
  isTouched: boolean
  isValid: boolean
  isValidating: boolean
  errors: string[]
}>

const buildField = (metaOverrides?: MetaOverrides) =>
  ({
    name: 'task.title',
    state: {
      value: '',
      meta: {
        isTouched: false,
        isValid: true,
        isValidating: false,
        errors: [],
        ...metaOverrides,
      },
    },
    handleBlur: vi.fn(),
    handleChange: vi.fn(),
  } as unknown as TaskFieldApi)

describe('TaskFieldValidatorMessage', () => {
  it('renders nothing when the field is pristine and not validating', () => {
    const { container } = render(<TaskFieldValidatorMessage field={buildField()} />)

    expect(container.firstChild).toBeNull()
  })

  it('shows validation errors when the field is touched and invalid', () => {
    render(
      <TaskFieldValidatorMessage
        field={buildField({
          isTouched: true,
          isValid: false,
          errors: ['Required field', 'Too short'],
        })}
      />,
    )

    const message = screen.getByText('Required field, Too short')
    expect(message).toHaveClass('task-field__message--error')
  })

  it('shows validating feedback while the field is validating', () => {
    render(
      <TaskFieldValidatorMessage
        field={buildField({
          isValidating: true,
        })}
      />,
    )

    expect(screen.getByText('Validating...')).toHaveClass('task-field__message--hint')
  })

  it('renders both error and validating messages when applicable', () => {
    render(
      <TaskFieldValidatorMessage
        field={buildField({
          isTouched: true,
          isValid: false,
          isValidating: true,
          errors: ['Invalid entry'],
        })}
      />,
    )

    expect(screen.getByText('Invalid entry')).toBeDefined()
    expect(screen.getByText('Validating...')).toBeDefined()
  })
})

