export interface Skill {
  skillId: number
  skillName: string
}

export interface Status {
  statusId: number
  statusName: string
}

export interface Developer {
  developerId: string
  developerName: string
  skills?: Skill[]
}

export interface SubtaskPayload {
  title: string
  skills?: number[]
  subtasks?: SubtaskPayload[]
}

export interface CreateTaskPayload extends SubtaskPayload {
  parentTaskId?: string | null
}

export interface Task {
  developer?: Developer
  skills: Skill[]
  status?: Status
  taskId: string
  title: string
  subtasks?: Task[]
}
