'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Smile } from '@/components/smile';
import { Button } from '@/components/ui/button';
import { formatMoodDate } from '@/lib/utils';
import Link from 'next/link';
import { LoadingSpinner } from '@/components/ui/loading';
import { Select } from '@/components/ui/select';
import Editor from '@/components/editor/editor';
import { getMoodEntries } from '@/db/mood-entries';
import { moodRatingEnumType } from '@/db/schema';

export default function MoodForm({
  params: { date, teamId, currentEntry },
}: {
  params: {
    date: string;
    teamId: string;
    currentEntry?: Awaited<ReturnType<typeof getMoodEntries>>[0];
  };
}) {
  const router = useRouter();

  // Get user's teams
  const teamsQuery = useSuspenseQuery({
    queryKey: ['user-teams'],
    queryFn: () => apiClient.getTeams(),
  });

  const teams = teamsQuery.data?.data;
  const teamsLoading = teamsQuery.isLoading;

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

  const [selectedTeam, setSelectedTeam] = useState<string>(teamId || '');
  const [error, setError] = useState<string | null>(null);

  // Parse date or use today
  const entryDate = date ? new Date(date) : new Date();
  const formattedDate = formatMoodDate(entryDate);
  const isoDate = entryDate.toISOString().split('T')[0];

  // Select first team if none selected
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeam) {
      setSelectedTeam(teams[0].id);
    }
  }, [teams, selectedTeam]);

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
      router.push(`/team/${selectedTeam}?date=${isoDate}`);
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
      router.push(`/team/${selectedTeam}/?date=${isoDate}`);
    },
    onError: (error) => {
      console.error('Error updating mood entry:', error);
      setError('Failed to update mood entry. Please try again.');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedRating || !selectedTeam) {
      alert('Please select a mood rating and team');
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
        teamId: selectedTeam,
        rating: selectedRating,
        comment: comment || undefined,
        visibility,
        allowContact,
        entryDate: isoDate,
      });
    }
  };

  const isLoading = teamsLoading;
  const isMutating = createMutation.isPending || updateMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

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

            {/* Team Selection */}
            {teams && teams.length > 1 && (
              <div className="space-y-3">
                <Select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  label="Team">
                  {teams.map((team) => (
                    <option
                      key={team.id}
                      value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </Select>
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
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="public"
                    name="visibility"
                    value="public"
                    checked={visibility === 'public'}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'public' | 'private')
                    }
                    className="h-4 w-4 border-gray-300 text-[#3FE3D2] focus:ring-[#3FE3D2]"
                  />
                  <label
                    htmlFor="public"
                    className="text-primary text-sm">
                    Public - visible to all team members
                  </label>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    id="private"
                    name="visibility"
                    value="private"
                    checked={visibility === 'private'}
                    onChange={(e) =>
                      setVisibility(e.target.value as 'public' | 'private')
                    }
                    className="h-4 w-4 border-gray-300 text-[#3FE3D2] focus:ring-[#3FE3D2]"
                  />
                  <label
                    htmlFor="private"
                    className="text-primary text-sm">
                    Private - only visible to team admins
                  </label>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="allowContact"
                  checked={allowContact}
                  onChange={(e) => setAllowContact(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-[#3FE3D2] focus:ring-[#3FE3D2]"
                />
                <label
                  htmlFor="allowContact"
                  className="text-primary text-sm">
                  Allow team members to reach out for support
                </label>
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
                  href={`/team/${selectedTeam}?date=${isoDate}`}>
                  Cancel
                </Link>
              </Button>
              <Button
                type="submit"
                disabled={!selectedRating || !selectedTeam || isMutating}>
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
