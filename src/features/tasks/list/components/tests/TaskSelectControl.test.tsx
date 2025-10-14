import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TaskSelectControl } from '../TaskSelectControl'

describe('TaskSelectControl', () => {
  it('renders the provided label and options', () => {
    render(
      <TaskSelectControl
        label="Status"
        id="status-select"
        value="1"
        onChange={vi.fn()}
        disabled={false}
      >
        <option value="1">Open</option>
        <option value="2">Closed</option>
      </TaskSelectControl>,
    )

    const select = screen.getByLabelText('Status')
    expect(select).toBeDefined()
    expect(select).toHaveValue('1')

    expect(screen.getByRole('option', { name: 'Open' })).toBeDefined()
    expect(screen.getByRole('option', { name: 'Closed' })).toBeDefined()
  })

  it('forwards change events when enabled', () => {
    const handleChange = vi.fn()

    render(
      <TaskSelectControl
        label="Priority"
        id="priority-select"
        value="low"
        onChange={handleChange}
        disabled={false}
      >
        <option value="low">Low</option>
        <option value="high">High</option>
      </TaskSelectControl>,
    )

    const select = screen.getByLabelText('Priority')

    fireEvent.change(select, { target: { value: 'high' } })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('disables the select input when requested', () => {
    const handleChange = vi.fn()

    render(
      <TaskSelectControl
        label="Assignee"
        id="assignee-select"
        value="unassigned"
        onChange={handleChange}
        disabled
      >
        <option value="unassigned">Unassigned</option>
        <option value="alice">Alice</option>
      </TaskSelectControl>,
    )

    const select = screen.getByLabelText('Assignee')
    expect(select).toBeDisabled()
  })
})
