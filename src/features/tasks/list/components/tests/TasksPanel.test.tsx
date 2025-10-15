import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import type { Task, Status, Developer } from '../../../../../types/tasks'

vi.mock('../TaskRow', () => ({
  TaskRow: vi.fn(({ task }: { task: Task }) => (
    <div data-testid={`task-row-${task.taskId}`} />
  )),
}))

import { TaskRow } from '../TaskRow'
import { TasksPanel } from '../TasksPanel'

const TaskRowMock = TaskRow as ReturnType<typeof vi.fn>

describe('TasksPanel', () => {
  beforeEach(() => {
    TaskRowMock.mockClear()
  })

  it('shows a loading indicator while tasks are loading', () => {
    render(
      <TasksPanel
        tasksQuery={{ tasks: [], isLoading: true, error: null }}
        statusesQuery={{ statuses: [], isLoading: false, error: null }}
        developersQuery={{ developers: [], isLoading: false, error: null }}
      />,
    )

    expect(screen.getByText('Loading tasks...')).toBeDefined()
    expect(TaskRowMock).not.toHaveBeenCalled()
  })

  it('presents an error message when loading fails', () => {
    render(
      <TasksPanel
        tasksQuery={{ tasks: [], isLoading: false, error: new Error('Network error') }}
        statusesQuery={{ statuses: [], isLoading: false, error: null }}
        developersQuery={{ developers: [], isLoading: false, error: null }}
      />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent('Unable to load tasks: Network error')
    expect(TaskRowMock).not.toHaveBeenCalled()
  })

  it('renders the empty state when there are no tasks', () => {
    render(
      <TasksPanel
        tasksQuery={{ tasks: [], isLoading: false, error: null }}
        statusesQuery={{ statuses: [], isLoading: false, error: null }}
        developersQuery={{ developers: [], isLoading: false, error: null }}
      />,
    )

    expect(screen.getByText('No tasks yet')).toBeDefined()
    expect(screen.getByText('Create your first task to start tracking progress and assignments.')).toBeDefined()
    expect(TaskRowMock).not.toHaveBeenCalled()
  })

  it('renders each task with the expected props when data is available', () => {
    const tasks: Task[] = [
      {
        taskId: 'task-1',
        title: 'Implement authentication',
        skills: [],
        status: undefined,
        developer: undefined,
      },
      {
        taskId: 'task-2',
        title: 'Set up CI pipeline',
        skills: [],
        status: undefined,
        developer: undefined,
      },
    ]

    const statuses: Status[] = [
      { statusId: 1, statusName: 'Open' },
      { statusId: 2, statusName: 'In Progress' },
    ]

    const developers: Developer[] = [
      { developerId: 'dev-1', developerName: 'Dev One' },
      { developerId: 'dev-2', developerName: 'Dev Two' },
    ]

    render(
      <TasksPanel
        title="Engineering Tasks"
        tasksQuery={{ tasks, isLoading: false, error: null }}
        statusesQuery={{ statuses, isLoading: false, error: null }}
        developersQuery={{ developers, isLoading: false, error: null }}
      />,
    )

    expect(screen.getByText('Engineering Tasks')).toBeDefined()
    expect(TaskRowMock).toHaveBeenCalledTimes(tasks.length)

    tasks.forEach((task, index) => {
      const props = TaskRowMock.mock.calls[index][0]

      expect(props.task).toBe(task)
      expect(props.statuses).toBe(statuses)
      expect(props.developers).toBe(developers)
      expect(props.statusesLoading).toBe(false)
      expect(props.developersLoading).toBe(false)
    })

    expect(screen.getAllByTestId(/task-row-/)).toHaveLength(tasks.length)
  })
})
