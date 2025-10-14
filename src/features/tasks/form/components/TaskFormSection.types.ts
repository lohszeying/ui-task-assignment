import type { Skill } from '../../../../types/tasks'
import type { CreateTaskFormApi } from '../hooks/useCreateTaskForm'

export type TaskFormSectionForm = Pick<CreateTaskFormApi, 'Field' | 'pushFieldValue' | 'deleteField'>

type TaskFieldComponentProps = Parameters<TaskFormSectionForm['Field']>[0]

export type TaskFieldPath = Parameters<TaskFormSectionForm['deleteField']>[0]
export type TaskArrayFieldPath = Parameters<TaskFormSectionForm['pushFieldValue']>[0]

type TaskFieldChildren = TaskFieldComponentProps extends {
  children: (field: infer TField) => unknown
}
  ? TField
  : never

export type TaskFieldApi = Pick<
  TaskFieldChildren,
  'name' | 'state' | 'handleBlur' | 'handleChange'
>

export interface TaskFormSectionProps {
  form: TaskFormSectionForm
  fieldPath: TaskFieldPath | null
  depth: number
  availableSkills: Skill[]
  isLoadingSkills: boolean
  skillsErrorMessage: string | null
  isDisabled: boolean
}
