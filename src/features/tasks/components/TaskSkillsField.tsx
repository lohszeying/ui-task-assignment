import type { TaskFieldPath, TaskFormSectionForm } from './TaskFormSection.types'
import type { Skill } from '../../../types/tasks'
import { SkillPill } from '../../skills/components/SkillPill'
import { TaskFieldMessages } from './TaskFieldMessages'

type TaskSkillsFieldProps = {
  Field: TaskFormSectionForm['Field']
  name: TaskFieldPath
  availableSkills: Skill[]
  isLoading: boolean
  errorMessage: string | null
  isDisabled: boolean
}

export const TaskSkillsField = ({
  Field,
  name,
  availableSkills,
  isLoading,
  errorMessage,
  isDisabled,
}: TaskSkillsFieldProps) => (
  <Field
    name={name}
    children={(field) => {
      const selectedSkills: number[] = Array.isArray(field.state.value)
        ? field.state.value
        : []
      const groupId = `${field.name.replace(/\./g, '-')}-pill-group`

      const toggleSkill = (skillId: number) => {
        if (isDisabled) return
        const updated = selectedSkills.includes(skillId)
          ? selectedSkills.filter((id) => id !== skillId)
          : [...selectedSkills, skillId]
        field.handleChange(updated)
        field.handleBlur()
      }

      return (
        <div className={`task-field task-field--skills${isDisabled ? ' task-field--disabled' : ''}`}>
          <span className="task-field__label" id={groupId}>
            Skills
          </span>
          <p className="task-field__helper">Select every skill that helps complete this task.</p>

          {isLoading ? (
            <p className="task-field__message task-field__message--muted">Loading skills...</p>
          ) : null}
          {errorMessage ? (
            <p role="alert" className="task-field__message task-field__message--error">
              {errorMessage}
            </p>
          ) : null}
          {!isLoading && !errorMessage && availableSkills.length === 0 ? (
            <p className="task-field__message task-field__message--muted">
              No skills available right now.
            </p>
          ) : null}

          <div className="skill-pill-list" role="group" aria-labelledby={groupId}>
            {availableSkills.map((skill) => {
              const isSelected = selectedSkills.includes(skill.skillId)
              return (
                <SkillPill
                  key={`${name}-${skill.skillId}`}
                  label={skill.skillName}
                  isSelected={isSelected}
                  onClick={() => toggleSkill(skill.skillId)}
                  disabled={isDisabled}
                />
              )
            })}
          </div>
          <TaskFieldMessages field={field} />
        </div>
      )
    }}
  />
)
