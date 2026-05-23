import { authApi } from "@/api";
import { apiClient } from "@/api/client";
import {
  customerProfileApi,
  type UpdateProfileData,
} from "@/api/customer/profile";
import type { RegisterData, User } from "@/types";
import { defineStore } from "pinia";

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
    isAdmin: (state) =>
      ["ADMIN", "PHARMACIST", "DEMO"].includes(state.currentUser?.role ?? ""),
    isVerified: (state) => state.currentUser?.is_verified ?? false,
    userRole: (state) => state.currentUser?.role ?? "CUSTOMER",
    roleName: (state) => {
      const map: Record<string, string> = {
        ADMIN: "ผู้ดูแลระบบ",
        PHARMACIST: "เภสัชกร",
        CUSTOMER: "ลูกค้า",
        DEMO: "Demo",
      };
      return (
        map[state.currentUser?.role ?? ""] ?? state.currentUser?.role ?? ""
      );
    },
    fullName: (state) => {
      if (!state.currentUser) return "";
      const parts = [
        state.currentUser.title,
        state.currentUser.first_name,
        state.currentUser.last_name,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();
      return (
        parts || state.currentUser.pmc_name || state.currentUser.username || ""
      );
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

        localStorage.setItem("access_token", response.data.data.accessToken);
        localStorage.setItem("refresh_token", response.data.data.refreshToken);

        const { useNotificationStore } =
          await import("@/stores/customer/notification.store");
        useNotificationStore().startWs(response.data.data.accessToken);

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

        if (this.accessToken) {
          const { useNotificationStore } =
            await import("@/stores/customer/notification.store");
          useNotificationStore().startWs(this.accessToken);
        }

        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "ดึงข้อมูลผู้ใช้ไม่สำเร็จ";

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

        localStorage.setItem("access_token", response.data.data.accessToken);
        localStorage.setItem("refresh_token", response.data.data.refreshToken);

        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "รีเฟรช token ไม่สำเร็จ";

        this.logout();
        return false;
      }
    },

    async register(params: RegisterData): Promise<boolean> {
      try {
        this.isLoading = true;

        const response = await authApi.register(params);

        return true;
      } catch (err: any) {
        this.error = err.response?.data?.message || "ลงทะเบียนไม่สำเร็จ";
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      import("@/stores/customer/notification.store").then(
        ({ useNotificationStore }) => {
          useNotificationStore().reset();
        },
      );
      this.currentUser = null;
      this.accessToken = null;
      this.refreshToken = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },

    async logoutWithApi(): Promise<void> {
      try {
        const { useNotificationStore } =
          await import("@/stores/customer/notification.store");
        useNotificationStore().stopWs();
      } catch {}

      try {
        await authApi.logout();
      } catch {
      } finally {
        this.currentUser = null;
        this.accessToken = null;
        this.refreshToken = null;
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    },

    async updateProfile(
      data: UpdateProfileData,
    ): Promise<{ success: boolean; message: string }> {
      this.isLoading = true;
      this.error = null;

      const snapshot = this.currentUser ? { ...this.currentUser } : null;

      if (this.currentUser) {
        this.currentUser = {
          ...this.currentUser,
          username: data.username ?? this.currentUser.username,
          first_name: data.first_name ?? this.currentUser.first_name,
          last_name: data.last_name ?? this.currentUser.last_name,
          phone: data.phone ?? this.currentUser.phone,
          birthdate:
            data.birthdate !== undefined
              ? (data.birthdate ?? null)
              : this.currentUser.birthdate,
          address:
            data.address !== undefined
              ? (data.address ?? null)
              : this.currentUser.address,
        };
      }

      try {
        const response = await customerProfileApi.updateProfile(data);

        if (this.currentUser && response.data.data.profile_image) {
          this.currentUser = {
            ...this.currentUser,
            profile_image: response.data.data.profile_image,
          };
        }

        return { success: true, message: response.data.message };
      } catch (err: any) {
        if (snapshot) this.currentUser = snapshot;
        const message = err.response?.data?.message || "อัปเดตข้อมูลไม่สำเร็จ";
        this.error = message;
        return { success: false, message };
      } finally {
        this.isLoading = false;
      }
    },
  },
});
