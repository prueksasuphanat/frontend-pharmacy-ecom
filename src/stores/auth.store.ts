import { defineStore } from "pinia";
import type { User } from "@/types";
import { apiClient } from "@/api/client";
import { authApi } from "@/api";
import type { RegisterData } from "@/types";

interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

interface ProfileResponse {
  success: boolean;
  data: User;
}

interface RefreshTokenResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    currentUser: null as User | null,
    accessToken: localStorage.getItem("access_token") as string | null,
    refreshToken: localStorage.getItem("refresh_token") as string | null,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.accessToken && !!state.currentUser,
    isAdmin: (state) => state.currentUser?.role === "ADMIN",
    isVerified: (state) => state.currentUser?.is_verified ?? false,
    userRole: (state) => state.currentUser?.role ?? "CUSTOMER",
    fullName: (state) => {
      if (!state.currentUser) return "";
      return `${state.currentUser.first_name} ${state.currentUser.last_name}`.trim();
    },
  },

  actions: {
    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await apiClient.post<LoginResponse>("/auth/login", {
          username,
          password,
        });

        this.accessToken = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;
        this.currentUser = response.data.data.user;

        // Save tokens to localStorage
        localStorage.setItem("access_token", response.data.data.accessToken);
        localStorage.setItem("refresh_token", response.data.data.refreshToken);

        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "เข้าสู่ระบบไม่สำเร็จ";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProfile(): Promise<boolean> {
      if (!this.accessToken) {
        return false;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const response = await apiClient.get<ProfileResponse>("/auth/me");
        this.currentUser = response.data.data;
        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "ดึงข้อมูลผู้ใช้ไม่สำเร็จ";
        // If token is invalid, clear it
        if (err.response?.status === 401) {
          this.accessToken = null;
          this.refreshToken = null;
          this.currentUser = null;
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async refreshAccessToken(): Promise<boolean> {
      if (!this.refreshToken) {
        return false;
      }

      try {
        const response = await apiClient.post<RefreshTokenResponse>(
          "/auth/refresh",
          {
            refreshToken: this.refreshToken,
          },
        );

        this.accessToken = response.data.data.accessToken;
        this.refreshToken = response.data.data.refreshToken;

        // Update tokens in localStorage
        localStorage.setItem("access_token", response.data.data.accessToken);
        localStorage.setItem("refresh_token", response.data.data.refreshToken);

        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "รีเฟรช token ไม่สำเร็จ";
        // If refresh fails, clear everything
        this.logout();
        return false;
      }
    },

    async register(params: RegisterData): Promise<boolean> {
      try {
        this.isLoading = true;

        const response = await authApi.register(params);

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || "ลงทะเบียนไม่สำเร็จ";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.currentUser = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
  },
});
