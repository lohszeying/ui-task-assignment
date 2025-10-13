import type { JSX } from 'react'
import type { Task, Status, Developer } from '../../../types/tasks'
import { TaskRow } from './TaskRow'
import type { useTaskStatusManager } from '../hooks/useTaskStatusManager'
import type { useTaskAssigneeManager } from '../hooks/useTaskAssigneeManager'

type TaskStatusManager = ReturnType<typeof useTaskStatusManager>
type TaskAssigneeManager = ReturnType<typeof useTaskAssigneeManager>

type TasksCollections = {
  data: Task[];
  isLoading: boolean;
  errorMessage: string | null;
}

type StatusesCollections = {
  data: Status[];
  isLoading: boolean;
}

type DevelopersCollections = {
  data: Developer[];
  isLoading: boolean;
}

export type TasksPanelProps = {
  title?: string
  tasksCollections: TasksCollections
  statusesCollections: StatusesCollections
  developersCollections: DevelopersCollections
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
  tasksCollections,
  statusesCollections,
  developersCollections,
  taskStatusManager,
  taskAssigneeManager,
}: TasksPanelProps) => {
  const hasTasks = tasksCollections.data.length > 0

  const renderTasks = () => (
    <div className="tasks-list">
      {tasksCollections.data.map((task) => {
        return (
          <TaskRow
            key={task.taskId}
            task={task}
            statuses={statusesCollections.data}
            developers={developersCollections.data}
            statusControls={{
              valueFor: taskStatusManager.getStatusValue,
              onChange: taskStatusManager.handleStatusChange,
              pendingTaskId: taskStatusManager.pendingTaskId,
              isUpdating: taskStatusManager.isUpdating,
              statusesLoading: statusesCollections.isLoading,
            }}
            assigneeControls={{
              valueFor: taskAssigneeManager.getAssigneeValue,
              onChange: taskAssigneeManager.handleAssigneeChange,
              pendingTaskId: taskAssigneeManager.pendingTaskId,
              isUpdating: taskAssigneeManager.isUpdating,
              developersLoading: developersCollections.isLoading,
            }}
          />
        )
      })}
    </div>
  )

  let content: JSX.Element

  if (tasksCollections.isLoading) {
    content = <LoadingState />
  } else if (tasksCollections.errorMessage) {
    content = <ErrorState message={tasksCollections.errorMessage} />
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
