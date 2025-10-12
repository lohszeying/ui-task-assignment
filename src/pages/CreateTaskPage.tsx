import { useForm } from '@tanstack/react-form'
import type { AnyFieldApi } from '@tanstack/react-form'
import { useSkillsQuery } from '../features/skills/hooks/useSkillsQuery'
import { SkillPill } from '../components/SkillPill'
import './CreateTaskPage.css'

type CreateTaskFormValues = {
  title: string
  skills: number[]
}

function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em>{field.state.meta.errors.join(', ')}</em>
      ) : null}
      {field.state.meta.isValidating ? 'Validating...' : null}
    </>
  )
}

export const CreateTaskPage = () => {
  const {
    skills: availableSkills,
    isLoading: isLoadingSkills,
    error: skillsError,
  } = useSkillsQuery()
  const skillsErrorMessage =
    skillsError instanceof Error
      ? skillsError.message
      : skillsError
        ? 'Unable to load skills. Please try again later.'
        : null

  const form = useForm({
    defaultValues: {
      title: '',
      skills: [] as number[],
    } satisfies CreateTaskFormValues,
    onSubmit: async ({ value }) => {
      // Do something with form data
      console.log(value)
    },
  })

  return (
    <section>
      <h1 className="h3 mb-3">Create Task</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }}
      >
        <div>
          {/* A type-safe field component*/}
          <form.Field
            name="title"
            validators={{
              onChange: ({ value }) =>
                !value
                  ? 'Task title is required'
                  : value.length < 1
                    ? 'Must include at least 1 character'
                    : undefined,
              onChangeAsyncDebounceMs: 500,
              onChangeAsync: async ({ value }) => {
                await new Promise((resolve) => setTimeout(resolve, 1000))
                return (
                  value.includes('error') && 'No "error" allowed in first name'
                )
              },
            }}
            children={(field) => {
              // Avoid hasty abstractions. Render props are great!
              return (
                <>
                  <label htmlFor={field.name}>Task title: </label>
                  <input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <div>
          <form.Field
            name="skills"
            children={(field) => {
              const selectedSkills = field.state.value ?? []
              const groupId = `${field.name}-pill-group`

              const toggleSkill = (skillId: number) => {
                const updated = selectedSkills.includes(skillId)
                  ? selectedSkills.filter((id) => id !== skillId)
                  : [...selectedSkills, skillId]
                field.handleChange(updated)
              }

              console.log("selectedSkills:", selectedSkills)

              return (
                <>
                  <span id={groupId}>Skills:</span>
                  {isLoadingSkills ? (
                    <p>Loading skills...</p>
                  ) : null}
                  {skillsErrorMessage ? <p role="alert">{skillsErrorMessage}</p> : null}
                  {!isLoadingSkills && !skillsErrorMessage && availableSkills.length === 0 ? (
                    <p>No skills available.</p>
                  ) : null}
                  <div
                    className="skill-pill-list"
                    role="group"
                    aria-labelledby={groupId}
                  >
                    {availableSkills.map((skill) => (
                      <SkillPill
                        key={skill.skillId}
                        label={skill.skillName}
                        isSelected={selectedSkills.includes(skill.skillId)}
                        onClick={() => toggleSkill(skill.skillId)}
                        onBlur={field.handleBlur}
                      />
                    ))}
                  </div>
                  <FieldInfo field={field} />
                </>
              )
            }}
          />
        </div>
        <form.Subscribe
          selector={(state) => [state.canSubmit, state.isSubmitting]}
          children={([canSubmit, isSubmitting]) => (
            <button type="submit" disabled={!canSubmit}>
              {isSubmitting ? '...' : 'Submit'}
            </button>
          )}
        />
      </form>
    </section>
  )
}
