export interface TeamMemberWithLastVote extends TeamMember {
  lastVote: {
    date: string;
    rating: number;
    comment?: string;
  } | null;
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

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}
