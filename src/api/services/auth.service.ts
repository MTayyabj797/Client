import axiosInstance, { type ApiSuccessResponse } from '../axios';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier';
  status: 'active' | 'inactive';
}

export interface LoginResult {
  user: AuthUser;
  tokens: {
    access_token: string;
    refresh_token: string;
    token_type: string;
  };
}

export const authService = {
  login: async (payload: LoginPayload): Promise<LoginResult> => {
    const { data } = await axiosInstance.post<ApiSuccessResponse<LoginResult>>('/auth/login', payload);
    return data.data;
  },
  me: async (): Promise<AuthUser> => {
    const { data } = await axiosInstance.get<ApiSuccessResponse<AuthUser>>('/auth/me');
    return data.data;
  },
};
