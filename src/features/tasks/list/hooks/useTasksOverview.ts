import { normalizeError } from '../../../../utils/error'
import { useTasksQuery } from './useTasksQuery'
import { useStatusesQuery } from './useStatusesQuery'
import { useDevelopersQuery } from './useDevelopersQuery'
import { useTaskAssigneeManager } from './useTaskAssigneeManager'
import { useTaskStatusManager } from './useTaskStatusManager'

export const useTasksOverview = () => {
  const tasksQuery = useTasksQuery()
  const statusesQuery = useStatusesQuery()
  const developersQuery = useDevelopersQuery()

  const taskStatusManager = useTaskStatusManager(tasksQuery.tasks, statusesQuery.statuses)
  const taskAssigneeManager = useTaskAssigneeManager(tasksQuery.tasks)

  const tasksErrorMessage =
    normalizeError(tasksQuery.error) ?? (tasksQuery.error ? 'Unknown error' : null)
  const statusUpdateErrorMessage = normalizeError(taskStatusManager.error)
  const assigneeUpdateErrorMessage = normalizeError(taskAssigneeManager.error)

  return {
    tasksCollections: {
      data: tasksQuery.tasks,
      isLoading: tasksQuery.isLoading,
      errorMessage: tasksErrorMessage,
    },
    statusesCollections: {
      data: statusesQuery.statuses,
      isLoading: statusesQuery.isLoading,
    },
    developersCollections: {
      data: developersQuery.developers,
      isLoading: developersQuery.isLoading,
    },
    statusManagement: {
      manager: taskStatusManager,
      errorMessage: statusUpdateErrorMessage,
    },
    assigneeManagement: {
      manager: taskAssigneeManager,
      errorMessage: assigneeUpdateErrorMessage,
    },
  }
}
