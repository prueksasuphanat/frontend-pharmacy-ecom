import { API_ENDPOINTS } from "@/constants";
import type { LoginCredentials, RegisterData, User } from "@/types";
import { apiClient } from "./client";

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export const authApi = {
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  register: (data: RegisterData) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("email", data.email);
    if (data.title) formData.append("title", data.title);
    if (data.first_name) formData.append("first_name", data.first_name);
    if (data.last_name) formData.append("last_name", data.last_name);
    if (data.birthdata) formData.append("birthdate", data.birthdata);
    if (data.phone) formData.append("phone", data.phone);
    if (data.address) formData.append("address", data.address);
    if (data.files && data.files.length > 0) {
      data.files.forEach((file) => formData.append("attachments", file));
    }
    if (data.profileImage) {
      formData.append("profile", data.profileImage);
    }
    return apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

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
