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

    async getUserById(id) {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await usersApi.getById(id);

        if (response.data.success) {
          this.selectedUser = response.data.data as unknown as User[];

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

    async adminGetUserById(id: number): Promise<User | null> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await usersApi.adminGetById(id);

        if (response.data.success) {
          const updated = response.data.data as unknown as User;
          // Sync into local list if present
          const idx = this.users.findIndex((u) => u.id === id);
          if (idx !== -1) this.users[idx] = updated;
          return updated;
        } else {
          this.error = response.data.message || "ไม่สามารถดึงข้อมูลผู้ใช้ได้";
          return null;
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้";
        console.error("Error fetching user by id:", err);
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async adminUpdateUserById(
      id: number,
      payload: import("@/api/users").AdminUpdateUserPayload,
    ): Promise<boolean> {
      this.isLoading = true;
      this.error = null;

      try {
        const response = await usersApi.adminUpdateById(id, payload);

        if (response.data.success) {
          // Update user in local state
          const idx = this.users.findIndex((u) => u.id === id);
          if (idx !== -1) {
            this.users[idx] = {
              ...this.users[idx],
              ...(response.data.data as unknown as User),
            };
          }
          return true;
        } else {
          this.error =
            response.data.message || "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้";
          return false;
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้";
        console.error("Error updating user:", err);
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
