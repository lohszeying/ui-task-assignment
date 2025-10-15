import { useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { taskService } from '../../../../services/tasks'
import type { CreateTaskPayload } from '../../../../types/tasks'

export const useCreateTaskMutation = () =>
  useMutation({
    mutationFn: (payload: CreateTaskPayload) => taskService.createTask(payload),
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Failed to create task.'
      toast.error(message)
    },
  })
