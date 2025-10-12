import { useForm } from '@tanstack/react-form'
import { TaskFormSection } from '../components/TaskFormSection/TaskFormSection'
import {
  createEmptyTaskFormValues,
  toCreateTaskPayload,
  type CreateTaskFormValues
} from '../features/tasks/utils/taskFormHelpers'
import { useCreateTaskMutation } from '../features/tasks/hooks/useCreateTaskMutation'
import { useSkillsQuery } from '../features/skills/hooks/useSkillsQuery'
import './CreateTaskPage.css'

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

  const form = useForm<CreateTaskFormValues>({
    defaultValues: createEmptyTaskFormValues(),
    onSubmit: async ({ value, formApi }) => {
      createTaskMutation.reset()

      const payload = toCreateTaskPayload(value)

      try {
        await createTaskMutation.mutateAsync(payload)
        formApi.reset(createEmptyTaskFormValues())
      } catch (error) {
        console.error('Failed to create task', error)
      }
    },
  })

  return (
    <section className="create-task-page">
      <div className="create-task-card">
        <header className="create-task-card__header">
          <h1 className="create-task-card__title">Create Task</h1>
          <p className="create-task-card__subtitle">
            Fill out the task details, assign the right skills, and add subtasks if needed.
          </p>
        </header>
        <form
          className="create-task-form"
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
        >
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
            children={([canSubmit, isSubmitting]) => {
              const isBusy = isSubmitting || createTaskMutation.isPending

              return (
                <>
                  <div className="create-task-form__body" aria-busy={isBusy} aria-disabled={isBusy}>
                    <TaskFormSection
                      form={form as any}
                      fieldPath={null}
                      depth={0}
                      availableSkills={availableSkills}
                      isLoadingSkills={isLoadingSkills}
                      skillsErrorMessage={skillsErrorMessage}
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
                    {submissionErrorMessage ? (
                      <p role="alert" className="create-task-status create-task-status--error">
                        {submissionErrorMessage}
                      </p>
                    ) : null}
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
      </div>
    </section>
  )
}
