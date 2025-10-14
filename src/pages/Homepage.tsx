import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { TasksPanel } from '../features/tasks/list/components/TasksPanel'
import { useTasksOverview } from '../features/tasks/list/hooks/useTasksOverview'
import './Homepage.css'

export const Homepage = () => {
  const {tasksCollections, statusesCollections, developersCollections, statusManagement, assigneeManagement} = useTasksOverview()
  
  useEffect(() => {
    if (statusManagement.errorMessage) {
      toast.error(statusManagement.errorMessage)
    }
  }, [statusManagement.errorMessage])

  useEffect(() => {
    if (assigneeManagement.errorMessage) {
      toast.error(assigneeManagement.errorMessage)
    }
  }, [assigneeManagement.errorMessage])

  return (
    <section className="homepage">
      <TasksPanel
        tasksCollections={tasksCollections}
        statusesCollections={statusesCollections}
        developersCollections={developersCollections}
        taskStatusManager={statusManagement.manager}
        taskAssigneeManager={assigneeManagement.manager}
      />
    </section>
  )
}
