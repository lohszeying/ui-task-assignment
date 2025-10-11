import { type ChangeEvent, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { taskService, type Task } from '../../../services/tasks'
import type { Status } from '../../../services/statuses'

const extractStatusName = (status?: Status) => status?.statusName ?? ''

export const useTaskStatusManager = (tasks: Task[] | undefined, statuses: Status[]) => {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({})
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tasks) {
      return
    }

    const mappedStatuses = tasks.reduce<Record<string, string>>((accumulator, task) => {
      accumulator[task.taskId] = extractStatusName(task.status)
      return accumulator
    }, {})

    setSelectedStatuses(mappedStatuses)
  }, [tasks])

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
      taskService.updateTaskStatus(taskId, statusId),
  })

  const getStatusValue = (task: Task) =>
    selectedStatuses[task.taskId] ?? extractStatusName(task.status)

  const handleStatusChange = (task: Task) => async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatusName = event.target.value
    const previousStatusName = getStatusValue(task)

    if (nextStatusName === previousStatusName) {
      return
    }

    const selectedStatus = statuses.find(
      (status) => status.statusName === nextStatusName,
    )

    if (!selectedStatus) {
      setSelectedStatuses((current) => ({ ...current, [task.taskId]: previousStatusName }))
      if (nextStatusName !== '') {
        setError('Selected status is not available.')
      }
      return
    }

    setError(null)
    setSelectedStatuses((current) => ({ ...current, [task.taskId]: nextStatusName }))

    setPendingTaskId(task.taskId)

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.taskId,
        statusId: String(selectedStatus.statusId),
      })
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to update task status.'
      setError(message)
      setSelectedStatuses((current) => ({
        ...current,
        [task.taskId]: previousStatusName,
      }))
    } finally {
      setPendingTaskId(null)
    }
  }

  return {
    getStatusValue,
    handleStatusChange,
    pendingTaskId,
    isUpdating: updateStatusMutation.isPending,
    error,
  }
}
