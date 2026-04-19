import { apiClient } from "./client";
import type { User, LoginCredentials, RegisterData } from "@/types";
import { API_ENDPOINTS } from "@/constants";

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  verifyEmail: (token: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  verifyResetToken: (token: string) =>
    apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}/${token}`),

  resetPassword: (token: string, newPassword: string) =>
    apiClient.post(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
      new_password: newPassword,
    }),
};
