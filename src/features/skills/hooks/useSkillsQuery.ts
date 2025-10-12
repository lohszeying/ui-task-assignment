import { useQuery } from '@tanstack/react-query'
import { skillsService } from '../../../services/skills'
import type { Skill } from '../../../types/tasks'

export const useSkillsQuery = () => {
  const query = useQuery({
    queryKey: ['skills'],
    queryFn: (): Promise<Skill[]> => skillsService.getSkills(),
    staleTime: 1000 * 60 * 5,
  })

  return {
    skills: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  }
}
