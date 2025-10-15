import { useTasksQuery } from './useTasksQuery'
import { useStatusesQuery } from './useStatusesQuery'
import { useDevelopersQuery } from './useDevelopersQuery'

export const useTasksOverview = () => {
  const tasksQuery = useTasksQuery()
  const statusesQuery = useStatusesQuery()
  const developersQuery = useDevelopersQuery()

  return {
    tasksQuery,
    statusesQuery,
    developersQuery,
  }
}
