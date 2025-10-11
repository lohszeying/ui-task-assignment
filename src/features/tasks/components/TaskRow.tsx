import type { ChangeEvent } from 'react'
import { type Task, type Skills } from '../../../services/tasks'
import { type Status } from '../../../services/statuses'
import { type Developer } from '../../../services/developers'

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
  developersLoading: boolean
  getStatusValue: (task: Task) => string
  onStatusChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
  getAssigneeValue: (task: Task) => string
  onAssigneeChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
  assigneePendingTaskId: string | null
  assigneeIsUpdating: boolean
  disableStatus: boolean
}

export const TaskRow = ({
  task,
  statuses,
  developers,
  developersLoading,
  getStatusValue,
  onStatusChange,
  getAssigneeValue,
  onAssigneeChange,
  assigneePendingTaskId,
  assigneeIsUpdating,
  disableStatus,
}: TaskRowProps) => {
  const availableDevelopers = filterDevelopersBySkills(developers, task.skills)
  const currentStatusName = getStatusValue(task)
  const currentAssigneeId = getAssigneeValue(task)
  const isAssigneeUpdatingThisTask = assigneePendingTaskId === task.taskId && assigneeIsUpdating
  const isAssigneeDisabled = developersLoading || isAssigneeUpdatingThisTask

  return (
    <tr>
      <td>
        <div className="fw-semibold">{task.title}</div>
      </td>
      <td>
        <span>{formatSkills(task.skills)}</span>
      </td>
      <td className="text-center">
        <select
          className="form-select form-select-sm w-auto d-inline-block"
          value={currentStatusName}
          onChange={onStatusChange(task)}
          disabled={disableStatus}
        >
          {buildStatusOptions(statuses, currentStatusName)}
        </select>
      </td>
      <td className="text-center">
        <select
          className="form-select form-select-sm w-auto d-inline-block"
          value={currentAssigneeId}
          onChange={onAssigneeChange(task)}
          disabled={isAssigneeDisabled}
        >
          {buildAssigneeOptions(availableDevelopers, task.developer)}
        </select>
      </td>
    </tr>
  )
}
