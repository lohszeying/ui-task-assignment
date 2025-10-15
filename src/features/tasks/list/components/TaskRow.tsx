import { type ChangeEvent, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import type { Task, Skill, Status, Developer } from '../../../../types/tasks'
import { taskService } from '../../../../services/tasks'
import { TaskSelectControl } from './TaskSelectControl'
import './TaskRow.css'

const formatSkills = (skills?: Skill[]) => {
  if (!skills || skills.length === 0) return 'N/A'

  return skills.map((skill) => skill.skillName).join(', ')
}

const filterDevelopersBySkills = (developers: Developer[], skills?: Skill[]) => {
  if (!skills || skills.length === 0) {
    return developers
  }

  const requiredSkillIds = Array.from(
    new Set(skills.map((skill) => skill.skillId).filter((id): id is number => typeof id === 'number')),
  )

  if (requiredSkillIds.length === 0) {
    return developers
  }

  return developers.filter((developer) => {
    const developerSkillIds = new Set(
      (developer.skills ?? [])
        .map((skill) => skill.skillId)
        .filter((id): id is number => typeof id === 'number'),
    )

    return requiredSkillIds.every((skillId) => developerSkillIds.has(skillId))
  })
}

const toStatusIdString = (status?: Status) =>
  typeof status?.statusId === 'number' ? String(status.statusId) : ''

const buildStatusDropdownOptions = (
  statuses: Status[],
  taskStatus?: Status,
) => {
  const normalizedCurrentStatusId = toStatusIdString(taskStatus)
  const hasCurrentStatus = normalizedCurrentStatusId
    ? statuses.some((status) => String(status.statusId) === normalizedCurrentStatusId)
    : false

  return (
    <>
      <option value="">Select status</option>
      {!hasCurrentStatus && taskStatus && typeof taskStatus.statusId === 'number' && (
        <option value={String(taskStatus.statusId)}>{taskStatus.statusName}</option>
      )}
      {statuses.map((status) => (
        <option key={status.statusId} value={String(status.statusId)}>
          {status.statusName}
        </option>
      ))}
    </>
  )
}

const buildAssigneeDropdownOptions = (developers: Developer[], currentDeveloper?: Developer) => {
  const hasCurrentDeveloper = currentDeveloper
    ? developers.some((developer) => developer.developerId === currentDeveloper.developerId)
    : false

  return (
    <>
      <option value="unassigned">Unassigned</option>
      {!hasCurrentDeveloper && currentDeveloper && (
        <option value={currentDeveloper.developerId}>{currentDeveloper.developerName}</option>
      )}
      {developers.map((developer) => (
        <option key={developer.developerId} value={developer.developerId}>
          {developer.developerName}
        </option>
      ))}
    </>
  )
}

export type TaskRowProps = {
  task: Task
  statuses: Status[]
  developers: Developer[]
  statusesLoading: boolean
  developersLoading: boolean
}

export const TaskRow = ({
  task,
  statuses,
  developers,
  statusesLoading,
  developersLoading,
}: TaskRowProps) => {
  const queryClient = useQueryClient()
  const [pendingOperation, setPendingOperation] = useState<'status' | 'assignee' | null>(null)

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
      taskService.updateTaskStatus(taskId, statusId),
    onMutate: async ({ taskId, statusId }) => {
      setPendingOperation('status')
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old
        return old.map((t) =>
          t.taskId === taskId
            ? { ...t, status: statuses.find((s) => String(s.statusId) === statusId) }
            : t
        )
      })

      return { previousTasks }
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      const message = error instanceof Error ? error.message : 'Failed to update task status.'
      toast.error(message)
    },
    onSettled: () => {
      setPendingOperation(null)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  // Assignee mutation (handles both assign and unassign)
  const updateAssigneeMutation = useMutation({
    mutationFn: ({ taskId, developerId }: { taskId: string; developerId: string | null }) =>
      developerId
        ? taskService.updateTaskDeveloper(taskId, developerId)
        : taskService.unassignTaskDeveloper(taskId),
    onMutate: async ({ taskId, developerId }) => {
      setPendingOperation('assignee')
      await queryClient.cancelQueries({ queryKey: ['tasks'] })

      const previousTasks = queryClient.getQueryData<Task[]>(['tasks'])

      queryClient.setQueryData<Task[]>(['tasks'], (old) => {
        if (!old) return old
        return old.map((t) =>
          t.taskId === taskId
            ? {
                ...t,
                developer: developerId
                  ? developers.find((d) => d.developerId === developerId)
                  : undefined
              }
            : t
        )
      })

      return { previousTasks }
    },
    onError: (error, _variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(['tasks'], context.previousTasks)
      }
      const message = error instanceof Error ? error.message : 'Failed to update assignee.'
      toast.error(message)
    },
    onSettled: () => {
      setPendingOperation(null)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatusId = event.target.value
    const currentStatusId = task.status?.statusId ? String(task.status.statusId) : ''

    if (nextStatusId === currentStatusId || !nextStatusId) return

    const selectedStatus = statuses.find((s) => String(s.statusId) === nextStatusId)
    if (!selectedStatus) {
      toast.error('Selected status is not available.')
      return
    }

    updateStatusMutation.mutate({ taskId: task.taskId, statusId: nextStatusId })
  }

  const handleAssigneeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextDeveloperId = event.target.value
    const currentDeveloperId = task.developer?.developerId ?? 'unassigned'

    if (nextDeveloperId === currentDeveloperId || !nextDeveloperId) return

    updateAssigneeMutation.mutate({
      taskId: task.taskId,
      developerId: nextDeveloperId === 'unassigned' ? null : nextDeveloperId
    })
  }

  const availableDevelopers = filterDevelopersBySkills(developers, task.skills)
  const currentStatusId = task.status?.statusId ? String(task.status.statusId) : ''
  const currentAssigneeId = task.developer?.developerId ?? 'unassigned'
  const isStatusUpdating = pendingOperation === 'status' && updateStatusMutation.isPending
  const isAssigneeUpdating = pendingOperation === 'assignee' && updateAssigneeMutation.isPending
  const isStatusDisabled = statuses.length === 0 || statusesLoading || isStatusUpdating
  const isAssigneeDisabled = developersLoading || isAssigneeUpdating
  const isRowBusy = isStatusUpdating || isAssigneeUpdating

  return (
    <article className={`task-card${isRowBusy ? ' task-card--busy' : ''}`} aria-busy={isRowBusy}>
      <header className="task-card__header">
        <h2 className="task-card__title">{task.title}</h2>
        <p className="task-card__meta">Task ID: {task.taskId}</p>
      </header>

      <div className="task-card__body">
        <div className="task-card__section">
          <span className="task-card__label">Required skills</span>
          <p className="task-card__value">{formatSkills(task.skills)}</p>
        </div>

        <TaskSelectControl
          label="Status"
          id={`status-${task.taskId}`}
          value={currentStatusId}
          onChange={handleStatusChange}
          disabled={isStatusDisabled}
        >
          {buildStatusDropdownOptions(statuses, task.status)}
        </TaskSelectControl>

        <TaskSelectControl
          label="Assignee"
          id={`assignee-${task.taskId}`}
          value={currentAssigneeId}
          onChange={handleAssigneeChange}
          disabled={isAssigneeDisabled}
        >
          {buildAssigneeDropdownOptions(availableDevelopers, task.developer)}
        </TaskSelectControl>
      </div>
    </article>
  )
}
