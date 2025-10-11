import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'

interface Developer {
  developerName: string;
  developerId: string;
}

export interface Skills {
  skillId: number;
  skillName: string;
}

export interface Status {
  statusId: number;
  statusName: string;
}

export interface Task {
  developer?: Developer
  skills: Skills[]
  status?: Status
  taskId: string
  title: string
  subtasks?: Task[]
}

const TASKS_ENDPOINT = '/tasks'

class TaskService {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public getAllTasks = async () => {
    const response = await httpClient.get(this.baseUrl, TASKS_ENDPOINT)
    return response.data as Task[]
  }

  public updateTaskStatus = async (taskId: string, statusId: string) => {
    await httpClient.patch(this.baseUrl, `${TASKS_ENDPOINT}/${taskId}/status`, {
      body: { statusId },
    })
  }

  public updateTaskDeveloper = async (taskId: string, developerId: string) => {
    await httpClient.patch(this.baseUrl, `${TASKS_ENDPOINT}/${taskId}/developer`, {
      body: { developerId },
    })
  }

  public unassignTaskDeveloper = async (taskId: string) => {
    await httpClient.delete(this.baseUrl, `${TASKS_ENDPOINT}/${taskId}/developer`)
  }
}

export const taskService = new TaskService(appConfig.url.core)
