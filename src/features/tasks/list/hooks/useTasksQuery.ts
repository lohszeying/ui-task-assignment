import { useQuery } from '@tanstack/react-query'
import { taskService } from '../../../../services/tasks'

export const useTasksQuery = () => {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAllTasks(),
  })

  return {
    tasks: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  }
}
