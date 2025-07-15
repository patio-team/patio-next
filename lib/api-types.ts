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
  user?: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  mentions?: MoodEntryMention[];
}

export interface MoodEntryMention {
  id: string;
  moodEntryId: string;
  mentionedUserId: string;
  mentionedByUserId: string;
  createdAt: string;
  mentionedUser: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
}

export interface ParticipationStats {
  totalEntries: number;
  uniqueParticipants: number;
  totalMembers: number;
  participationRate: number; // percentage
  averageParticipation?: number;
  averageParticipationRate?: number;
  historicalDays?: number;
}

export interface MoodEntriesResponse {
  date: string; // ISO date string (YYYY-MM-DD)
  entries: MoodEntry[];
  stats: ParticipationStats;
}

// Request types
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

// Validation schemas
export const createMoodEntrySchema = z.object({
  teamId: z.string().min(1, 'Team ID is required'),
  rating: z.enum(['1', '2', '3', '4', '5']),
  comment: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('private'),
  allowContact: z.boolean().default(true),
  mentionedUserIds: z.array(z.string()).default([]),
  entryDate: z.string().optional(), // ISO date string validation
});

export const updateMoodEntrySchema = z.object({
  entryId: z.string().min(1, 'Entry ID is required'),
  rating: z.enum(['1', '2', '3', '4', '5']).optional(),
  comment: z.string().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  allowContact: z.boolean().optional(),
  mentionedUserIds: z.array(z.string()).optional(),
});

export type CreateMoodEntryFormData = z.infer<typeof createMoodEntrySchema>;
export type UpdateMoodEntryFormData = z.infer<typeof updateMoodEntrySchema>;

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
