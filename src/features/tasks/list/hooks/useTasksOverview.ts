import { useEffect } from 'react'
import { toast } from 'react-toastify'
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

  // Handle manager errors with toast notifications
  useEffect(() => {
    const errorMessage = normalizeError(taskStatusManager.error)
    if (errorMessage) {
      toast.error(errorMessage)
    }
  }, [taskStatusManager.error])

  useEffect(() => {
    const errorMessage = normalizeError(taskAssigneeManager.error)
    if (errorMessage) {
      toast.error(errorMessage)
    }
  }, [taskAssigneeManager.error])

  return {
    tasksQuery,
    statusesQuery,
    developersQuery,
    taskStatusManager,
    taskAssigneeManager,
  }
}
