import { useTasksQuery } from '../features/tasks/hooks/useTasksQuery'
import { useStatusesQuery } from '../features/tasks/hooks/useStatusesQuery'
import { useTaskStatusManager } from '../features/tasks/hooks/useTaskStatusManager'
import { useDevelopersQuery } from '../features/tasks/hooks/useDevelopersQuery'
import { useTaskAssigneeManager } from '../features/tasks/hooks/useTaskAssigneeManager'
import { TaskRow } from '../components/TaskRow'
import './Homepage.css'

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
  const hasTasks = tasks.length > 0
  const isLoadingTasks = isTasksLoading

  const normalizeError = (value: unknown) =>
    value instanceof Error ? value.message : typeof value === 'string' ? value : null

  const tasksErrorMessage = normalizeError(tasksError)
  const statusUpdateMessage = normalizeError(statusUpdateError) ?? normalizeError(assigneeUpdateError)
  const totalDevelopers = developers.length

  const renderLoadingState = () => (
    <p className="tasks-panel__message tasks-panel__message--muted">Loading tasks...</p>
  )

  const renderErrorState = () => (
    <div className="tasks-panel__message tasks-panel__message--error" role="alert">
      Unable to load tasks: {tasksErrorMessage ?? 'Unknown error'}
    </div>
  )

  const renderEmptyState = () => (
    <div className="tasks-panel__empty">
      <h2 className="tasks-panel__empty-title">No tasks yet</h2>
      <p className="tasks-panel__empty-body">
        Create your first task to start tracking progress and assignments.
      </p>
    </div>
  )

  const renderStatusMessage = () =>
    statusUpdateMessage ? (
      <div className="tasks-panel__message tasks-panel__message--warning" role="alert">
        {statusUpdateMessage}
      </div>
    ) : null

  const renderTaskList = () => (
    <div className="tasks-list">
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
              pendingTaskId,
              isUpdating,
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
    </div>
  )

  return (
    <section className="homepage">
      <div className="tasks-panel">
        <header className="tasks-panel__header">
          <h1 className="tasks-panel__title">Task List</h1>
        </header>

        <div className="tasks-panel__content">
          {renderStatusMessage()}
          {isLoadingTasks && renderLoadingState()}
          {!isLoadingTasks && tasksErrorMessage && renderErrorState()}
          {!isLoadingTasks && !tasksErrorMessage && !hasTasks && renderEmptyState()}
          {!isLoadingTasks && !tasksErrorMessage && hasTasks && renderTaskList()}
        </div>
      </div>
    </section>
  )
}
