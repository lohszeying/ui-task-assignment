import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SkillPill } from '../SkillPill'

vi.mock('../SkillPill.css', () => ({}))

describe('SkillPill', () => {
  it('renders the provided label', () => {
    render(<SkillPill label="TypeScript" isSelected={false} />)

    const button = screen.getByRole('button', { name: 'TypeScript' })
    expect(button).toBeDefined()
    expect(button.textContent).toBe('TypeScript')
  })

  it('invokes click and blur handlers when enabled', () => {
    const handleClick = vi.fn()
    const handleBlur = vi.fn()

    render(
      <SkillPill
        label="React"
        isSelected={false}
        onClick={handleClick}
        onBlur={handleBlur}
      />,
    )

    const button = screen.getByRole('button', { name: 'React' })
    fireEvent.click(button)
    fireEvent.blur(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleBlur).toHaveBeenCalledTimes(1)
  })

  it('applies selected and disabled styles and prevents click handler', () => {
    const handleClick = vi.fn()

    render(
      <SkillPill
        label="Vue"
        isSelected
        disabled
        onClick={handleClick}
      />,
    )

    const button = screen.getByRole('button', { name: 'Vue' })

    expect(button.className).toContain('skill-pill')
    expect(button.className).toContain('is-selected')
    expect(button.className).toContain('is-disabled')

    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })
})
