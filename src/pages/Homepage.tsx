import { TasksPanel } from '../features/tasks/list/components/TasksPanel'
import { useTasksOverview } from '../features/tasks/list/hooks/useTasksOverview'
import './Homepage.css'

export const Homepage = () => {
  const { tasksQuery, statusesQuery, developersQuery, taskStatusManager, taskAssigneeManager } =
    useTasksOverview()

  return (
    <section className="homepage">
      <TasksPanel
        tasksQuery={tasksQuery}
        statusesQuery={statusesQuery}
        developersQuery={developersQuery}
        taskStatusManager={taskStatusManager}
        taskAssigneeManager={taskAssigneeManager}
      />
    </section>
  )
}
