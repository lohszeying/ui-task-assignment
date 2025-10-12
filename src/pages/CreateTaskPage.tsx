import { Fragment } from 'react'
import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import type { DeepKeys, DeepKeysOfType } from '@tanstack/form-core'
import { useSkillsQuery } from '../features/skills/hooks/useSkillsQuery'
import { SkillPill } from '../components/SkillPill'
import { useCreateTaskMutation } from '../features/tasks/hooks/useCreateTaskMutation'
import type { CreateTaskPayload, SubtaskPayload } from '../services/tasks'
import './CreateTaskPage.css'

interface TaskFormValues {
  title: string
  skills: number[]
  subtasks: TaskFormValues[]
}

type CreateTaskFormValues = TaskFormValues
type TaskFieldPath = DeepKeys<CreateTaskFormValues>
type TaskArrayFieldPath = DeepKeysOfType<CreateTaskFormValues, TaskFormValues[]>
const MAX_SUBTASK_DEPTH = 3

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

const createEmptyTaskFormValues = (): TaskFormValues => ({
  title: '',
  skills: [],
  subtasks: [],
})

const toSubtaskPayload = (task: TaskFormValues): SubtaskPayload => {
  const payload: SubtaskPayload = {
    title: task.title.trim(),
  }

  if (task.skills.length > 0) {
    payload.skills = task.skills
  }

  if (task.subtasks.length > 0) {
    payload.subtasks = task.subtasks.map(toSubtaskPayload)
  }

  return payload
}

export const CreateTaskPage = () => {
  const {
    skills: availableSkills,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useSkillsQuery()
  const skillsErrorMessage =
    skillsError instanceof Error
      ? skillsError.message
      : skillsError
        ? 'Unable to load skills. Please try again later.'
        : null

  const createTaskMutation = useCreateTaskMutation()
  const submissionErrorMessage =
    createTaskMutation.error instanceof Error
      ? createTaskMutation.error.message
      : createTaskMutation.error
        ? 'Failed to create task.'
        : null

  const form = useForm({
    defaultValues: createEmptyTaskFormValues(),
    onSubmit: async ({ value, formApi }) => {
      createTaskMutation.reset()

      const payload: CreateTaskPayload = {
        ...toSubtaskPayload(value),
      }

      try {
        await createTaskMutation.mutateAsync(payload)
        formApi.reset(createEmptyTaskFormValues())
      } catch (error) {
        console.error('Failed to create task', error)
      }
    },
  })

  const buildFieldPath = (base: TaskFieldPath | null, key: keyof TaskFormValues): TaskFieldPath => {
    if (!base) return key as TaskFieldPath
    return `${base}.${key}` as TaskFieldPath
  }

  const buildArrayFieldPath = (base: TaskFieldPath | null): TaskArrayFieldPath =>
    buildFieldPath(base, 'subtasks') as TaskArrayFieldPath

  const buildSubtaskBasePath = (arrayPath: TaskArrayFieldPath, index: number): TaskFieldPath =>
    `${arrayPath}.${index}` as TaskFieldPath

  const renderTaskSection = (fieldPath: TaskFieldPath | null, depth: number) => {
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
              return value.includes('error') && 'No "error" allowed in first name'
            },
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
            const isLimitReached = isDepthLimitReached

            const handleAddSubtask = () => {
              if (isLimitReached) {
                return
              }
              form.pushFieldValue(subtasksFieldPath, createEmptyTaskFormValues())
            }

            return (
              <div className="task-subtasks">
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  className="btn btn-outline-primary"
                  disabled={isLimitReached}
                >
                  Add subtask
                </button>
                {isLimitReached ? (
                  <p className="task-subtasks__limit" role="status">
                    Maximum depth of {MAX_SUBTASK_DEPTH} reached.
                  </p>
                ) : null}
                <div className="task-subtask-list">
                  {subtasks.map((_, index) => {
                    const childPath = buildSubtaskBasePath(subtasksFieldPath, index)
                    return (
                      <Fragment key={childPath}>
                        {renderTaskSection(childPath, depth + 1)}
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

  return (
    <section>
      <h1 className="h3 mb-3">Create Task</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        {renderTaskSection(null, 0)}
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <>
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting || createTaskMutation.isPending}
              >
                {isSubmitting || createTaskMutation.isPending ? '...' : 'Submit'}
              </button>
              {submissionErrorMessage ? (
                <p role="alert" className="mt-2 text-danger">
                  {submissionErrorMessage}
                </p>
              ) : null}
              {createTaskMutation.isSuccess ? (
                <p role="status" className="mt-2 text-success">
                  Task created successfully.
                </p>
              ) : null}
            </>
          )}
        />
      </form>
    </section>
  )
}
