import type { ChangeEvent } from 'react'
import type { Task, Skill, Status, Developer } from '../../../../types/tasks'
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
  statusControls: {
    valueFor: (task: Task) => string
    onChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
    pendingTaskId: string | null
    isUpdating: boolean
    statusesLoading: boolean
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
  const currentStatusId = statusControls.valueFor(task)
  const currentAssigneeId = assigneeControls.valueFor(task)
  const isStatusUpdatingThisTask =
    statusControls.pendingTaskId === task.taskId && statusControls.isUpdating
  const isAssigneeUpdatingThisTask =
    assigneeControls.pendingTaskId === task.taskId && assigneeControls.isUpdating
  const isStatusDisabled =
    statuses.length === 0 || statusControls.statusesLoading || isStatusUpdatingThisTask
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

        <TaskSelectControl
          label="Status"
          id={`status-${task.taskId}`}
          value={currentStatusId}
          onChange={statusControls.onChange(task)}
          disabled={isStatusDisabled}
        >
          {buildStatusDropdownOptions(statuses, task.status)}
        </TaskSelectControl>
        
        <TaskSelectControl
          label="Assignee"
          id={`assignee-${task.taskId}`}
          value={currentAssigneeId}
          onChange={assigneeControls.onChange(task)}
          disabled={isAssigneeDisabled}
          selectClassName="task-card__select--wide"
        >
          {buildAssigneeDropdownOptions(availableDevelopers, task.developer)}
        </TaskSelectControl>
      </div>
    </article>
  )
}
