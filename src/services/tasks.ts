import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'
import type { CreateTaskPayload, Task } from '../types/tasks'

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
      body: { statusId: Number(statusId) },
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

  public createTask = async (payload: CreateTaskPayload) => {
    const response = await httpClient.post(this.baseUrl, TASKS_ENDPOINT, {
      body: payload,
    })

    return response.data
  }
}

export const taskService = new TaskService(appConfig.url.core)
