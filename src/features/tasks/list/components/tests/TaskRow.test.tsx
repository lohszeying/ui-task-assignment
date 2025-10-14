import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { TaskRow } from '../TaskRow'
import type { Task, Status, Developer } from '../../../../../types/tasks'

vi.mock('../TaskRow.css', () => ({}))

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
  it('renders task information, filters developers, and wires select handlers', () => {
    const statusChangeHandler = vi.fn()
    const assigneeChangeHandler = vi.fn()

    const statusControls = {
      valueFor: vi.fn(() => '1'),
      onChange: vi.fn(() => statusChangeHandler),
      pendingTaskId: null,
      isUpdating: false,
      statusesLoading: false,
    }

    const assigneeControls = {
      valueFor: vi.fn(() => 'dev-1'),
      onChange: vi.fn(() => assigneeChangeHandler),
      pendingTaskId: null,
      isUpdating: false,
      developersLoading: false,
    }

    render(
      <TaskRow
        task={sampleTask}
        statuses={sampleStatuses}
        developers={sampleDevelopers}
        statusControls={statusControls}
        assigneeControls={assigneeControls}
      />,
    )

    expect(screen.getByText('Implement authentication')).toBeDefined()
    expect(screen.getByText('Task ID: task-1')).toBeDefined()
    expect(screen.getByText('TypeScript, React')).toBeDefined()

    const statusSelect = screen.getByLabelText('Status') as HTMLSelectElement
    const assigneeSelect = screen.getByLabelText('Assignee') as HTMLSelectElement

    expect(statusControls.onChange).toHaveBeenCalledWith(sampleTask)
    expect(assigneeControls.onChange).toHaveBeenCalledWith(sampleTask)

    fireEvent.change(statusSelect, { target: { value: '2' } })
    fireEvent.change(assigneeSelect, { target: { value: 'dev-1' } })

    expect(statusChangeHandler).toHaveBeenCalledTimes(1)
    expect(assigneeChangeHandler).toHaveBeenCalledTimes(1)
    expect(statusChangeHandler.mock.calls[0][0]).toHaveProperty('target')
    expect(assigneeChangeHandler.mock.calls[0][0]).toHaveProperty('target')

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

  it('marks the row busy and disables selects when updates are pending', () => {
    const statusControls = {
      valueFor: vi.fn(() => '1'),
      onChange: vi.fn(() => vi.fn()),
      pendingTaskId: sampleTask.taskId,
      isUpdating: true,
      statusesLoading: false,
    }

    const assigneeControls = {
      valueFor: vi.fn(() => 'dev-1'),
      onChange: vi.fn(() => vi.fn()),
      pendingTaskId: sampleTask.taskId,
      isUpdating: true,
      developersLoading: false,
    }

    render(
      <TaskRow
        task={sampleTask}
        statuses={sampleStatuses}
        developers={sampleDevelopers}
        statusControls={statusControls}
        assigneeControls={assigneeControls}
      />,
    )

    const statusSelect = screen.getByLabelText('Status')
    const assigneeSelect = screen.getByLabelText('Assignee')

    expect(statusSelect).toBeDisabled()
    expect(assigneeSelect).toBeDisabled()

    const row = screen.getByRole('article')
    expect(row).toHaveAttribute('aria-busy', 'true')
    expect(row.className).toContain('task-card--busy')
  })
})
