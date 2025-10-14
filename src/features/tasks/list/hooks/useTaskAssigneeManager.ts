import { type ChangeEvent, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { taskService } from '../../../services/tasks.ts'
import type { Task } from '../../../../types/tasks'

export const useTaskAssigneeManager = (tasks: Task[] | undefined) => {
  const [selectedAssignees, setSelectedAssignees] = useState<Record<string, string>>({})
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tasks) {
      return
    }

    const mappedAssignees = tasks.reduce<Record<string, string>>((accumulator, task) => {
      accumulator[task.taskId] = task.developer?.developerId ?? 'unassigned'
      return accumulator
    }, {})

    setSelectedAssignees(mappedAssignees)
  }, [tasks])

  const updateAssigneeMutation = useMutation({
    mutationFn: ({ taskId, developerId }: { taskId: string; developerId: string }) =>
      taskService.updateTaskDeveloper(taskId, developerId),
  })

  const unassignAssigneeMutation = useMutation({
    mutationFn: ({ taskId }: { taskId: string }) => taskService.unassignTaskDeveloper(taskId),
  })

  const getAssigneeValue = (task: Task) =>
    selectedAssignees[task.taskId] ?? task.developer?.developerId ?? 'unassigned'

  const handleAssigneeChange = (task: Task) =>
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextDeveloperId = event.target.value
      const previousDeveloperId = getAssigneeValue(task)

      if (nextDeveloperId === previousDeveloperId) {
        return
      }

      const isUnassign = nextDeveloperId === 'unassigned'

      if (!nextDeveloperId) {
        // placeholder selection, keep previous value in the UI.
        setSelectedAssignees((current) => ({
          ...current,
          [task.taskId]: previousDeveloperId,
        }))
        return
      }

      setError(null)
      setSelectedAssignees((current) => ({
        ...current,
        [task.taskId]: isUnassign ? 'unassigned' : nextDeveloperId,
      }))

      setPendingTaskId(task.taskId)

      try {
        if (isUnassign) {
          await unassignAssigneeMutation.mutateAsync({ taskId: task.taskId })
          setSelectedAssignees((current) => ({
            ...current,
            [task.taskId]: 'unassigned',
          }))
        } else {
          await updateAssigneeMutation.mutateAsync({
            taskId: task.taskId,
            developerId: nextDeveloperId,
          })
        }
      } catch (mutationError) {
        const message =
          mutationError instanceof Error
            ? mutationError.message
            : 'Failed to update assignee.'
        setError(message)
        setSelectedAssignees((current) => ({
          ...current,
          [task.taskId]: previousDeveloperId,
        }))
      } finally {
        setPendingTaskId(null)
      }
    }

  return {
    getAssigneeValue,
    handleAssigneeChange,
    pendingTaskId,
    isUpdating: updateAssigneeMutation.isPending || unassignAssigneeMutation.isPending,
    error,
  }
}
