import type { ChangeEvent } from 'react'
import type { Task, Skill, Status, Developer } from '../../../../types/tasks'
import { taskService } from '../../../../services/tasks'
import { useTaskMutation } from '../hooks/useTaskMutation'
import { TaskSelectControl } from './TaskSelectControl'
import './TaskRow.css'

const formatSkills = (skills?: Skill[]) => {
  if (!skills || skills.length === 0) return 'N/A'

  return skills.map((skill) => skill.skillName).join(', ')
}

const filterDevelopersBySkills = (developers: Developer[], skills?: Skill[]) => {
  const requiredSkillIds = new Set(
    skills?.map((skill) => skill.skillId).filter((id): id is number => typeof id === 'number') ?? []
  )

  if (requiredSkillIds.size === 0) return developers

  return developers.filter((developer) => {
    const developerSkillIds = new Set(
      developer.skills?.map((skill) => skill.skillId).filter((id): id is number => typeof id === 'number') ?? []
    )
    return [...requiredSkillIds].every((skillId) => developerSkillIds.has(skillId))
  })
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
  const updateStatusMutation = useTaskMutation({
    mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
      taskService.updateTaskStatus(taskId, statusId),
    optimisticUpdate: (tasks, { taskId, statusId }) =>
      tasks.map((t) =>
        t.taskId === taskId
          ? { ...t, status: statuses.find((s) => String(s.statusId) === statusId) }
          : t
      ),
    errorMessage: 'Failed to update task status.',
  })

  const updateAssigneeMutation = useTaskMutation({
    mutationFn: ({ taskId, developerId }: { taskId: string; developerId: string | null }) =>
      developerId
        ? taskService.updateTaskDeveloper(taskId, developerId)
        : taskService.unassignTaskDeveloper(taskId),
    optimisticUpdate: (tasks, { taskId, developerId }) =>
      tasks.map((t) =>
        t.taskId === taskId
          ? {
              ...t,
              developer: developerId
                ? developers.find((d) => d.developerId === developerId)
                : undefined
            }
          : t
      ),
    errorMessage: 'Failed to update assignee.',
  })

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextStatusId = event.target.value
    const currentStatusId = task.status?.statusId ? String(task.status.statusId) : ''

    if (nextStatusId === currentStatusId || !nextStatusId) return

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
  const isStatusDisabled = statuses.length === 0 || statusesLoading || updateStatusMutation.isPending
  const isAssigneeDisabled = developersLoading || updateAssigneeMutation.isPending
  const isRowBusy = updateStatusMutation.isPending || updateAssigneeMutation.isPending

  const statusInList = statuses.some((s) => String(s.statusId) === currentStatusId)
  const assigneeInList = task.developer
    ? availableDevelopers.some((d) => d.developerId === task.developer?.developerId)
    : true

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
          <option value="">Select status</option>
          {!statusInList && task.status && (
            <option value={currentStatusId}>{task.status.statusName}</option>
          )}
          {statuses.map((status) => (
            <option key={status.statusId} value={String(status.statusId)}>
              {status.statusName}
            </option>
          ))}
        </TaskSelectControl>

        <TaskSelectControl
          label="Assignee"
          id={`assignee-${task.taskId}`}
          value={currentAssigneeId}
          onChange={handleAssigneeChange}
          disabled={isAssigneeDisabled}
        >
          <option value="unassigned">Unassigned</option>
          {!assigneeInList && task.developer && (
            <option value={task.developer.developerId}>{task.developer.developerName}</option>
          )}
          {availableDevelopers.map((developer) => (
            <option key={developer.developerId} value={developer.developerId}>
              {developer.developerName}
            </option>
          ))}
        </TaskSelectControl>
      </div>
    </article>
  )
}
