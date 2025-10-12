import type { CreateTaskPayload, SubtaskPayload } from '../../../services/tasks'

export interface TaskFormValues {
  title: string
  skills: number[]
  subtasks: TaskFormValues[]
}

export type CreateTaskFormValues = TaskFormValues

export const MAX_SUBTASK_DEPTH = 3

export const createEmptyTaskFormValues = (): TaskFormValues => ({
  title: '',
  skills: [],
  subtasks: [],
})

export const toCreateTaskPayload = (task: TaskFormValues): CreateTaskPayload => ({
  ...toSubtaskPayload(task),
})

const toSubtaskPayload = (task: TaskFormValues): SubtaskPayload => {
  const payload: SubtaskPayload = {
    title: task.title.trim(),
  }

  if (task.skills.length > 0) {
    payload.skills = task.skills
  }

  if (task.subtasks.length > 0) {
    payload.subtasks = task.subtasks.map(toSubtaskPayload)
  }

  return payload
}
