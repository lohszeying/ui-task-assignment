import type { ChangeEvent } from 'react'
import { type Task, type Skills } from '../services/tasks'
import { type Status } from '../services/statuses'
import { type Developer } from '../services/developers'
import './TaskRow.css'

const formatSkills = (skills?: Skills[]) => {
  if (!skills || skills.length === 0) return 'N/A'

  return skills.map((skill) => skill.skillName).join(', ')
}

const buildStatusOptions = (statuses: Status[], currentStatusName: string) => {
  const hasCurrentStatus = currentStatusName
    ? statuses.some((status) => status.statusName === currentStatusName)
    : false

  return (
    <>
      <option value="">Select status</option>
      {!hasCurrentStatus && currentStatusName && (
        <option value={currentStatusName}>{currentStatusName}</option>
      )}
      {statuses.map((status) => (
        <option key={status.statusId} value={status.statusName}>
          {status.statusName}
        </option>
      ))}
    </>
  )
}

const filterDevelopersBySkills = (developers: Developer[], skills?: Skills[]) => {
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

const buildAssigneeOptions = (developers: Developer[], currentDeveloper?: Developer) => {
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
  statusControls: {
    valueFor: (task: Task) => string
    onChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
    disabled: boolean
    pendingTaskId: string | null
    isUpdating: boolean
  }
  assigneeControls: {
    valueFor: (task: Task) => string
    onChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
    pendingTaskId: string | null
    isUpdating: boolean
    developersLoading: boolean
  }
}

export const TaskRow = ({
  task,
  statuses,
  developers,
  statusControls,
  assigneeControls,
}: TaskRowProps) => {
  const availableDevelopers = filterDevelopersBySkills(developers, task.skills)
  const currentStatusName = statusControls.valueFor(task)
  const currentAssigneeId = assigneeControls.valueFor(task)
  const isStatusUpdatingThisTask =
    statusControls.pendingTaskId === task.taskId && statusControls.isUpdating
  const isAssigneeUpdatingThisTask =
    assigneeControls.pendingTaskId === task.taskId && assigneeControls.isUpdating
  const isAssigneeDisabled = assigneeControls.developersLoading || isAssigneeUpdatingThisTask
  const isRowBusy = isStatusUpdatingThisTask || isAssigneeUpdatingThisTask

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

        <div className="task-card__section task-card__section--control">
          <label className="task-card__label" htmlFor={`status-${task.taskId}`}>
            Status
          </label>
          <select
            id={`status-${task.taskId}`}
            className="task-card__select"
            value={currentStatusName}
            onChange={statusControls.onChange(task)}
            disabled={statusControls.disabled}
          >
            {buildStatusOptions(statuses, currentStatusName)}
          </select>
        </div>

        <div className="task-card__section task-card__section--control">
          <label className="task-card__label" htmlFor={`assignee-${task.taskId}`}>
            Assignee
          </label>
          <select
            id={`assignee-${task.taskId}`}
            className="task-card__select task-card__select--wide"
            value={currentAssigneeId}
            onChange={assigneeControls.onChange(task)}
            disabled={isAssigneeDisabled}
          >
            {buildAssigneeOptions(availableDevelopers, task.developer)}
          </select>
        </div>
      </div>
    </article>
  )
}
