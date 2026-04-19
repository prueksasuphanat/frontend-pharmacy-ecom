/**
 * Authentication API service
 *
 * Provides methods for authentication-related API operations.
 * **Validates: Requirements 2.4**
 */

import { apiClient } from "./client";
import type { User, LoginCredentials, RegisterData } from "@/types";
import { API_ENDPOINTS } from "@/constants";

/**
 * Authentication response interface
 */
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

/**
 * Authentication API service object
 */
export const authApi = {
  /**
   * Login with email and password
   * @param credentials - Login credentials (email, password)
   * @returns Promise with authentication response
   */
  login: (credentials: LoginCredentials) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials),

  /**
   * Register a new user account
   * @param data - Registration data (email, password, full_name)
   * @returns Promise with authentication response
   */
  register: (data: RegisterData) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

  /**
   * Logout current user
   * @returns Promise with logout confirmation
   */
  logout: () => apiClient.post(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Refresh authentication token
   * @param refreshToken - Refresh token
   * @returns Promise with new authentication tokens
   */
  refresh: (refreshToken: string) =>
    apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REFRESH, { refreshToken }),

  /**
   * Verify email address
   * @param token - Email verification token
   * @returns Promise with verification result
   */
  verifyEmail: (token: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token }),

  /**
   * Request password reset - ส่งอีเมลพร้อม reset link
   * @param email - User email address
   * @returns Promise with reset request confirmation
   */
  forgotPassword: (email: string) =>
    apiClient.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /**
   * Verify reset token - ตรวจสอบว่า token ยังใช้ได้หรือไม่
   * @param token - Password reset token
   * @returns Promise with token validation result
   */
  verifyResetToken: (token: string) =>
    apiClient.get(`${API_ENDPOINTS.AUTH.VERIFY_RESET_TOKEN}/${token}`),

  /**
   * Reset password with token - ตั้งรหัสผ่านใหม่
   * @param token - Password reset token
   * @param newPassword - New password
   * @returns Promise with reset confirmation
   */
  resetPassword: (token: string, newPassword: string) =>
    apiClient.post(`${API_ENDPOINTS.AUTH.RESET_PASSWORD}/${token}`, {
      new_password: newPassword,
    }),
};
