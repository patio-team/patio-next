import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { CreateTeamFormData } from '@/lib/api-types';

// Query keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// Get teams query
export function useTeams() {
  return useQuery({
    queryKey: teamKeys.lists(),
    queryFn: () => apiClient.getTeams(),
  });
}

// Create team mutation
export function useCreateTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Pick<CreateTeamFormData, 'name' | 'description'>) =>
      apiClient.createTeam(data),
    onSuccess: () => {
      // Invalidate and refetch teams
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
