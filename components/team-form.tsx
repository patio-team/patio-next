'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { createTeamSchema, Team, DaySelection } from '@/lib/api-types';
import { ZodError } from 'zod';

export type { DaySelection };

interface TeamFormProps {
  mode: 'create' | 'edit';
  initialData?: Team;
  onSubmit: (data: {
    name: string;
    description?: string;
    pollDays: DaySelection;
  }) => void;
  isLoading?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  submitLabel?: string;
  loadingLabel?: string;
}

export default function TeamForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
  onCancel,
  cancelLabel = 'Cancel',
  submitLabel = mode === 'create' ? 'Create team' : 'Update team',
  loadingLabel = mode === 'create' ? 'Creating...' : 'Updating...',
}: TeamFormProps) {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    pollDays: DaySelection;
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

  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const handleDayToggle = (day: keyof DaySelection) => {
    setFormData((prev) => ({
      ...prev,
      pollDays: {
        ...prev.pollDays,
        [day]: !prev.pollDays[day],
      },
    }));
  };

  const validateForm = () => {
    try {
      createTeamSchema.parse({
        ...formData,
        description: formData.description || undefined,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          newErrors[issue.path.join('.')] = issue.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        name: formData.name,
        description: formData.description || undefined,
        pollDays: formData.pollDays,
      });
    } catch (error) {
      console.error(
        `Error ${mode === 'create' ? 'creating' : 'updating'} team:`,
        error,
      );
      setErrors({
        submit: `Failed to ${mode === 'create' ? 'create' : 'update'} team. Please try again.`,
      });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
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
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name}</p>
        )}
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
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Poll days section */}
      <div className="space-y-6">
        <h2 className="text-[#34314C] text-base leading-[22px] font-medium">
          On what day do you want polls?
        </h2>

        <div className="flex gap-8 flex-wrap">
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

      {/* Error message */}
      {errors.submit && (
        <div className="text-red-500 text-sm">{errors.submit}</div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-6 pt-8">
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}>
            {cancelLabel}
          </Button>
        )}
        <Button
          type="submit"
          disabled={isLoading}>
          {isLoading ? loadingLabel : submitLabel}
        </Button>
      </div>
    </form>
  );
}
