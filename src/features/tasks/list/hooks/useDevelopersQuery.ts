import { useQuery } from '@tanstack/react-query'
import { developerService } from '../../../../services/developers'

export const useDevelopersQuery = () => {
  const query = useQuery({
    queryKey: ['developers'],
    queryFn: () => developerService.getDevelopers(),
    staleTime: 1000 * 60 * 5,
  })

  return {
    developers: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  }
}
