import { useForm } from '@tanstack/react-form'
import {
  createEmptyTaskFormValues,
  toCreateTaskPayload,
  type CreateTaskFormValues,
} from '../utils/taskFormHelpers'
import { useCreateTaskMutation } from './useCreateTaskMutation'
import { useSkillsQuery } from '../../skills/hooks/useSkillsQuery'
import { normalizeError } from '../../../utils/error'

export const useCreateTaskForm = () => {
  const { skills, isLoading: isLoadingSkills, error: skillsError } = useSkillsQuery()
  const createTaskMutation = useCreateTaskMutation()

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

  const skillsErrorMessage =
    normalizeError(skillsError) ??
    (skillsError ? 'Unable to load skills. Please try again later.' : null)

  const submissionErrorMessage =
    normalizeError(createTaskMutation.error) ??
    (createTaskMutation.error ? 'Failed to create task.' : null)

  return {
    form,
    skillsCollections: {
      data: skills,
      isLoading: isLoadingSkills,
      errorMessage: skillsErrorMessage,
    },
    createTaskMutation,
    submissionErrorMessage,
  }
}
