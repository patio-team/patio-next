import { z } from 'zod';

export interface DaySelection {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

// Form validation schema
export const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(255, 'Team name too long'),
  description: z.string().optional(),
  pollDays: z.object({
    monday: z.boolean(),
    tuesday: z.boolean(),
    wednesday: z.boolean(),
    thursday: z.boolean(),
    friday: z.boolean(),
    saturday: z.boolean(),
    sunday: z.boolean(),
  }),
});

export const updateTeamSchema = createTeamSchema;

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormData = z.infer<typeof updateTeamSchema>;

// API Response types
export interface Team {
  id: string;
  name: string;
  description?: string;
  pollDays: DaySelection;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  invitations?: TeamInvitation[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'member' | 'admin';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface TeamMemberWithLastVote extends TeamMember {
  lastVote: {
    date: string;
    rating: number;
    comment?: string;
  } | null;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

// Mood entry types
export interface MoodEntry {
  id: string;
  userId: string;
  teamId: string;
  rating: '1' | '2' | '3' | '4' | '5';
  comment?: string;
  visibility: 'public' | 'private';
  allowContact: boolean;
  entryDate: string; // ISO date string
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface CreateMoodEntryRequest {
  teamId: string;
  rating: '1' | '2' | '3' | '4' | '5';
  comment?: string;
  visibility?: 'public' | 'private';
  allowContact?: boolean;
  mentionedUserIds?: string[];
  entryDate?: string; // Optional ISO date string (YYYY-MM-DD)
}

export interface UpdateMoodEntryRequest {
  entryId: string;
  rating?: '1' | '2' | '3' | '4' | '5';
  comment?: string;
  visibility?: 'public' | 'private';
  allowContact?: boolean;
  mentionedUserIds?: string[];
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  pollDays: DaySelection;
  createdAt: string;
  updatedAt: string;
  members?: TeamMember[];
  invitations?: TeamInvitation[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  role: 'member' | 'admin';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface TeamMemberWithLastVote extends TeamMember {
  lastVote: {
    date: string;
    rating: number;
    comment?: string;
  } | null;
}

export interface TeamInvitation {
  id: string;
  teamId: string;
  email: string;
  invitedBy: string;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
