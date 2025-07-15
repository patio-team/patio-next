'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useCreateTeam } from '@/lib/hooks/use-teams';
import { createTeamSchema } from '@/lib/api-types';
import { ZodError } from 'zod';
import { useSession } from '@/lib/auth-client';

interface DaySelection {
  weekday: boolean;
  weekend: boolean;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export default function NewTeamPage() {
  const router = useRouter();
  const createTeamMutation = useCreateTeam();
  const { data: session, isPending: sessionLoading } = useSession();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.push('/login');
    }
  }, [session, sessionLoading, router]);

  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    pollDays: DaySelection;
  }>({
    name: '',
    description: '',
    pollDays: {
      weekday: true,
      weekend: false,
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
      createTeamSchema.parse(formData);
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
      const response = await createTeamMutation.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
      });

      const team = response.data;

      router.push(`/team/${team.id}`);
    } catch (error) {
      console.error('Error creating team:', error);
      setErrors({ submit: 'Failed to create team. Please try again.' });
    }
  };

  // Show loading screen while checking session
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-[#34314C] text-lg">Loading...</div>
      </div>
    );
  }

  // Show nothing if not authenticated (useEffect will redirect)
  if (!session) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-white relative`}>
      {/* Main content */}
      <div className="max-w-4xl mx-auto px-6 sm:px-16 py-16">
        <form
          onSubmit={handleSubmit}
          className="space-y-8">
          {/* Title */}
          <h1 className="font-merriweather text-[#34314C] text-[32px] leading-[42px] font-normal">
            New team
          </h1>

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
                checked={formData.pollDays.weekday}
                label="Weekday"
                onClick={() => handleDayToggle('weekday')}
              />
              <Checkbox
                checked={formData.pollDays.weekend}
                label="Weekend"
                onClick={() => handleDayToggle('weekend')}
              />
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
            <Button
              type="button"
              variant="secondary"
              asChild>
              <Link
                href="/"
                className="text-center">
                Cancel
              </Link>
            </Button>
            <Button
              type="submit"
              disabled={createTeamMutation.isPending}>
              {createTeamMutation.isPending ? 'Creating...' : 'Create team'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
