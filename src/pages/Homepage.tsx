import { useQuery } from '@tanstack/react-query'
import { taskService, type Skills } from '../services/tasks'

const formatSkills = (skills: Skills[]) => {
  if (!skills) return 'N/A'

  if (skills.length === 0) return 'N/A'

  return skills.map((skill) => skill.skillName).join(', ')
}

export const Homepage = () => {
  const { data: tasks, isPending, error } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => taskService.getAllTasks(),
  })

  return (
    <section className="card shadow-sm border-0">
      <div className="card-body">
        <h1 className="h4 mb-4">Tasks</h1>

        {isPending && <p className="text-muted mb-0">Loading tasks…</p>}

        {error instanceof Error && (
          <div className="alert alert-danger" role="alert">
            Unable to load tasks: {error.message}
          </div>
        )}

        {!isPending && !error && tasks.length === 0 && (
          <p className="text-muted mb-0">No tasks available yet.</p>
        )}

        {!isPending && !error && tasks.length > 0 && (
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
                {tasks.map((task) => (
                  <tr key={task.taskId}>
                    <td>
                      <div className="fw-semibold">{task.title}</div>
                    </td>
                    <td>
                      <span>{formatSkills(task.skills)}</span>
                    </td>
                    <td className="text-center">
                      <select
                        className="form-select form-select-sm w-auto d-inline-block"
                        defaultValue={task.status ?? ''}
                      >
                        <option value="">Select status</option>
                        <option value="todo">To-do</option>
                        <option value="in_progress">In progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td className="text-center">
                      <select
                        className="form-select form-select-sm w-auto d-inline-block"
                        defaultValue={task.developer?.developerId ?? ''}
                      >
                        <option value="">Select assignee</option>
                        {task.developer?.developerId && (
                          <option value={task.developer.developerId}>
                            {task.developer.developerName}
                          </option>
                        )}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
