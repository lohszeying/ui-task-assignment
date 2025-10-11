import { useQuery } from '@tanstack/react-query'
import { statusService } from '../../../services/statuses'

export const useStatusesQuery = () => {
  const query = useQuery({
    queryKey: ['statuses'],
    queryFn: () => statusService.getAllStatuses(),
    staleTime: 1000 * 60 * 5,
  })

  return {
    statuses: query.data ?? [],
    isLoading: query.isPending,
    error: query.error,
  }
}
