import { useQuery } from '@tanstack/react-query'
import { taskService, type Skills } from '../services/tasks'
import { statusService, type Status } from '../services/statuses'

const formatSkills = (skills?: Skills[]) => {
  if (!skills || skills.length === 0) return 'N/A'

  return skills.map((skill) => skill.skillName).join(', ')
}

const buildStatusOptions = (statuses: Status[], currentStatusId?: number) => {
  const hasCurrentStatus = currentStatusId
    ? statuses.some((status) => status.statusId === currentStatusId)
    : false

  return (
    <>
      <option value="">Select status</option>
      {!hasCurrentStatus && currentStatusId && (
        <option value={currentStatusId}>{currentStatusId}</option>
      )}
      {statuses.map((status) => (
        <option key={status.statusId} value={status.statusName}>
          {status.statusName}
        </option>
      ))}
    </>
  )
}

export const Homepage = () => {
  const { data: tasks, isPending, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAllTasks(),
  })

  const { data: statuses } = useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusService.getAllStatuses(),
    staleTime: 1000 * 60 * 5,
  })

  const taskList = tasks ?? []
  const statusList = statuses ?? []

  return (
    <section className="card shadow-sm border-0">
      <div className="card-body">
        <h1 className="h4 mb-4">Tasks</h1>

        {isPending && <p className="text-muted mb-0">Loading tasks…</p>}

        {error instanceof Error && (
          <div className="alert alert-danger" role="alert">
            Unable to load tasks: {error.message}
          </div>
        )}

        {!isPending && !error && taskList.length === 0 && (
          <p className="text-muted mb-0">No tasks available yet.</p>
        )}

        {!isPending && !error && taskList.length > 0 && (
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
                {taskList.map((task) => (
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
                        defaultValue={task.status.statusName ?? ''}
                      >
                        {buildStatusOptions(statusList, task.status.statusId)}
                      </select>
                    </td>
                    <td className="text-center">
                      <select
                        className="form-select form-select-sm w-auto d-inline-block"
                        defaultValue={task.developer?.developerId ?? ''}
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
