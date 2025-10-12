import { useForm } from '@tanstack/react-form'
import { TaskFormSection } from '../features/tasks/components/TaskFormSection/TaskFormSection'
import {
  createEmptyTaskFormValues,
  toCreateTaskPayload,
  type CreateTaskFormValues
} from '../features/tasks/utils/taskFormHelpers'
import { useCreateTaskMutation } from '../features/tasks/hooks/useCreateTaskMutation'
import { useSkillsQuery } from '../features/skills/hooks/useSkillsQuery'

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
    <section>
      <h1 className="h3 mb-3">Create Task</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <TaskFormSection
          form={form as any}
          fieldPath={null}
          depth={0}
          availableSkills={availableSkills}
          isLoadingSkills={isLoadingSkills}
          skillsErrorMessage={skillsErrorMessage}
        />
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
