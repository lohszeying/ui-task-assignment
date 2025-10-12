import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'
import type { Skill } from '../types/tasks'

const SKILLS_ENDPOINT = '/skills'

class SkillsService {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  public getSkills = async (): Promise<Skill[]> => {
    const response = await httpClient.get(this.baseUrl, SKILLS_ENDPOINT)
    return response.data as Skill[]
  }
}

export const skillsService = new SkillsService(appConfig.url.core)
