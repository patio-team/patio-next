import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Query keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (filters: string) => [...teamKeys.lists(), { filters }] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// Get single team query
export function useTeam(teamId: string) {
  return useQuery({
    queryKey: teamKeys.detail(teamId),
    queryFn: () => apiClient.getTeam(teamId),
    enabled: !!teamId,
  });
}

// Send invitations mutation
export function useSendInvitations() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { teamId: string; emails: string[] }) =>
      apiClient.sendInvitations(data),
    onSuccess: (_, variables) => {
      // Invalidate team details to refresh members and invitations
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
}

// Leave team mutation
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => apiClient.leaveTeam(teamId),
    onSuccess: () => {
      // Invalidate teams list to remove the left team
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// Update member role mutation
export function useUpdateMemberRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      teamId: string;
      memberId: string;
      role: 'member' | 'admin';
    }) => apiClient.updateMemberRole(data.teamId, data.memberId, data.role),
    onSuccess: (_, variables) => {
      // Invalidate team details to refresh members
      queryClient.invalidateQueries({
        queryKey: teamKeys.detail(variables.teamId),
      });
    },
  });
}

// Download team mood entries CSV mutation
export function useDownloadTeamMoodEntriesCSV() {
  return useMutation({
    mutationFn: async (teamId: string) => {
      const blob = await apiClient.downloadTeamMoodEntriesCSV(teamId);

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;

      // Generate filename with current date
      const currentDate = new Date().toISOString().split('T')[0];
      link.download = `mood-entries-team-${teamId}-${currentDate}.csv`;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      return blob;
    },
  });
}
