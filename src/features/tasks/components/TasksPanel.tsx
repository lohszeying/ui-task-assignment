import type { JSX } from 'react'
import type { Task, Status, Developer } from '../../../types/tasks'
import { TaskRow } from './TaskRow'
import type { useTaskStatusManager } from '../hooks/useTaskStatusManager'
import type { useTaskAssigneeManager } from '../hooks/useTaskAssigneeManager'

type TaskStatusManager = ReturnType<typeof useTaskStatusManager>
type TaskAssigneeManager = ReturnType<typeof useTaskAssigneeManager>

export type TasksPanelProps = {
  title?: string
  tasks: Task[]
  statuses: Status[]
  developers: Developer[]
  isLoadingTasks: boolean
  tasksErrorMessage: string | null
  isLoadingStatuses: boolean
  isLoadingDevelopers: boolean
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
  tasks,
  statuses,
  developers,
  isLoadingTasks,
  tasksErrorMessage,
  isLoadingStatuses,
  isLoadingDevelopers,
  taskStatusManager,
  taskAssigneeManager,
}: TasksPanelProps) => {
  const hasTasks = tasks.length > 0
  const showStatusDropdown = statuses.length > 0

  const renderTasks = () => (
    <div className="tasks-list">
      {tasks.map((task) => {
        const isStatusUpdatingThisTask =
          taskStatusManager.pendingTaskId === task.taskId && taskStatusManager.isUpdating
        const statusDisabled = !showStatusDropdown || isStatusUpdatingThisTask || isLoadingStatuses

        return (
          <TaskRow
            key={task.taskId}
            task={task}
            statuses={statuses}
            developers={developers}
            statusControls={{
              valueFor: taskStatusManager.getStatusValue,
              onChange: taskStatusManager.handleStatusChange,
              disabled: statusDisabled,
              pendingTaskId: taskStatusManager.pendingTaskId,
              isUpdating: taskStatusManager.isUpdating,
            }}
            assigneeControls={{
              valueFor: taskAssigneeManager.getAssigneeValue,
              onChange: taskAssigneeManager.handleAssigneeChange,
              pendingTaskId: taskAssigneeManager.pendingTaskId,
              isUpdating: taskAssigneeManager.isUpdating,
              developersLoading: isLoadingDevelopers,
            }}
          />
        )
      })}
    </div>
  )

  let content: JSX.Element

  if (isLoadingTasks) {
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
