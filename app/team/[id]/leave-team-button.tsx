'use client';

import { startTransition, useActionState, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { leaveTeam } from '@/app/actions';

interface LeaveTeamButtonProps {
  teamId: string;
}

export default function LeaveTeamButton({ teamId }: LeaveTeamButtonProps) {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [dialogState, setDialogState] = useState<'confirm' | 'error'>(
    'confirm',
  );

  const handleLeaveTeam = async () => {
    const result = await leaveTeam(teamId);

    if (result.success) {
      setShowDialog(false);
      router.push('/');
    } else {
      setDialogState('error');
    }
  };

  const [, action, pending] = useActionState(handleLeaveTeam, undefined);

  const handleLeaveClick = () => {
    setDialogState('confirm');
    setShowDialog(true);
  };

  const handleDialogClose = () => {
    setShowDialog(false);
  };

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-sm font-medium text-[#3FA2F7]"
        onClick={handleLeaveClick}>
        Leave team
      </button>

      <Dialog
        open={showDialog}
        onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogState === 'confirm' ? 'Leave Team' : 'Cannot Leave Team'}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {dialogState === 'confirm'
              ? "Are you sure you want to leave this team? You will no longer have access to the team's polls and results."
              : 'You are the last admin of this team. Please assign another admin before you can leave the team.'}
          </DialogDescription>
          <DialogFooter
            className={dialogState === 'confirm' ? 'sm:justify-between' : ''}>
            {dialogState === 'confirm' ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleDialogClose}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => startTransition(action)}
                  disabled={pending}>
                  {pending ? 'Leaving...' : 'Leave Team'}
                </Button>
              </>
            ) : (
              <Button onClick={handleDialogClose}>Okay</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
