'use client';

import { useState, useEffect, useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { createTeam, updateTeam } from '@/app/actions';
import { PollDaysType, Team } from '@/db/schema';

interface TeamFormProps {
  mode: 'create' | 'edit';
  initialData?: Team;
  cancelLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
}

export default function TeamForm({
  mode,
  initialData,
  cancelLabel = 'Cancel',
  submitLabel = mode === 'create' ? 'Create team' : 'Update team',
  loadingLabel = mode === 'create' ? 'Creating...' : 'Updating...',
}: TeamFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    pollDays: PollDaysType;
  }>({
    name: initialData?.name || '',
    description: initialData?.description || '',
    pollDays: initialData?.pollDays || {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  });

  const handleSubmit = async () => {
    let team:
      | Awaited<ReturnType<typeof createTeam | typeof updateTeam>>
      | undefined;

    if (initialData) {
      team = await updateTeam({
        id: initialData?.id,
        name: formData.name,
        description: formData.description || undefined,
        pollDays: formData.pollDays,
      });
    } else {
      team = await createTeam({
        name: formData.name,
        description: formData.description || undefined,
        pollDays: formData.pollDays,
      });
    }

    if (!team.success || !team.data) {
      console.error('Error creating team:', team.errors);
      return;
    }

    router.push(`/team/${team.data.id}`);
  };

  const [, formActions, pending] = useActionState(handleSubmit, undefined);

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        description: initialData.description || '',
        pollDays: initialData.pollDays,
      });
    }
  }, [initialData]);

  const handleDayToggle = (day: keyof PollDaysType) => {
    setFormData((prev) => ({
      ...prev,
      pollDays: {
        ...prev.pollDays,
        [day]: !prev.pollDays[day],
      },
    }));
  };

  const onCancel = () => {
    if (mode === 'edit' && initialData) {
      router.push(`/team/${initialData.id}`);
    } else {
      router.push('/');
    }
  };

  return (
    <form
      action={formActions}
      className="space-y-8">
      {/* Team name input */}
      <div>
        <Input
          label="Team name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Team name..."
          required
        />
      </div>

      {/* Description input */}
      <div>
        <Input
          label="Description (optional)"
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          placeholder="Team description..."
        />
      </div>

      {/* Poll days section */}
      <div className="space-y-6">
        <h2 className="text-primary text-base leading-[22px] font-medium">
          On what day do you want polls?
        </h2>

        <div className="flex flex-wrap gap-8">
          <Checkbox
            checked={formData.pollDays.monday}
            label="Monday"
            onClick={() => handleDayToggle('monday')}
          />
          <Checkbox
            checked={formData.pollDays.tuesday}
            label="Tuesday"
            onClick={() => handleDayToggle('tuesday')}
          />
          <Checkbox
            checked={formData.pollDays.wednesday}
            label="Wednesday"
            onClick={() => handleDayToggle('wednesday')}
          />
          <Checkbox
            checked={formData.pollDays.thursday}
            label="Thursday"
            onClick={() => handleDayToggle('thursday')}
          />
          <Checkbox
            checked={formData.pollDays.friday}
            label="Friday"
            onClick={() => handleDayToggle('friday')}
          />
          <Checkbox
            checked={formData.pollDays.saturday}
            label="Saturday"
            onClick={() => handleDayToggle('saturday')}
          />
          <Checkbox
            checked={formData.pollDays.sunday}
            label="Sunday"
            onClick={() => handleDayToggle('sunday')}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-6 pt-8 sm:flex-row">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          type="submit"
          disabled={pending}>
          {pending ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
