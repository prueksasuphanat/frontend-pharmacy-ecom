import { defineStore } from "pinia";
import type { User } from "@/types";
import { usersApi } from "@/api/users";
import type { GetUsersParams } from "@/api/users";

interface UsersState {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useUsersStore = defineStore("users", {
  state: (): UsersState => ({
    users: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
    },
    isLoading: false,
    error: null,
  }),

  getters: {
    totalUsers: (state) => state.pagination.total,
    activeUsers: (state) => state.users.filter((user) => user.is_active),
    verifiedUsers: (state) => state.users.filter((user) => user.is_verified),
    getUsersByRole: (state) => (role: string) =>
      state.users.filter((user) => user.role === role),
  },

  actions: {
    async getUsers(params?: GetUsersParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await usersApi.getAll(params);

        if (response.data.success) {
          this.users = response.data.data as unknown as User[];
          if (response.data.pagination) {
            this.pagination = response.data.pagination;
          }
          return true;
        } else {
          this.error = response.data.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้";
          return false;
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้";
        console.error("Error fetching users:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    toggleUserActiveLocal(userId: number) {
      const user = this.users.find((u) => u.id === userId);
      if (user) user.is_active = !user.is_active;
    },

    clearUsers() {
      this.users = [];
      this.error = null;
    },
  },
});
