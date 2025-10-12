import { useMutation } from '@tanstack/react-query'
import { taskService, type CreateTaskPayload } from '../../../services/tasks'

export const useCreateTaskMutation = () =>
  useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
  })
