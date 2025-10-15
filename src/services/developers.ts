import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'
import type { Developer } from '../types/tasks'

const DEVELOPERS_ENDPOINT = '/developers'

class DeveloperService {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public getDevelopers = async (skillIds?: number[]) => {
    const params = skillIds && skillIds.length > 0 ? { skill: skillIds.join(',') } : undefined

    const response = await httpClient.get<Developer[]>(this.baseUrl, DEVELOPERS_ENDPOINT, {
      params,
    })

    return response.data ?? []
  }
}

export const developerService = new DeveloperService(appConfig.url.core)
