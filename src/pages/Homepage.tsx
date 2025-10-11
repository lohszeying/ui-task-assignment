import type { ChangeEvent } from 'react'
import { type Task, type Skills } from '../services/tasks'
import { type Status } from '../services/statuses'
import { useTasksQuery } from '../features/tasks/hooks/useTasksQuery'
import { useStatusesQuery } from '../features/tasks/hooks/useStatusesQuery'
import { useTaskStatusManager } from '../features/tasks/hooks/useTaskStatusManager'

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

const renderTaskRow = (
  task: Task,
  statusList: Status[],
  getStatusValue: (task: Task) => string,
  handleStatusChange: (task: Task) => (event: ChangeEvent<HTMLSelectElement>) => void,
  isDisabled: boolean,
) => {
  const currentStatusName = getStatusValue(task)

  return (
    <tr key={task.taskId}>
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
          onChange={handleStatusChange(task)}
          disabled={isDisabled}
        >
          {buildStatusOptions(statusList, currentStatusName)}
        </select>
      </td>
      <td className="text-center">
        <select
          className="form-select form-select-sm w-auto d-inline-block"
          defaultValue={task.developer?.developerId ?? ''}
          disabled
        >
          <option value="">Select assignee</option>
          {task.developer?.developerId && (
            <option value={task.developer.developerId}>
              {task.developer.developerName}
            </option>
          )}
        </select>
      </td>
    </tr>
  )
}

export const Homepage = () => {
  const { tasks, isLoading: isTasksLoading, error: tasksError } = useTasksQuery()
  const { statuses, isLoading: isStatusesLoading } = useStatusesQuery()

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
                  const isDisabled = !showStatusDropdown || isUpdatingThisTask || isStatusesLoading

                  return renderTaskRow(
                    task,
                    statuses,
                    getStatusValue,
                    handleStatusChange,
                    isDisabled,
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
