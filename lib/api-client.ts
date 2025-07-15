import {
  ApiResponse,
  Team,
  DaySelection,
  MoodEntriesResponse,
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

  // Invitations API methods
  async sendInvitations(data: { teamId: string; emails: string[] }) {
    const results = [];
    for (const email of data.emails) {
      try {
        const result = await this.request<
          ApiResponse<{
            message: string;
            invitation: { id: string; email: string; expiresAt: string };
          }>
        >('/invitations', {
          method: 'POST',
          body: JSON.stringify({ teamId: data.teamId, email: email.trim() }),
        });
        results.push({ email, success: true, result });
      } catch (error) {
        results.push({ email, success: false, error });
      }
    }
    return results;
  }

  // Mood Entries API methods
  async getTodayMoodEntries(teamId: string) {
    return this.request<ApiResponse<MoodEntriesResponse>>(
      `/mood-entries/today?teamId=${teamId}`,
    );
  }

  async getMoodEntriesByDate(teamId: string, date: string) {
    return this.request<ApiResponse<MoodEntriesResponse>>(
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
