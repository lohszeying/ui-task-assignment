import { useMutation } from '@tanstack/react-query'
import { taskService } from '../../../services/tasks.ts'
import type { CreateTaskPayload } from '../../../../types/tasks'

export const useCreateTaskMutation = () =>
  useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
  })
