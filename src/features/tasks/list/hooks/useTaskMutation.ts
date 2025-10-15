import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Task } from '../../../../types/tasks'

type MutationFn<TVariables> = (variables: TVariables) => Promise<unknown>

type OptimisticUpdater<TVariables> = (
  tasks: Task[],
  variables: TVariables,
) => Task[]

type UseTaskMutationOptions<TVariables> = {
  mutationFn: MutationFn<TVariables>
  optimisticUpdate: OptimisticUpdater<TVariables>
  errorMessage: string
}

export const useTaskMutation = <TVariables,>({
  mutationFn,
  optimisticUpdate,
  errorMessage,
}: UseTaskMutationOptions<TVariables>) => {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn,
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old
        return optimisticUpdate(old, variables)
      })

      return { previousTasks }
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      const message = error instanceof Error ? error.message : errorMessage
      toast.error(message)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  return mutation
}
