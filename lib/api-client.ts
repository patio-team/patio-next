import {
  ApiResponse,
  MembersPagination,
  TeamMemberWithLastVote,
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

  async getTeamMembersWithVotes(teamId: string) {
    return this.request<ApiResponse<TeamMemberWithLastVote[]>>(
      `/teams/${teamId}/members/with-votes`,
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

    return this.request<MembersPagination>(
      `/teams/${teamId}/members/${memberId}?${params.toString()}`,
    );
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
