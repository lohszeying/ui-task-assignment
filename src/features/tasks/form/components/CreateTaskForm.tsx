import { type FormEvent } from 'react'
import { TaskFormSection } from './TaskFormSection'
import { useCreateTaskForm } from '../hooks/useCreateTaskForm'

export const CreateTaskForm = () => {
  const {
    form,
    skillsCollections,
    createTaskMutation,
  } = useCreateTaskForm()

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  return (
    <form
      className="create-task-form"
      onSubmit={handleSubmit}
    >
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => {
          const isBusy = isSubmitting || createTaskMutation.isPending

          return (
            <>
              <div className="create-task-form__body" aria-busy={isBusy} aria-disabled={isBusy}>
                <TaskFormSection
                  form={form}
                  fieldPath={null}
                  depth={0}
                  availableSkills={skillsCollections.data}
                  isLoadingSkills={skillsCollections.isLoading}
                  skillsErrorMessage={skillsCollections.errorMessage}
                  isDisabled={isBusy}
                />
              </div>
              <div className="create-task-form__footer">
                <button
                  type="submit"
                  className="create-task-submit"
                  disabled={!canSubmit || isBusy}
                >
                  {isBusy ? 'Submitting...' : 'Create task'}
                </button>
                {createTaskMutation.isSuccess ? (
                  <p role="status" className="create-task-status create-task-status--success">
                    Task created successfully.
                  </p>
                ) : null}
              </div>
            </>
          )
        }}
      />
    </form>
  )
}
