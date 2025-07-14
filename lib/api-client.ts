import { ApiResponse, Team } from './api-types';

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
  async createTeam(data: { name: string; description?: string }) {
    return this.request<ApiResponse<Team>>('/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getTeams() {
    return this.request<ApiResponse<Team[]>>('/teams');
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
