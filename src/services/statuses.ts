import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'
import type { Status } from '../types/tasks'

const STATUSES_ENDPOINT = '/statuses'

class StatusService {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public getAllStatuses = async () => {
    const response = await httpClient.get(this.baseUrl, STATUSES_ENDPOINT)
    return (response.data as Status[]) ?? []
  }
}

export const statusService = new StatusService(appConfig.url.core)
