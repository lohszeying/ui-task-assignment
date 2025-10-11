import { type ChangeEvent, useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { taskService, type Task } from '../../../services/tasks'

export const useTaskAssigneeManager = (tasks: Task[] | undefined) => {
  const [selectedAssignees, setSelectedAssignees] = useState<Record<string, string>>({})
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!tasks) {
      return
    }

    const mappedAssignees = tasks.reduce<Record<string, string>>((accumulator, task) => {
      accumulator[task.taskId] = task.developer?.developerId ?? ''
      return accumulator
    }, {})

    setSelectedAssignees(mappedAssignees)
  }, [tasks])

  const updateAssigneeMutation = useMutation({
    mutationFn: ({ taskId, developerId }: { taskId: string; developerId: string }) =>
      taskService.updateTaskDeveloper(taskId, developerId),
  })

  const getAssigneeValue = (task: Task) =>
    selectedAssignees[task.taskId] ?? task.developer?.developerId ?? ''

  const handleAssigneeChange = (task: Task) =>
    async (event: ChangeEvent<HTMLSelectElement>) => {
      const nextDeveloperId = event.target.value
      const previousDeveloperId = getAssigneeValue(task)

      if (!nextDeveloperId || nextDeveloperId === previousDeveloperId) {
        // Ignore selections that are the placeholder or unchanged.
        if (!nextDeveloperId) {
          setSelectedAssignees((current) => ({
            ...current,
            [task.taskId]: previousDeveloperId,
          }))
        }
        return
      }

      setError(null)
      setSelectedAssignees((current) => ({
        ...current,
        [task.taskId]: nextDeveloperId,
      }))

      setPendingTaskId(task.taskId)

      try {
        await updateAssigneeMutation.mutateAsync({
          taskId: task.taskId,
          developerId: nextDeveloperId,
        })
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
    isUpdating: updateAssigneeMutation.isPending,
    error,
  }
}
