import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Task, Developer } from '../../../../../types/tasks'

const buildDeveloper = (overrides: Partial<Developer> = {}): Developer => ({
  developerId: 'dev-1',
  developerName: 'Developer One',
  ...overrides,
})

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  taskId: 'task-1',
  title: 'Implement feature',
  skills: [],
  developer: buildDeveloper(),
  ...overrides,
})

const updateTaskDeveloperMock = vi.hoisted(() => vi.fn())
const unassignTaskDeveloperMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../services/tasks', () => ({
  taskService: {
    updateTaskDeveloper: (...args: unknown[]) => updateTaskDeveloperMock(...args),
    unassignTaskDeveloper: (...args: unknown[]) => unassignTaskDeveloperMock(...args),
  },
}))

type UseTaskAssigneeManager = typeof import('../useTaskAssigneeManager').useTaskAssigneeManager

let useTaskAssigneeManager: UseTaskAssigneeManager

const renderUseTaskAssigneeManager = (tasks: Task[] | undefined) => {
  const queryClient = new QueryClient()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return renderHook(() => useTaskAssigneeManager(tasks), { wrapper })
}

describe('useTaskAssigneeManager', () => {
  beforeEach(async () => {
    vi.resetModules()
    updateTaskDeveloperMock.mockReset()
    unassignTaskDeveloperMock.mockReset()

    ;({ useTaskAssigneeManager } = await import('../useTaskAssigneeManager'))
  })

  it('initializes assignee selections from provided tasks', () => {
    const tasks = [
      buildTask({ taskId: 'task-1', developer: buildDeveloper({ developerId: 'dev-1' }) }),
      buildTask({ taskId: 'task-2', developer: undefined }),
    ]

    const { result } = renderUseTaskAssigneeManager(tasks)

    expect(result.current.getAssigneeValue(tasks[0])).toBe('dev-1')
    expect(result.current.getAssigneeValue(tasks[1])).toBe('unassigned')
    expect(result.current.pendingTaskId).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('updates assignee via mutation and tracks pending state', async () => {
    const tasks = [buildTask()]
    updateTaskDeveloperMock.mockResolvedValueOnce(undefined)

    const { result } = renderUseTaskAssigneeManager(tasks)

    await act(async () => {
      await result.current.handleAssigneeChange(tasks[0])({
        target: { value: 'dev-99' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(updateTaskDeveloperMock).toHaveBeenCalledWith('task-1', 'dev-99')
    expect(result.current.error).toBeNull()
  })

  it('calls unassign mutation when selecting unassigned and handles errors', async () => {
    const tasks = [buildTask({ developer: buildDeveloper({ developerId: 'dev-10' }) })]
    const error = new Error('Network failure')
    unassignTaskDeveloperMock.mockRejectedValueOnce(error)

    const { result } = renderUseTaskAssigneeManager(tasks)

    await act(async () => {
      await result.current.handleAssigneeChange(tasks[0])({
        target: { value: 'unassigned' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(unassignTaskDeveloperMock).toHaveBeenCalledWith('task-1')
    expect(result.current.error).toBe('Network failure')
    expect(result.current.getAssigneeValue(tasks[0])).toBe('dev-10')
  })
})
