'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Smile } from '@/components/smile';
import { Button } from '@/components/ui/button';
import { formatMoodDate } from '@/lib/utils';
import Link from 'next/link';
import Editor from '@/components/editor/editor';
import { getMoodEntryByUser } from '@/db/mood-entries';
import { moodRatingEnumType } from '@/db/schema';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

export default function MoodForm({
  params: { date, teamId, currentEntry },
}: {
  params: {
    date: string;
    teamId: string;
    currentEntry?: Awaited<ReturnType<typeof getMoodEntryByUser>>;
  };
}) {
  const router = useRouter();

  // Form state
  const [selectedRating, setSelectedRating] =
    useState<moodRatingEnumType | null>(currentEntry?.rating || null);
  const [comment, setComment] = useState(currentEntry?.comment || '');
  const [visibility, setVisibility] = useState<'public' | 'private'>(
    currentEntry?.visibility || 'public',
  );
  const [allowContact, setAllowContact] = useState<boolean>(
    currentEntry?.allowContact || true,
  );

  const [error, setError] = useState<string | null>(null);

  // Parse date or use today
  const entryDate = new Date(date);
  const formattedDate = formatMoodDate(entryDate);
  const isoDate = entryDate.toISOString().split('T')[0];
  // Create mood entry mutation
  const createMutation = useMutation({
    mutationFn: (data: {
      teamId: string;
      rating: '1' | '2' | '3' | '4' | '5';
      comment?: string;
      visibility: 'public' | 'private';
      allowContact: boolean;
      entryDate: string;
    }) => apiClient.createMoodEntry(data),
    onSuccess: () => {
      setError(null);
      router.push(`/team/${teamId}/${isoDate}`);
    },
    onError: (error) => {
      console.error('Error creating mood entry:', error);
      setError('Failed to create mood entry. Please try again.');
    },
  });

  // Update mood entry mutation
  const updateMutation = useMutation({
    mutationFn: (data: {
      entryId: string;
      rating?: '1' | '2' | '3' | '4' | '5';
      comment?: string;
      visibility?: 'public' | 'private';
      allowContact?: boolean;
    }) => apiClient.updateMoodEntry(data),
    onSuccess: () => {
      setError(null);
      router.push(`/team/${teamId}/${isoDate}`);
    },
    onError: (error) => {
      console.error('Error updating mood entry:', error);
      setError('Failed to update mood entry. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRating) {
      alert('Please select a mood rating');
      return;
    }

    if (currentEntry) {
      // Update existing entry
      updateMutation.mutate({
        entryId: currentEntry.id,
        rating: selectedRating,
        comment: comment || undefined,
        visibility,
        allowContact,
      });
    } else {
      // Create new entry
      createMutation.mutate({
        teamId: teamId,
        rating: selectedRating,
        comment: comment || undefined,
        visibility,
        allowContact,
        entryDate: isoDate,
      });
    }
  };

  const isMutating = createMutation.isPending || updateMutation.isPending;

  return (
    <div>
      <div className="px-4 py-8 md:px-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8 text-center">
            <h1 className="font-merriweather text-primary mb-2 text-3xl font-normal">
              {currentEntry ? 'Update your mood' : 'Share your mood'}
            </h1>
            <p className="text-[#948FB7]">{formattedDate}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8">
            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                {error}
              </div>
            )}

            {/* Mood Rating Selection */}
            <div className="space-y-6">
              <label className="text-primary block text-base leading-[22px] font-medium">
                How are you feeling today?
              </label>

              <div className="flex flex-wrap justify-center gap-8">
                {['1', '2', '3', '4', '5'].map((rating) => {
                  const isSelected = selectedRating === rating;
                  const moodClass = `mood${rating}` as
                    | 'mood1'
                    | 'mood2'
                    | 'mood3'
                    | 'mood4'
                    | 'mood5';

                  return (
                    <div
                      key={rating}
                      className="text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedRating(rating as moodRatingEnumType);
                          setError(null);
                        }}
                        className={`transition-all duration-200 ${
                          isSelected
                            ? 'scale-150'
                            : 'opacity-70 hover:scale-120 hover:opacity-100'
                        }`}>
                        <Smile mood={moodClass} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-3">
              <label className="text-primary block text-base leading-[22px] font-medium">
                Additional comments (optional)
              </label>
              <Editor
                onChange={(value) => setComment(value)}
                initialValue={comment}
              />
            </div>

            {/* Visibility Settings */}
            <div className="space-y-4">
              <label className="text-primary block text-base leading-[22px] font-medium">
                Privacy Settings
              </label>

              <div className="space-y-3">
                <RadioGroup
                  defaultValue={visibility}
                  onValueChange={(value) =>
                    setVisibility(value as 'public' | 'private')
                  }>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="public"
                      id="public"
                    />
                    <Label htmlFor="public">
                      Public - visible to all team members
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value="private"
                      id="private"
                    />
                    <Label htmlFor="private">
                      Private - only visible to team admins
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center space-x-3">
                <Checkbox
                  checked={allowContact}
                  label="Allow team members to reach out for support"
                  onClick={() => setAllowContact(!allowContact)}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col gap-6 pt-6 sm:flex-row">
              <Button
                type="button"
                asChild
                variant="secondary">
                <Link
                  className="text-center"
                  href={`/team/${teamId}/${isoDate}`}>
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={!selectedRating || isMutating}>
                {isMutating
                  ? currentEntry
                    ? 'Updating...'
                    : 'Sharing...'
                  : currentEntry
                    ? 'Update Mood'
                    : 'Share Mood'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
