import { type JSX } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { SkillPill } from './SkillPill'
import type { Skill } from '../../../types/tasks'
import {
  createEmptyTaskFormValues,
  MAX_SUBTASK_DEPTH,
  type TaskFormValues,
} from '../utils/taskFormHelpers'
import './TaskFormSection.css'

type TaskFieldPath = string
type TaskArrayFieldPath = string

export interface TaskFormSectionProps {
  form: {
    Field: (props: {
      name: TaskFieldPath
      validators?: {
        onChange?: (args: { value: string }) => string | undefined
        onChangeAsyncDebounceMs?: number
        onChangeAsync?: (args: { value: string }) => Promise<string | undefined>
      }
      children: (field: AnyFieldApi) => JSX.Element
    }) => JSX.Element
    pushFieldValue: (field: TaskArrayFieldPath, value: TaskFormValues) => void
    deleteField: (field: TaskFieldPath) => void
  }
  fieldPath: TaskFieldPath | null
  depth: number
  availableSkills: Skill[]
  isLoadingSkills: boolean
  skillsErrorMessage: string | null
  isDisabled: boolean
}

const buildFieldPath = (base: TaskFieldPath | null, key: keyof TaskFormValues): TaskFieldPath => {
  if (!base) return key
  return `${base}.${key}`
}

const buildArrayFieldPath = (base: TaskFieldPath | null): TaskArrayFieldPath =>
  buildFieldPath(base, 'subtasks')

const buildSubtaskBasePath = (arrayPath: TaskArrayFieldPath, index: number): TaskFieldPath =>
  `${arrayPath}.${index}`

const FieldInfo = ({ field }: { field: AnyFieldApi }) => {
  const showError = field.state.meta.isTouched && !field.state.meta.isValid
  const showValidating = field.state.meta.isValidating

  if (!showError && !showValidating) {
    return null
  }

  return (
    <div className="task-field__messages">
      {showError ? (
        <p className="task-field__message task-field__message--error">
          {field.state.meta.errors.join(', ')}
        </p>
      ) : null}
      {showValidating ? (
        <p className="task-field__message task-field__message--hint">Validating...</p>
      ) : null}
    </div>
  )
}

export const TaskFormSection = ({
  form,
  fieldPath,
  depth,
  availableSkills,
  isLoadingSkills,
  skillsErrorMessage,
  isDisabled,
}: TaskFormSectionProps) => {
  const descriptionFieldPath = buildFieldPath(fieldPath, 'title')
  const skillsFieldPath = buildFieldPath(fieldPath, 'skills')
  const subtasksFieldPath = buildArrayFieldPath(fieldPath)

  const sectionClassName =
    'task-form-section ' +
    (depth > 0 ? 'task-form-section--nested' : 'task-form-section--root') +
    (depth > 0 ? ` task-form-section--depth-${Math.min(depth, MAX_SUBTASK_DEPTH)}` : '') +
    (isDisabled ? ' task-form-section--disabled' : '')
  const isDepthLimitReached = depth >= MAX_SUBTASK_DEPTH

  return (
    <div className={sectionClassName}>
      {fieldPath ? (
        <button
          type="button"
          className="task-remove-button"
          aria-label="Remove subtask"
          onClick={() => form.deleteField(fieldPath)}
          disabled={isDisabled}
        >
          ×
        </button>
      ) : null}

      <form.Field
        name={descriptionFieldPath}
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'Task description is required'
              : value.trim().length < 10
                ? 'Describe the task in at least 10 characters'
                : undefined,
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: async ({ value }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return value.includes('error') ? 'No "error" allowed in description' : undefined
          },
        }}
        children={(field) => {
          const inputId = field.name.replace(/\./g, '-')

          return (
            <div className={`task-field${isDisabled ? ' task-field--disabled' : ''}`}>
              <label htmlFor={inputId} className="task-field__label">
                Task description
              </label>
              <textarea
                id={inputId}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                className="task-field__control task-field__control--textarea"
                placeholder="Describe what needs to get done..."
                rows={4}
                disabled={isDisabled}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </div>
          )
        }}
      />

      <form.Field
        name={skillsFieldPath}
        children={(field) => {
          const selectedSkills: number[] = Array.isArray(field.state.value)
            ? field.state.value
            : []
          const groupId = `${field.name.replace(/\./g, '-')}-pill-group`

          const toggleSkill = (skillId: number) => {
            if (isDisabled) return
            const updated = selectedSkills.includes(skillId)
              ? selectedSkills.filter((id) => id !== skillId)
              : [...selectedSkills, skillId]
            field.handleChange(updated)
            field.handleBlur()
          }

          return (
            <div className={`task-field task-field--skills${isDisabled ? ' task-field--disabled' : ''}`}>
              <span className="task-field__label" id={groupId}>
                Skills
              </span>
              <p className="task-field__helper">Select every skill that helps complete this task.</p>

              {isLoadingSkills ? (
                <p className="task-field__message task-field__message--muted">Loading skills...</p>
              ) : null}
              {skillsErrorMessage ? (
                <p role="alert" className="task-field__message task-field__message--error">
                  {skillsErrorMessage}
                </p>
              ) : null}
              {!isLoadingSkills && !skillsErrorMessage && availableSkills.length === 0 ? (
                <p className="task-field__message task-field__message--muted">
                  No skills available right now.
                </p>
              ) : null}

              <div className="skill-pill-list" role="group" aria-labelledby={groupId}>
                {availableSkills.map((skill) => {
                  const isSelected = selectedSkills.includes(skill.skillId)
                  return (
                    <SkillPill
                      key={`${skillsFieldPath}-${skill.skillId}`}
                      label={skill.skillName}
                      isSelected={isSelected}
                      onClick={() => toggleSkill(skill.skillId)}
                      disabled={isDisabled}
                    />
                  )
                })}
              </div>
              <FieldInfo field={field} />
            </div>
          )
        }}
      />

      <form.Field
        name={subtasksFieldPath}
        children={(field) => {
          const subtasks: TaskFormValues[] = Array.isArray(field.state.value)
            ? field.state.value
            : []

          const handleAddSubtask = () => {
            if (isDepthLimitReached || isDisabled) return
            form.pushFieldValue(subtasksFieldPath, createEmptyTaskFormValues())
          }

          return (
            <div className="task-subtasks">
              <div className="task-subtasks__header">
                <p className="task-subtasks__title">Subtasks</p>
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="task-subtasks__add"
                  disabled={isDepthLimitReached || isDisabled}
                >
                  Add subtask
                </button>
              </div>

              {isDepthLimitReached ? (
                <p className="task-field__message task-field__message--muted" role="status">
                  Maximum depth of {MAX_SUBTASK_DEPTH} reached.
                </p>
              ) : null}

              <div className="task-subtasks__list">
                {subtasks.map((_, index) => {
                  const childPath = buildSubtaskBasePath(subtasksFieldPath, index)
                  return (
                    <TaskFormSection
                      key={childPath}
                      form={form}
                      fieldPath={childPath}
                      depth={depth + 1}
                      availableSkills={availableSkills}
                      isLoadingSkills={isLoadingSkills}
                      skillsErrorMessage={skillsErrorMessage}
                      isDisabled={isDisabled}
                    />
                  )
                })}
              </div>
            </div>
          )
        }}
      />
    </div>
  )
}
