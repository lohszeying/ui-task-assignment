import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { TasksPanel } from '../features/tasks/components/TasksPanel'
import { useTasksOverview } from '../features/tasks/hooks/useTasksOverview'
import './Homepage.css'

export const Homepage = () => {
  const {
    tasks,
    statuses,
    developers,
    isLoadingTasks,
    isLoadingStatuses,
    isLoadingDevelopers,
    tasksErrorMessage,
    statusUpdateErrorMessage,
    assigneeUpdateErrorMessage,
    taskStatusManager,
    taskAssigneeManager,
  } = useTasksOverview()

  useEffect(() => {
    if (statusUpdateErrorMessage) {
      toast.error(statusUpdateErrorMessage)
    }
  }, [statusUpdateErrorMessage])

  useEffect(() => {
    if (assigneeUpdateErrorMessage) {
      toast.error(assigneeUpdateErrorMessage)
    }
  }, [assigneeUpdateErrorMessage])

  return (
    <section className="homepage">
      <TasksPanel
        tasks={tasks}
        statuses={statuses}
        developers={developers}
        isLoadingTasks={isLoadingTasks}
        tasksErrorMessage={tasksErrorMessage}
        isLoadingStatuses={isLoadingStatuses}
        isLoadingDevelopers={isLoadingDevelopers}
        taskStatusManager={taskStatusManager}
        taskAssigneeManager={taskAssigneeManager}
      />
    </section>
  )
}
