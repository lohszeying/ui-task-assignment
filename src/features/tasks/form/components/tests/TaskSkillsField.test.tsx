import type { JSX } from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskSkillsField } from '../TaskSkillsField'
import type { TaskFieldApi, TaskFieldPath } from '../TaskFormSection.types'
import type { Skill } from '../../../../../types/tasks'

vi.mock('../../../../skills/components/SkillPill', () => ({
  SkillPill: ({
    label,
    onClick,
    disabled,
    isSelected,
  }: {
    label: string
    onClick?: () => void
    disabled?: boolean
    isSelected: boolean
  }) => (
    <button
      type="button"
      data-testid={`skill-pill-${label}`}
      data-selected={String(isSelected)}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  ),
}))

type FieldMeta = {
  isTouched: boolean
  isValid: boolean
  errors: string[]
  isValidating: boolean
}

const createFieldContext = (options?: { value?: number[]; meta?: FieldMeta }) => {
  const handleChange = vi.fn()
  const handleBlur = vi.fn()

  const state = {
    value: options?.value ?? [],
    meta:
      options?.meta ??
      ({
        isTouched: false,
        isValid: true,
        errors: [],
        isValidating: false,
      } satisfies FieldMeta),
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
      handleChange,
      handleBlur,
    } as unknown as TaskFieldApi)

  return { Field, handleChange, handleBlur, state }
}

const availableSkills: Skill[] = [
  { skillId: 1, skillName: 'TypeScript' },
  { skillId: 2, skillName: 'React' },
]

describe('TaskSkillsField', () => {
  it('renders skill pills and toggles selection', () => {
    const { Field, handleChange, handleBlur } = createFieldContext()

    render(
      <TaskSkillsField
        Field={Field}
        name="task.skills"
        availableSkills={availableSkills}
        isLoading={false}
        errorMessage={null}
        isDisabled={false}
      />,
    )

    const pill = screen.getByRole('button', { name: 'TypeScript' })

    expect(pill).toHaveAttribute('data-selected', 'false')

    fireEvent.click(pill)

    expect(handleChange).toHaveBeenCalledWith([1])
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('removes a selected skill when clicked again', () => {
    const { Field, handleChange } = createFieldContext({ value: [1, 2] })

    render(
      <TaskSkillsField
        Field={Field}
        name="task.skills"
        availableSkills={availableSkills}
        isLoading={false}
        errorMessage={null}
        isDisabled={false}
      />,
    )

    const pill = screen.getByRole('button', { name: 'TypeScript' })

    expect(pill).toHaveAttribute('data-selected', 'true')

    fireEvent.click(pill)

    expect(handleChange).toHaveBeenCalledWith([2])
  })

  it('disables interactions and displays helper messaging', () => {
    const { Field, handleChange, handleBlur } = createFieldContext()

    const { rerender } = render(
      <TaskSkillsField
        Field={Field}
        name="task.skills"
        availableSkills={[]}
        isLoading
        errorMessage={null}
        isDisabled
      />,
    )

    expect(screen.getByText('Loading skills...')).toBeDefined()

    rerender(
      <TaskSkillsField
        Field={Field}
        name="task.skills"
        availableSkills={[]}
        isLoading={false}
        errorMessage="Unable to load skills."
        isDisabled
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load skills.')

    rerender(
      <TaskSkillsField
        Field={Field}
        name="task.skills"
        availableSkills={[]}
        isLoading={false}
        errorMessage={null}
        isDisabled
      />,
    )

    expect(screen.getByText('No skills available right now.')).toBeDefined()

    const pill = screen.queryByRole('button', { name: 'TypeScript' })
    if (pill) {
      expect(pill).toBeDisabled()
      fireEvent.click(pill)
    }

    expect(handleChange).not.toHaveBeenCalled()
    expect(handleBlur).not.toHaveBeenCalled()
  })
})

