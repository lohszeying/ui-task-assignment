import type { TaskFieldApi } from './TaskFormSection.types'

export const TaskFieldMessages = ({ field }: { field: TaskFieldApi }) => {
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
