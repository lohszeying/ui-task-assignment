import type { TaskFieldPath, TaskFormSectionProps } from './TaskFormSection.types'
import { TaskDescriptionField } from './TaskDescriptionField'
import { TaskSkillsField } from './TaskSkillsField'
import { TaskSubtasksField } from './TaskSubtasksField'
import { MAX_SUBTASK_DEPTH, type TaskFormValues } from '../utils/taskFormHelpers'
import './TaskFormSection.css'

const buildFieldPath = (base: TaskFieldPath | null, key: keyof TaskFormValues): TaskFieldPath =>
  base ? `${base}.${key}` : key

const getDescriptionFieldPath = (base: TaskFieldPath | null) =>
  buildFieldPath(base, 'title')

const getSkillsFieldPath = (base: TaskFieldPath | null) =>
  buildFieldPath(base, 'skills')

const getSubtasksFieldPath = (base: TaskFieldPath | null) =>
  buildFieldPath(base, 'subtasks')

export const TaskFormSection = ({
  form,
  fieldPath,
  depth,
  availableSkills,
  isLoadingSkills,
  skillsErrorMessage,
  isDisabled,
}: TaskFormSectionProps) => {
  const { Field, deleteField } = form
  const descriptionFieldPath = getDescriptionFieldPath(fieldPath)
  const skillsFieldPath = getSkillsFieldPath(fieldPath)
  const subtasksFieldPath = getSubtasksFieldPath(fieldPath)

  const sectionClassName =
    'task-form-section ' +
    (depth > 0 ? 'task-form-section--nested' : 'task-form-section--root') +
    (depth > 0 ? ` task-form-section--depth-${Math.min(depth, MAX_SUBTASK_DEPTH)}` : '') +
    (isDisabled ? ' task-form-section--disabled' : '')

  return (
    <div className={sectionClassName}>
      {fieldPath ? (
        <button
          type="button"
          className="task-remove-button"
          aria-label="Remove subtask"
          onClick={() => deleteField(fieldPath)}
          disabled={isDisabled}
        >
          ×
        </button>
      ) : null}

      <TaskDescriptionField Field={Field} name={descriptionFieldPath} isDisabled={isDisabled} />

      <TaskSkillsField
        Field={Field}
        name={skillsFieldPath}
        availableSkills={availableSkills}
        isLoading={isLoadingSkills}
        errorMessage={skillsErrorMessage}
        isDisabled={isDisabled}
      />

      <TaskSubtasksField
        form={form}
        name={subtasksFieldPath}
        depth={depth}
        isDisabled={isDisabled}
        renderSubsection={({ fieldPath: childFieldPath, depth: childDepth, index }) => (
          <TaskFormSection
            key={`${childFieldPath}-${index}`}
            form={form}
            fieldPath={childFieldPath}
            depth={childDepth}
            availableSkills={availableSkills}
            isLoadingSkills={isLoadingSkills}
            skillsErrorMessage={skillsErrorMessage}
            isDisabled={isDisabled}
          />
        )}
      />
    </div>
  )
}
