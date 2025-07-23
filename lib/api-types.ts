import {
  MoodEntry,
  NewTeam,
  NewUser,
  TeamMember as DbTeamMember,
} from '@/db/schema';

export interface TeamMember extends Omit<DbTeamMember, 'joinedAt'> {
  user: NewUser;
  joinedAt: string;
}

export interface TeamMemberWithLastVote extends TeamMember {
  lastVote: {
    date: MoodEntry['entryDate'];
    rating: MoodEntry['rating'];
    comment: MoodEntry['comment'];
  } | null;
}

export interface MembersPagination {
  member: TeamMember;
  team: NewTeam;
  moodEntries: (Omit<MoodEntry, 'entryDate' | 'createdAt' | 'updatedAt'> & {
    entryDate: string;
    createdAt: string;
    updatedAt: string;
  })[];
  pagination: {
    hasMore: boolean;
    nextCursor: string | null;
  };
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
