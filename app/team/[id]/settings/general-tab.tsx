'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDownloadTeamMoodEntriesCSV } from '@/lib/hooks/use-teams';
import TeamForm from '@/components/team-form';
import { toast } from 'sonner';
import type { getTeam } from '@/db/team';

export default function GeneralTab({
  team,
}: {
  team: NonNullable<Awaited<ReturnType<typeof getTeam>>>;
}) {
  const downloadCSVMutation = useDownloadTeamMoodEntriesCSV();

  const handleDownloadCSV = async () => {
    try {
      await downloadCSVMutation.mutateAsync(team.id);
      toast.success('CSV file downloaded successfully');
    } catch (error) {
      toast.error(
        `Failed to download CSV: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      console.error('Error downloading CSV:', error);
    }
  };

  return (
    <div className="flex w-full flex-col gap-8 py-4 xl:flex-row xl:gap-16">
      <div className="max-w-2xl flex-1">
        <h2 className="font-merriweather text-primary mb-6 text-2xl leading-[30px] font-normal">
          Team Settings
        </h2>
        <TeamForm
          mode="edit"
          initialData={team}
          submitLabel="Update team"
          loadingLabel="Updating..."
        />

        {/* Download CSV button */}
        <div className="mt-4">
          <Button
            onClick={handleDownloadCSV}
            disabled={downloadCSVMutation.isPending}
            variant="secondary"
            className="flex w-full items-center gap-2 sm:w-auto">
            <Download className="h-4 w-4" />
            {downloadCSVMutation.isPending
              ? 'Downloading...'
              : 'Download Mood Entries CSV'}
          </Button>
          <p className="text-sm text-[#948FB7]">
            Download all mood entries for this team as a CSV file
          </p>
        </div>
      </div>
    </div>
  );
}
