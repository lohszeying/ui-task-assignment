import { type ChangeEvent, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { taskService } from '../../../../services/tasks'
import type { Task, Status } from '../../../../types/tasks'

const extractStatusId = (status?: Status) =>
  typeof status?.statusId === 'number' ? String(status.statusId) : ''

export const useTaskStatusManager = (tasks: Task[] | undefined, statuses: Status[]) => {
  const [selectedStatuses, setSelectedStatuses] = useState<Record<string, string>>({})
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tasks) {
      return
    }

    const mappedStatuses = tasks.reduce<Record<string, string>>((accumulator, task) => {
      accumulator[task.taskId] = extractStatusId(task.status)
      return accumulator
    }, {})

    setSelectedStatuses(mappedStatuses)
  }, [tasks])

  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
      taskService.updateTaskStatus(taskId, statusId),
  })

  const getStatusValue = (task: Task) =>
    selectedStatuses[task.taskId] ?? extractStatusId(task.status)

  const handleStatusChange = (task: Task) => async (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatusId = event.target.value
    const previousStatusId = getStatusValue(task)

    if (nextStatusId === previousStatusId) {
      return
    }

    if (!nextStatusId) {
      setSelectedStatuses((current) => ({ ...current, [task.taskId]: previousStatusId }))
      return
    }

    const selectedStatus = statuses.find(
      (status) => String(status.statusId) === nextStatusId,
    )

    if (!selectedStatus) {
      setSelectedStatuses((current) => ({ ...current, [task.taskId]: previousStatusId }))
      setError('Selected status is not available.')
      return
    }

    setError(null)
    setSelectedStatuses((current) => ({ ...current, [task.taskId]: nextStatusId }))

    setPendingTaskId(task.taskId)

    try {
      await updateStatusMutation.mutateAsync({
        taskId: task.taskId,
        statusId: nextStatusId,
      })
    } catch (mutationError) {
      const message =
        mutationError instanceof Error
          ? mutationError.message
          : 'Failed to update task status.'
      setError(message)
      setSelectedStatuses((current) => ({
        ...current,
        [task.taskId]: previousStatusId,
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
