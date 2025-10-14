import type { ReactNode } from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { Task, Status } from '../../../../../types/tasks'

const buildStatus = (overrides: Partial<Status> = {}): Status => ({
  statusId: 1,
  statusName: 'Open',
  ...overrides,
})

const buildTask = (overrides: Partial<Task> = {}): Task => ({
  taskId: 'task-1',
  title: 'Implement feature',
  skills: [],
  status: buildStatus(),
  ...overrides,
})

const updateTaskStatusMock = vi.hoisted(() => vi.fn())

vi.mock('../../../../services/tasks', () => ({
  taskService: {
    updateTaskStatus: (...args: unknown[]) => updateTaskStatusMock(...args),
  },
}))

type UseTaskStatusManager = typeof import('../useTaskStatusManager').useTaskStatusManager

let useTaskStatusManager: UseTaskStatusManager

const renderUseTaskStatusManager = (
  tasks: Task[] | undefined,
  statuses: Status[],
) => {
  const queryClient = new QueryClient()

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  return renderHook(() => useTaskStatusManager(tasks, statuses), { wrapper })
}

describe('useTaskStatusManager', () => {
  beforeEach(async () => {
    vi.resetModules()
    updateTaskStatusMock.mockReset()

    ;({ useTaskStatusManager } = await import('../useTaskStatusManager'))
  })

  it('initializes selected statuses from tasks', () => {
    const tasks = [
      buildTask({ taskId: 'task-1', status: buildStatus({ statusId: 1 }) }),
      buildTask({ taskId: 'task-2', status: undefined }),
    ]

    const statuses = [buildStatus({ statusId: 1 })]

    const { result } = renderUseTaskStatusManager(tasks, statuses)

    expect(result.current.getStatusValue(tasks[0])).toBe('1')
    expect(result.current.getStatusValue(tasks[1])).toBe('')
    expect(result.current.pendingTaskId).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('updates a task status via mutation', async () => {
    const tasks = [buildTask()]
    const statuses = [
      buildStatus({ statusId: 1, statusName: 'Open' }),
      buildStatus({ statusId: 2, statusName: 'In Progress' }),
    ]

    updateTaskStatusMock.mockResolvedValueOnce(undefined)

    const { result } = renderUseTaskStatusManager(tasks, statuses)

    await act(async () => {
      await result.current.handleStatusChange(tasks[0])({
        target: { value: '2' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(updateTaskStatusMock).toHaveBeenCalledWith('task-1', '2')
    expect(result.current.error).toBeNull()
  })

  it('restores previous value and sets error when mutation fails', async () => {
    const tasks = [buildTask()]
    const statuses = [
      buildStatus({ statusId: 1, statusName: 'Open' }),
      buildStatus({ statusId: 2, statusName: 'In Progress' }),
    ]

    updateTaskStatusMock.mockRejectedValueOnce(new Error('API failure'))

    const { result } = renderUseTaskStatusManager(tasks, statuses)

    await act(async () => {
      await result.current.handleStatusChange(tasks[0])({
        target: { value: '2' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(result.current.error).toBe('API failure')
    expect(result.current.getStatusValue(tasks[0])).toBe('1')
  })

  it('rejects status changes to unavailable statuses', async () => {
    const tasks = [buildTask()]
    const statuses = [buildStatus({ statusId: 1 })]

    const { result } = renderUseTaskStatusManager(tasks, statuses)

    await act(async () => {
      await result.current.handleStatusChange(tasks[0])({
        target: { value: '999' },
      } as unknown as React.ChangeEvent<HTMLSelectElement>)
    })

    expect(result.current.error).toBe('Selected status is not available.')
    expect(result.current.getStatusValue(tasks[0])).toBe('1')
    expect(updateTaskStatusMock).not.toHaveBeenCalled()
  })
})

