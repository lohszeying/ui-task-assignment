import { appConfig } from '../config/appConfig'
import { httpClient } from '../lib/httpClient'

export interface Skill {
  skillId: number
  skillName: string
}

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
