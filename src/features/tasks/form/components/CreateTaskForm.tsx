import type { FormEvent } from 'react'
import type { Skill } from '../../../../types/tasks'
import { TaskFormSection } from './TaskFormSection'
import type { useCreateTaskForm } from '../hooks/useCreateTaskForm'
import type { TaskFormSectionForm } from './TaskFormSection.types'

type TaskFormApi = ReturnType<typeof useCreateTaskForm>['form']

type SkillsCollections = {
  data: Skill[];
  isLoading: boolean;
  errorMessage: string | null;
}

export type CreateTaskFormProps = {
  form: TaskFormApi
  skillsCollections: SkillsCollections
  isMutationPending: boolean
  isMutationSuccess: boolean
}

export const CreateTaskForm = ({
  form,
  skillsCollections,
  isMutationPending,
  isMutationSuccess,
}: CreateTaskFormProps) => {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    event.stopPropagation()
    form.handleSubmit()
  }

  const sectionFormApi = form as unknown as TaskFormSectionForm

  return (
    <form
      className="create-task-form"
      onSubmit={handleSubmit}
    >
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => {
          const isBusy = isSubmitting || isMutationPending

          return (
            <>
              <div className="create-task-form__body" aria-busy={isBusy} aria-disabled={isBusy}>
                <TaskFormSection
                  form={sectionFormApi}
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
                {isMutationSuccess ? (
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
