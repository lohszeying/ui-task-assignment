import type { ChangeEvent } from 'react'
import { type Task, type Skills } from '../services/tasks'
import { type Status } from '../services/statuses'
import { type Developer } from '../services/developers'
import { useTasksQuery } from '../features/tasks/hooks/useTasksQuery'
import { useStatusesQuery } from '../features/tasks/hooks/useStatusesQuery'
import { useTaskStatusManager } from '../features/tasks/hooks/useTaskStatusManager'
import { useDevelopersQuery } from '../features/tasks/hooks/useDevelopersQuery'

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
      <option value="">Select assignee</option>
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

type TaskRowProps = {
  task: Task
  statuses: Status[]
  developers: Developer[]
  developersLoading: boolean
  getStatusValue: (task: Task) => string
  onStatusChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void
  disableStatus: boolean
}

const TaskRow = ({
  task,
  statuses,
  developers,
  developersLoading,
  getStatusValue,
  onStatusChange,
  disableStatus,
}: TaskRowProps) => {
  const availableDevelopers = filterDevelopersBySkills(developers, task.skills)
  const currentStatusName = getStatusValue(task)
  const currentAssigneeId = task.developer?.developerId ?? ''
  const isAssigneeDisabled = developersLoading

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
          disabled={isAssigneeDisabled}
        >
          {buildAssigneeOptions(availableDevelopers, task.developer)}
        </select>
      </td>
    </tr>
  )
}

export const Homepage = () => {
  const { tasks, isLoading: isTasksLoading, error: tasksError } = useTasksQuery()
  const { statuses, isLoading: isStatusesLoading } = useStatusesQuery()
  const { developers, isLoading: isDevelopersLoading } = useDevelopersQuery()

  const {
    getStatusValue,
    handleStatusChange,
    pendingTaskId,
    isUpdating,
    error: statusUpdateError,
  } = useTaskStatusManager(tasks, statuses)

  const showStatusDropdown = statuses.length > 0

  return (
    <section className="card shadow-sm border-0">
      <div className="card-body">
        <h1 className="h4 mb-4">Tasks</h1>

        {isTasksLoading && <p className="text-muted mb-0">Loading tasks…</p>}

        {tasksError instanceof Error && (
          <div className="alert alert-danger" role="alert">
            Unable to load tasks: {tasksError.message}
          </div>
        )}

        {statusUpdateError && (
          <div className="alert alert-warning" role="alert">
            {statusUpdateError}
          </div>
        )}

        {!isTasksLoading && !tasksError && tasks.length === 0 && (
          <p className="text-muted mb-0">No tasks available yet.</p>
        )}

        {!isTasksLoading && !tasksError && tasks.length > 0 && (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th scope="col" className="w-50">
                    Task Title
                  </th>
                  <th scope="col">Skills</th>
                  <th scope="col" className="text-center" style={{ width: '12rem' }}>
                    Status
                  </th>
                  <th scope="col" className="text-center" style={{ width: '12rem' }}>
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const isUpdatingThisTask = pendingTaskId === task.taskId && isUpdating
                  const disableStatus =
                    !showStatusDropdown || isUpdatingThisTask || isStatusesLoading

                  return (
                    <TaskRow
                      key={task.taskId}
                      task={task}
                      statuses={statuses}
                      developers={developers}
                      developersLoading={isDevelopersLoading}
                      getStatusValue={getStatusValue}
                      onStatusChange={handleStatusChange}
                      disableStatus={disableStatus}
                    />
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
