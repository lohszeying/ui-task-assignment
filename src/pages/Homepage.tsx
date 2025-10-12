import { useTasksQuery } from '../features/tasks/hooks/useTasksQuery'
import { useStatusesQuery } from '../features/tasks/hooks/useStatusesQuery'
import { useTaskStatusManager } from '../features/tasks/hooks/useTaskStatusManager'
import { useDevelopersQuery } from '../features/tasks/hooks/useDevelopersQuery'
import { useTaskAssigneeManager } from '../features/tasks/hooks/useTaskAssigneeManager'
import { TaskRow } from '../components/TaskRow'

export const Homepage = () => {
  const { tasks, isLoading: isTasksLoading, error: tasksError } = useTasksQuery()
  const { statuses, isLoading: isStatusesLoading } = useStatusesQuery()
  const { developers, isLoading: isDevelopersLoading } = useDevelopersQuery()
  const {
    getAssigneeValue,
    handleAssigneeChange,
    pendingTaskId: pendingAssigneeTaskId,
    isUpdating: isAssigneeUpdating,
    error: assigneeUpdateError,
  } = useTaskAssigneeManager(tasks)

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

        {(statusUpdateError || assigneeUpdateError) && (
          <div className="alert alert-warning" role="alert">
            {statusUpdateError || assigneeUpdateError}
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
                  const statusDisabled = !showStatusDropdown || isUpdatingThisTask || isStatusesLoading

                  return (
                    <TaskRow
                      key={task.taskId}
                      task={task}
                      statuses={statuses}
                      developers={developers}
                      statusControls={{
                        valueFor: getStatusValue,
                        onChange: handleStatusChange,
                        disabled: statusDisabled,
                      }}
                      assigneeControls={{
                        valueFor: getAssigneeValue,
                        onChange: handleAssigneeChange,
                        pendingTaskId: pendingAssigneeTaskId,
                        isUpdating: isAssigneeUpdating,
                        developersLoading: isDevelopersLoading,
                      }}
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
