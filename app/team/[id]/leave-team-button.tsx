'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaveTeam } from '@/lib/hooks/use-teams';
import { ApiError } from '@/lib/api-client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface LeaveTeamButtonProps {
  teamId: string;
}

export default function LeaveTeamButton({ teamId }: LeaveTeamButtonProps) {
  const router = useRouter();
  const leaveTeamMutation = useLeaveTeam();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);

  const handleLeaveTeam = async () => {
    try {
      await leaveTeamMutation.mutateAsync(teamId);
      router.push('/');
    } catch (error: unknown) {
      console.error('Error leaving team:', error);
      if (
        error instanceof ApiError &&
        error.message.includes('último administrador')
      ) {
        setShowErrorDialog(true);
      } else {
        // Handle other errors - could be network errors, etc.
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : 'Error al abandonar el equipo. Por favor, inténtelo de nuevo.';
        alert(errorMessage);
      }
      setShowConfirmDialog(false);
    }
  };

  const handleLeaveClick = () => {
    setShowConfirmDialog(true);
  };

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-sm font-medium text-[#3FA2F7]"
        onClick={handleLeaveClick}>
        Leave team
      </button>

      {/* Leave Team Confirmation Dialog */}
      <Dialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Leave Team</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to leave this team? You will no longer have
            access to the team&apos;s polls and results.
          </DialogDescription>
          <DialogFooter className="sm:justify-between">
            <Button
              variant="secondary"
              onClick={() => setShowConfirmDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleLeaveTeam}
              disabled={leaveTeamMutation.isPending}>
              {leaveTeamMutation.isPending ? 'Leaving...' : 'Leave Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog for Last Admin */}
      <Dialog
        open={showErrorDialog}
        onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Leave Team</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            You are the last admin of this team. Please assign another admin
            before you can leave the team.
          </DialogDescription>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>Okay</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
