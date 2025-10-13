import { useEffect } from 'react'
import { toast } from 'react-toastify'
import { CreateTaskForm } from '../features/tasks/components/CreateTaskForm'
import { useCreateTaskForm } from '../features/tasks/hooks/useCreateTaskForm'
import './CreateTaskPage.css'

export const CreateTaskPage = () => {
  const {
    form,
    skillsCollections,
    createTaskMutation,
    submissionErrorMessage,
  } = useCreateTaskForm()

  useEffect(() => {
    if (submissionErrorMessage) {
      toast.error(submissionErrorMessage)
    }
  }, [submissionErrorMessage])

  return (
    <section className="create-task-page">
      <div className="create-task-card">
        <header className="create-task-card__header">
          <h1 className="create-task-card__title">Create Task</h1>
          <p className="create-task-card__subtitle">
            Fill out the task details, assign the right skills, and add subtasks if needed.
          </p>
        </header>
        <CreateTaskForm
          form={form}
          skillsCollections={skillsCollections}
          isMutationPending={createTaskMutation.isPending}
          isMutationSuccess={createTaskMutation.isSuccess}
        />
      </div>
    </section>
  )
}
