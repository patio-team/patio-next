'use client';

import { useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { deleteTeam } from '@/app/actions';
import { toast } from 'sonner';

interface DeleteTeamButtonProps {
  teamId: string;
  teamName: string;
}

export default function DeleteTeamButton({
  teamId,
  teamName,
}: DeleteTeamButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    try {
      const result = await deleteTeam(teamId);

      if (result.success) {
        toast.success('Team deleted successfully');
        setIsOpen(false);
        router.push('/');
      } else {
        toast.error(result.errors?.teamId || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('An unexpected error occurred while deleting the team');
    }
  };

  const [, formAction, pending] = useActionState(handleDelete, undefined);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          className="flex w-full items-center justify-center gap-2 sm:w-auto"
          type="button">
          <Trash2 className="h-4 w-4" />
          Delete Team
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Team</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{teamName}&rdquo;? This
            action cannot be undone. All mood entries, members, and invitations
            associated with this team will be permanently deleted.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setIsOpen(false)}
            disabled={pending}>
            Cancel
          </Button>
          <form action={formAction}>
            <Button
              type="submit"
              variant="destructive"
              disabled={pending}
              className="w-full sm:w-auto">
              {pending ? 'Deleting...' : 'Delete Team'}
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
