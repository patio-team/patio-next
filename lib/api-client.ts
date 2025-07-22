import {
  ApiResponse,
  Team,
  DaySelection,
  MoodEntry,
  CreateMoodEntryRequest,
  UpdateMoodEntryRequest,
} from './api-types';

class ApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        });
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: 'Network error occurred',
        status: 0,
      });
    }
  }

  // Teams API methods
  async createTeam(data: {
    name: string;
    description?: string;
    pollDays: DaySelection;
  }) {
    return this.request<ApiResponse<Team>>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeams() {
    return this.request<ApiResponse<Team[]>>('/teams');
  }

  async getTeam(teamId: string) {
    return this.request<ApiResponse<Team>>(`/teams/${teamId}`);
  }

  async updateTeam(
    teamId: string,
    data: {
      name: string;
      description?: string;
      pollDays: DaySelection;
    },
  ) {
    return this.request<ApiResponse<Team>>(`/teams/${teamId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async leaveTeam(teamId: string) {
    return this.request<ApiResponse<{ message: string }>>(
      `/teams/${teamId}/leave`,
      {
        method: 'POST',
      },
    );
  }

  async getTeamMembersWithVotes(teamId: string) {
    return this.request<
      ApiResponse<import('./api-types').TeamMemberWithLastVote[]>
    >(`/teams/${teamId}/members/with-votes`);
  }

  async getMoodEntriesByDate(teamId: string, date: string) {
    return this.request<ApiResponse<MoodEntry[]>>(
      `/mood-entries/date/${date}?teamId=${teamId}`,
    );
  }

  async createMoodEntry(data: CreateMoodEntryRequest) {
    return this.request<ApiResponse<MoodEntry>>('/mood-entries', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateMoodEntry(data: UpdateMoodEntryRequest) {
    return this.request<ApiResponse<MoodEntry>>('/mood-entries', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteMoodEntry(entryId: string) {
    return this.request<ApiResponse<{ message: string }>>(
      `/mood-entries?entryId=${entryId}`,
      {
        method: 'DELETE',
      },
    );
  }

  // Member API methods
  async getMemberData(
    teamId: string,
    memberId: string,
    cursor?: string,
    limit = 20,
  ) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    return this.request<{
      member: {
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
      };
      team: {
        id: string;
        name: string;
        description?: string;
      };
      moodEntries: Array<{
        id: string;
        userId: string;
        teamId: string;
        rating: string;
        comment?: string;
        visibility: 'public' | 'private';
        allowContact: boolean;
        entryDate: string;
        createdAt: string;
        updatedAt: string;
      }>;
      pagination: {
        hasMore: boolean;
        nextCursor: string | null;
      };
    }>(`/teams/${teamId}/members/${memberId}?${params.toString()}`);
  }

  // Download team mood entries as CSV (admin only)
  async downloadTeamMoodEntriesCSV(teamId: string): Promise<Blob> {
    const url = `${this.baseUrl}/teams/${teamId}/mood-entries/csv`;

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError({
          message:
            errorData.message || `HTTP error! status: ${response.status}`,
          status: response.status,
        });
      }

      return await response.blob();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError({
        message: 'Network error occurred',
        status: 0,
      });
    }
  }
}

// Custom error class
class ApiError extends Error {
  public status: number;

  constructor({ message, status }: { message: string; status: number }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const apiClient = new ApiClient();
export { ApiError };
