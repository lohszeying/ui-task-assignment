import type { JSX } from 'react'
import type { TaskFormSectionProps } from '../TaskFormSection.types'
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const toastErrorMock = vi.hoisted(() => vi.fn())

vi.mock('react-toastify', () => ({
  toast: {
    error: toastErrorMock,
  },
}))

const mockTaskFormSection = vi.hoisted(
  () => vi.fn((_: TaskFormSectionProps) => <div data-testid="task-form-section" />),
)

vi.mock('../TaskFormSection', () => ({
  TaskFormSection: mockTaskFormSection,
}))

type CreateTaskFormComponent = typeof import('../CreateTaskForm').CreateTaskForm

let CreateTaskForm: CreateTaskFormComponent
let useCreateTaskFormSpy: ReturnType<typeof vi.spyOn>

beforeAll(async () => {
  const useCreateTaskFormModule = await import('../../hooks/useCreateTaskForm')
  useCreateTaskFormSpy = vi.spyOn(useCreateTaskFormModule, 'useCreateTaskForm')
  ;({ CreateTaskForm } = await import('../CreateTaskForm'))
})

type SubscribeState = {
  canSubmit?: boolean
  isSubmitting?: boolean
}

const mockHandleSubmit = vi.fn()

const createSubscribe = (stateOverrides?: SubscribeState) => {
  const baseState = { canSubmit: true, isSubmitting: false, ...stateOverrides }

  return ({
    selector,
    children,
  }: {
    selector: (state: typeof baseState) => any
    children: (value: any) => JSX.Element
  }) => {
    const selection = selector(baseState)
    return children(selection)
  }
}

const setUseCreateTaskFormReturn = ({
  subscribeState,
  createTaskMutation,
  skillsCollections,
  submissionErrorMessage,
}: {
  subscribeState?: SubscribeState
  createTaskMutation?: { isPending?: boolean; isSuccess?: boolean }
  skillsCollections?: {
    data?: unknown[]
    isLoading?: boolean
    errorMessage?: string | null
  }
  submissionErrorMessage?: string | null
} = {}) => {
  useCreateTaskFormSpy.mockReturnValue({
    form: {
      handleSubmit: mockHandleSubmit,
      Subscribe: createSubscribe(subscribeState),
    },
    skillsCollections: {
      data: [],
      isLoading: false,
      errorMessage: null,
      ...skillsCollections,
    },
    createTaskMutation: {
      isPending: false,
      isSuccess: false,
      ...createTaskMutation,
    },
    submissionErrorMessage: submissionErrorMessage ?? null,
  })
}

describe('CreateTaskForm', () => {
  beforeEach(() => {
    mockHandleSubmit.mockClear()
    mockTaskFormSection.mockClear()
    toastErrorMock.mockClear()
    useCreateTaskFormSpy.mockReset()
    setUseCreateTaskFormReturn()
  })

  it('submits the form and renders the task section with default state', () => {
    render(<CreateTaskForm />)

    expect(useCreateTaskFormSpy).toHaveBeenCalled()

    const formElement = document.querySelector('form') as HTMLFormElement
    fireEvent.submit(formElement)

    expect(mockHandleSubmit).toHaveBeenCalledTimes(1)

    const sectionProps = mockTaskFormSection.mock.calls[0][0]
    expect(sectionProps).toMatchObject({
      isDisabled: false,
      availableSkills: [],
      isLoadingSkills: false,
      skillsErrorMessage: null,
    })

    const submitButton = screen.getByRole('button', { name: 'Create task' })
    expect(submitButton).toBeEnabled()
  })

  it('reflects pending submission state', () => {
    setUseCreateTaskFormReturn({
      subscribeState: { canSubmit: true, isSubmitting: true },
      createTaskMutation: { isPending: true },
    })

    render(<CreateTaskForm />)

    const submitButton = screen.getByRole('button', { name: 'Submitting...' })
    expect(submitButton).toBeDisabled()

    const body = document.querySelector('.create-task-form__body') as HTMLElement
    expect(body).toHaveAttribute('aria-busy', 'true')
    expect(body).toHaveAttribute('aria-disabled', 'true')
  })

  it('renders success status when mutation succeeds', () => {
    setUseCreateTaskFormReturn({
      createTaskMutation: { isSuccess: true },
    })

    render(<CreateTaskForm />)

    expect(screen.getByRole('status')).toHaveTextContent('Task created successfully.')
  })

  it('displays a toast when a submission error message is provided', async () => {
    setUseCreateTaskFormReturn({
      submissionErrorMessage: 'Failed to create task.',
    })

    render(<CreateTaskForm />)

    await waitFor(() => {
      expect(toastErrorMock).toHaveBeenCalledWith('Failed to create task.')
    })
  })
})
