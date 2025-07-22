import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

// Leave team mutation
export function useLeaveTeam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (teamId: string) => apiClient.leaveTeam(teamId),
    onSuccess: () => {
      // Invalidate teams list to remove the left team
      queryClient.invalidateQueries({ queryKey: ['teams'] });
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
