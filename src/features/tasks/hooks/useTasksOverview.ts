import { normalizeError } from '../../../utils/error'
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
    tasks: tasksQuery.tasks,
    statuses: statusesQuery.statuses,
    developers: developersQuery.developers,
    isLoadingTasks: tasksQuery.isLoading,
    isLoadingStatuses: statusesQuery.isLoading,
    isLoadingDevelopers: developersQuery.isLoading,
    tasksErrorMessage,
    statusUpdateErrorMessage,
    assigneeUpdateErrorMessage,
    taskStatusManager,
    taskAssigneeManager,
  }
}
