import type { JSX } from 'react'
import { TaskRow } from './TaskRow'
import { normalizeError } from '../../../../utils/error'
import type { useTaskStatusManager } from '../hooks/useTaskStatusManager'
import type { useTaskAssigneeManager } from '../hooks/useTaskAssigneeManager'
import type { useTasksQuery } from '../hooks/useTasksQuery'
import type { useStatusesQuery } from '../hooks/useStatusesQuery'
import type { useDevelopersQuery } from '../hooks/useDevelopersQuery'

type TaskStatusManager = ReturnType<typeof useTaskStatusManager>
type TaskAssigneeManager = ReturnType<typeof useTaskAssigneeManager>
type TasksQuery = ReturnType<typeof useTasksQuery>
type StatusesQuery = ReturnType<typeof useStatusesQuery>
type DevelopersQuery = ReturnType<typeof useDevelopersQuery>

export type TasksPanelProps = {
  title?: string
  tasksQuery: TasksQuery
  statusesQuery: StatusesQuery
  developersQuery: DevelopersQuery
  taskStatusManager: TaskStatusManager
  taskAssigneeManager: TaskAssigneeManager
}

const LoadingState = () => (
  <p className="tasks-panel__message tasks-panel__message--muted">Loading tasks...</p>
)

const ErrorState = ({ message }: { message: string }) => (
  <div className="tasks-panel__message tasks-panel__message--error" role="alert">
    Unable to load tasks: {message}
  </div>
)

const EmptyState = () => (
  <div className="tasks-panel__empty">
    <h2 className="tasks-panel__empty-title">No tasks yet</h2>
    <p className="tasks-panel__empty-body">
      Create your first task to start tracking progress and assignments.
    </p>
  </div>
)

export const TasksPanel = ({
  title = 'Task List',
  tasksQuery,
  statusesQuery,
  developersQuery,
  taskStatusManager,
  taskAssigneeManager,
}: TasksPanelProps) => {
  const hasTasks = tasksQuery.tasks.length > 0
  const tasksErrorMessage = normalizeError(tasksQuery.error, 'Unknown error')

  const renderTasks = () => (
    <div className="tasks-list">
      {tasksQuery.tasks.map((task) => {
        return (
          <TaskRow
            key={task.taskId}
            task={task}
            statuses={statusesQuery.statuses}
            developers={developersQuery.developers}
            statusControls={{
              valueFor: taskStatusManager.getStatusValue,
              onChange: taskStatusManager.handleStatusChange,
              pendingTaskId: taskStatusManager.pendingTaskId,
              isUpdating: taskStatusManager.isUpdating,
              statusesLoading: statusesQuery.isLoading,
            }}
            assigneeControls={{
              valueFor: taskAssigneeManager.getAssigneeValue,
              onChange: taskAssigneeManager.handleAssigneeChange,
              pendingTaskId: taskAssigneeManager.pendingTaskId,
              isUpdating: taskAssigneeManager.isUpdating,
              developersLoading: developersQuery.isLoading,
            }}
          />
        )
      })}
    </div>
  )

  let content: JSX.Element

  if (tasksQuery.isLoading) {
    content = <LoadingState />
  } else if (tasksErrorMessage) {
    content = <ErrorState message={tasksErrorMessage} />
  } else if (!hasTasks) {
    content = <EmptyState />
  } else {
    content = renderTasks()
  }

  return (
    <div className="tasks-panel">
      <header className="tasks-panel__header">
        <h1 className="tasks-panel__title">{title}</h1>
      </header>
      <div className="tasks-panel__content">{content}</div>
    </div>
  )
}
