import type { JSX } from 'react'
import type {
  TaskArrayFieldPath,
  TaskFieldPath,
  TaskFormSectionForm,
} from './TaskFormSection.types'
import {
  createEmptyTaskFormValues,
  MAX_SUBTASK_DEPTH,
  type TaskFormValues,
} from '../utils/taskFormHelpers'

type TaskSubtasksFieldProps = {
  form: TaskFormSectionForm
  name: TaskArrayFieldPath
  depth: number
  isDisabled: boolean
  renderSubsection: (args: { fieldPath: TaskFieldPath; depth: number; index: number }) => JSX.Element
}

const buildSubtaskBasePath = (arrayPath: TaskArrayFieldPath, index: number): TaskFieldPath =>
  `${arrayPath}.${index}`

export const TaskSubtasksField = ({
  form,
  name,
  depth,
  isDisabled,
  renderSubsection,
}: TaskSubtasksFieldProps) => {
  const { Field, pushFieldValue } = form
  const isDepthLimitReached = depth >= MAX_SUBTASK_DEPTH

  return (
    <Field
      name={name}
      children={(field) => {
        const subtasks: TaskFormValues[] = Array.isArray(field.state.value)
          ? field.state.value
          : []

        const handleAddSubtask = () => {
          if (isDepthLimitReached || isDisabled) return
          pushFieldValue(name, createEmptyTaskFormValues())
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
                const childPath = buildSubtaskBasePath(name, index)
                return renderSubsection({ fieldPath: childPath, depth: depth + 1, index })
              })}
            </div>
          </div>
        )
      }}
    />
  )
}
