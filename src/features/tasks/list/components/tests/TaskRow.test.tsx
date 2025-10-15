import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TaskRow } from '../TaskRow'
import type { Task, Status, Developer } from '../../../../../types/tasks'

vi.mock('../TaskRow.css', () => ({}))
vi.mock('react-toastify', () => ({
  toast: { error: vi.fn() },
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

const sampleTask: Task = {
  taskId: 'task-1',
  title: 'Implement authentication',
  skills: [
    { skillId: 1, skillName: 'TypeScript' },
    { skillId: 2, skillName: 'React' },
  ],
  status: { statusId: 1, statusName: 'Open' },
  developer: {
    developerId: 'dev-1',
    developerName: 'Dev One',
    skills: [
      { skillId: 1, skillName: 'TypeScript' },
      { skillId: 2, skillName: 'React' },
    ],
  },
}

const sampleStatuses: Status[] = [
  { statusId: 1, statusName: 'Open' },
  { statusId: 2, statusName: 'In Progress' },
]

const sampleDevelopers: Developer[] = [
  {
    developerId: 'dev-1',
    developerName: 'Dev One',
    skills: [
      { skillId: 1, skillName: 'TypeScript' },
      { skillId: 2, skillName: 'React' },
    ],
  },
  {
    developerId: 'dev-2',
    developerName: 'Dev Two',
    skills: [{ skillId: 3, skillName: 'GraphQL' }],
  },
]

describe('TaskRow', () => {
  it('renders task information and filters developers by skills', () => {
    render(
      <TaskRow
        task={sampleTask}
        statuses={sampleStatuses}
        developers={sampleDevelopers}
        statusesLoading={false}
        developersLoading={false}
      />,
      { wrapper: createWrapper() }
    )

    expect(screen.getByText('Implement authentication')).toBeDefined()
    expect(screen.getByText('Task ID: task-1')).toBeDefined()
    expect(screen.getByText('TypeScript, React')).toBeDefined()

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement
    const assigneeSelect = screen.getByLabelText('Assignee') as HTMLSelectElement

    expect(statusSelect).not.toBeDisabled()
    expect(assigneeSelect).not.toBeDisabled()

    const assigneeOptions = within(assigneeSelect).getAllByRole('option')
    expect(assigneeOptions.map((option) => option.textContent)).toEqual([
      'Unassigned',
      'Dev One',
    ])

    expect(screen.queryByRole('option', { name: 'Dev Two' })).toBeNull()

    const row = screen.getByRole('article')
    expect(row).toHaveAttribute('aria-busy', 'false')
    expect(row.className).not.toContain('task-card--busy')
  })

  it('disables selects when loading', () => {
    render(
      <TaskRow
        task={sampleTask}
        statuses={sampleStatuses}
        developers={sampleDevelopers}
        statusesLoading={true}
        developersLoading={true}
      />,
      { wrapper: createWrapper() }
    )

    const statusSelect = screen.getByLabelText('Status')
    const assigneeSelect = screen.getByLabelText('Assignee')

    expect(statusSelect).toBeDisabled()
    expect(assigneeSelect).toBeDisabled()
  })
})
