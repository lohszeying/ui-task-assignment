import type { ChangeEvent, ReactNode } from "react"

type TaskSelectControlProps = {
  label: string
  id: string
  value: string
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void
  disabled: boolean
  selectClassName?: string
  children: ReactNode
}

export const TaskSelectControl = ({
  label,
  id,
  value,
  onChange,
  disabled,
  selectClassName,
  children,
}: TaskSelectControlProps) => {
  const selectClasses = ['task-card__select']
  if (selectClassName) {
    selectClasses.push(selectClassName)
  }

  return (
    <div className="task-card__section task-card__section--control">
      <label className="task-card__label" htmlFor={id}>
        {label}
      </label>
      <select
        id={id}
        className={selectClasses.join(' ')}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        {children}
      </select>
    </div>
  )
}