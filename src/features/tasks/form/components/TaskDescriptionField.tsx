import type { TaskFieldPath, TaskFormSectionForm } from './TaskFormSection.types'
import { TaskFieldMessages } from './TaskFieldMessages'

const descriptionValidators = {
  onChange: ({ value }: { value: string }) =>
    !value
      ? 'Task description is required' : '',
  onChangeAsyncDebounceMs: 500,
}

type TaskDescriptionFieldProps = {
  Field: TaskFormSectionForm['Field']
  name: TaskFieldPath
  isDisabled: boolean
}

export const TaskDescriptionField = ({ Field, name, isDisabled }: TaskDescriptionFieldProps) => (
  <Field
    name={name}
    validators={descriptionValidators}
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
            onChange={(event) => field.handleChange(event.target.value)}
          />
          <TaskFieldMessages field={field} />
        </div>
      )
    }}
  />
)
