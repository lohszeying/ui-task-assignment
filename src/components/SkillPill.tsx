import type { ButtonHTMLAttributes } from 'react'
import './SkillPill.css'

type SkillPillProps = {
  label: string
  isSelected: boolean
} & Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'onBlur'>

export const SkillPill = ({ label, isSelected, onClick, onBlur }: SkillPillProps) => (
  <button
    type="button"
    className={`skill-pill${isSelected ? ' is-selected' : ''}`}
    onClick={onClick}
    onBlur={onBlur}
  >
    {label}
  </button>
)
