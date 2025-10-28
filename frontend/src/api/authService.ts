import { apiWithRetry } from './config';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  firstname: string;
  lastname: string;
}

export interface UserProfile {
  role?: 'admin' | 'user';
  isActive?: boolean;
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
}

interface AuthResponse {
  user: UserProfile;
  token: string;
  refreshToken: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiWithRetry.post<AuthResponse>('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiWithRetry.post<AuthResponse>('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('refresh_token', response.data.refreshToken);
    }
    return response.data;
  }

  async getUserProfile(): Promise<{ user: UserProfile }> {
    const response = await apiWithRetry.get<{ user: UserProfile }>('/user/profile');
    return response.data;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<{ user: UserProfile }> {
    const response = await apiWithRetry.patch<{ user: UserProfile }>('/user/profile', data);
    return response.data;
  }

  async updateUserStatus(userId: string, isActive: boolean, token: string): Promise<any> {
    const response = await apiWithRetry.patch(`/user/${userId}/status`, 
      { isActive }, 
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) return null;

      const response = await apiWithRetry.post<{ token: string }>('/auth/refresh', { refreshToken });
      const newToken = response.data.token;
      localStorage.setItem('auth_token', newToken);
      return newToken;
    } catch (error) {
      this.logout();
      return null;
    }
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login?session=expired';
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  }
}

export const authService = new AuthService();