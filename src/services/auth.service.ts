import apiService from './api.service';

export interface IUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  username: string;
  email: string;
  password: string;
  full_name: string;
}

export interface ILoginResponse {
  token: string;
  user: IUser;
}

class AuthService {
  async login(credentials: ILoginRequest): Promise<ILoginResponse> {
    const response = await apiService.post<ILoginResponse>('/auth/login', credentials);
    apiService.setAuthToken(response.token);
    return response;
  }

  async loginOrRegister(credentials: ILoginRequest): Promise<ILoginResponse> {
    const response = await apiService.post<ILoginResponse>('/auth/login-or-register', credentials);
    apiService.setAuthToken(response.token);
    return response;
  }

  async register(data: IRegisterRequest): Promise<ILoginResponse> {
    const response = await apiService.post<ILoginResponse>('/auth/register', data);
    apiService.setAuthToken(response.token);
    return response;
  }

  async getProfile(): Promise<IUser> {
    return await apiService.get<IUser>('/profile');
  }

  async updateProfile(data: { full_name?: string; avatar?: string }): Promise<IUser> {
    return await apiService.put<IUser>('/profile', data);
  }

  logout(): void {
    apiService.clearAuthToken();
  }

  isAuthenticated(): boolean {
    return apiService.hasAuthToken();
  }
}

export default new AuthService();
