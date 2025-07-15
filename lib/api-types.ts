import { z } from 'zod';

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

export type CreateTeamFormData = z.infer<typeof createTeamSchema>;

// API Response types
export interface Team {
  id: string;
  name: string;
  description?: string;
  pollDays: CreateTeamFormData['pollDays'];
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
