import type { ChangeEvent, ReactNode } from "react"

type TaskSelectControlProps = {
  label: string
  id: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  disabled: boolean
  children: ReactNode
}

export const TaskSelectControl = ({
  label,
  id,
  value,
  onChange,
  disabled,
  children,
}: TaskSelectControlProps) => {
  return (
    <div className="task-card__section task-card__section--control">
      <label className="task-card__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className="task-card__select"
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  )
}