import { CreateTaskForm } from '../features/tasks/form/components/CreateTaskForm'
import './CreateTaskPage.css'

export const CreateTaskPage = () => {
  return (
    <section className="create-task-page">
      <div className="create-task-card">
        <header className="create-task-card__header">
          <h1 className="create-task-card__title">Create Task</h1>
          <p className="create-task-card__subtitle">
            Fill out the task details, assign the right skills, and add subtasks if needed.
          </p>
        </header>
        <CreateTaskForm />
      </div>
    </section>
  )
}
