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

export interface Task {
  developer?: Developer
  skills: Skills[];
  status: string;
  taskId: string;
  title: string;
  subtasks?: Task[];
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
}

export const taskService = new TaskService(appConfig.url.core)
