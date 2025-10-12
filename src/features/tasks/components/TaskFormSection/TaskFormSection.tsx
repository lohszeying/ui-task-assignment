import { Fragment, type JSX } from 'react'
import type { AnyFieldApi } from '@tanstack/react-form'
import { SkillPill } from '../../../../components/SkillPill'
import type { Skill } from '../../../../services/skills'
import { createEmptyTaskFormValues, MAX_SUBTASK_DEPTH, type TaskFormValues } from '../../utils/taskFormHelpers'
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
}

const buildFieldPath = (base: TaskFieldPath | null, key: keyof TaskFormValues): TaskFieldPath => {
  if (!base) return key
  return `${base}.${key}`
}

const buildArrayFieldPath = (base: TaskFieldPath | null): TaskArrayFieldPath =>
  buildFieldPath(base, 'subtasks')

const buildSubtaskBasePath = (arrayPath: TaskArrayFieldPath, index: number): TaskFieldPath =>
  `${arrayPath}.${index}`

const FieldInfo = ({ field }: { field: AnyFieldApi }) => (
  <>
    {field.state.meta.isTouched && !field.state.meta.isValid ? (
      <em>{field.state.meta.errors.join(', ')}</em>
    ) : null}
    {field.state.meta.isValidating ? 'Validating...' : null}
  </>
)

export const TaskFormSection = ({
  form,
  fieldPath,
  depth,
  availableSkills,
  isLoadingSkills,
  skillsErrorMessage
}: TaskFormSectionProps) => {
  const titleFieldPath = buildFieldPath(fieldPath, 'title')
  const skillsFieldPath = buildFieldPath(fieldPath, 'skills')
  const subtasksFieldPath = buildArrayFieldPath(fieldPath)

  const sectionStyle = depth > 0 ? { marginLeft: depth * 20 } : undefined

  return (
    <div className="task-form-section" style={sectionStyle}>
      {fieldPath ? (
        <button
          type="button"
          className="task-remove-button"
          aria-label="Remove subtask"
          onClick={() => form.deleteField(fieldPath)}
        >
          ×
        </button>
      ) : null}

      <form.Field
        name={titleFieldPath}
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'Task title is required'
              : value.trim().length < 1
                ? 'Must include at least 1 character'
                : undefined,
          onChangeAsyncDebounceMs: 500,
          onChangeAsync: async ({ value }) => {
            await new Promise((resolve) => setTimeout(resolve, 1000))
            return value.includes('error') ? 'No "error" allowed in first name' : undefined
          }
        }}
        children={(field) => {
          const inputId = field.name.replace(/\./g, '-')

          return (
            <>
              <label htmlFor={inputId}>Task title: </label>
              <input
                id={inputId}
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              <FieldInfo field={field} />
            </>
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
            const updated = selectedSkills.includes(skillId)
              ? selectedSkills.filter((id) => id !== skillId)
              : [...selectedSkills, skillId]
            field.handleChange(updated)
          }

          return (
            <>
              <span id={groupId}>Skills:</span>
              {isLoadingSkills ? <p>Loading skills...</p> : null}
              {skillsErrorMessage ? <p role="alert">{skillsErrorMessage}</p> : null}
              {!isLoadingSkills && !skillsErrorMessage && availableSkills.length === 0 ? (
                <p>No skills available.</p>
              ) : null}
              <div className="skill-pill-list" role="group" aria-labelledby={groupId}>
                {availableSkills.map((skill) => (
                  <SkillPill
                    key={`${skillsFieldPath}-${skill.skillId}`}
                    label={skill.skillName}
                    isSelected={selectedSkills.includes(skill.skillId)}
                    onClick={() => toggleSkill(skill.skillId)}
                    onBlur={field.handleBlur}
                  />
                ))}
              </div>
              <FieldInfo field={field} />
            </>
          )
        }}
      />

      <form.Field
        name={subtasksFieldPath}
        children={(field) => {
          const subtasks: TaskFormValues[] = Array.isArray(field.state.value)
            ? field.state.value
            : []
          const isDepthLimitReached = depth >= MAX_SUBTASK_DEPTH

          const handleAddSubtask = () => {
            if (isDepthLimitReached) return
            form.pushFieldValue(subtasksFieldPath, createEmptyTaskFormValues())
          }

          return (
            <div className="task-subtasks">
              <button
                type="button"
                onClick={handleAddSubtask}
                className="btn btn-outline-primary"
                disabled={isDepthLimitReached}
              >
                Add subtask
              </button>
              {isDepthLimitReached ? (
                <p className="task-subtasks__limit" role="status">
                  Maximum depth of {MAX_SUBTASK_DEPTH} reached.
                </p>
              ) : null}
                <div className="task-subtask-list">
                  {subtasks.map((_, index) => {
                    const childPath = buildSubtaskBasePath(subtasksFieldPath, index)
                    return (
                      <Fragment key={childPath}>
                        <TaskFormSection
                          form={form}
                          fieldPath={childPath}
                          depth={depth + 1}
                          availableSkills={availableSkills}
                          isLoadingSkills={isLoadingSkills}
                          skillsErrorMessage={skillsErrorMessage}
                      />
                    </Fragment>
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
