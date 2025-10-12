import type { ButtonHTMLAttributes } from 'react'
import './SkillPill.css'

type SkillPillProps = {
  label: string
  isSelected: boolean
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onBlur' | 'disabled'>

export const SkillPill = ({ label, isSelected, onClick, onBlur, disabled }: SkillPillProps) => (
  <button
    type="button"
    className={`skill-pill${isSelected ? ' is-selected' : ''}${disabled ? ' is-disabled' : ''}`}
    onClick={onClick}
    onBlur={onBlur}
    disabled={disabled}
  >
    {label}
  </button>
)
