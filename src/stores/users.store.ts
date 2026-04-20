import { defineStore } from "pinia";
import type { User } from "@/types";
import { usersApi } from "@/api/users";
import type { GetUsersParams } from "@/api/users";
import { useToast } from "@/composables";

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

    async getUserById(id: number | string) {
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
      const toast = useToast();

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
          toast.success("อัปเดตข้อมูลผู้ใช้สำเร็จ");
          return true;
        } else {
          this.error =
            response.data.message || "ไม่สามารถอัปเดตข้อมูลผู้ใช้ได้";
          toast.error(this.error);
          return false;
        }
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้";
        toast.error(this.error);
        console.error("Error updating user:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleActive(id: number | string) {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();
      try {
        const response = await usersApi.toggleActive(id);

        if (response.data.success) {
          const updated = response.data.data;
          const idx = this.users.findIndex((u) => u.id === id);
          if (idx !== -1) {
            this.users[idx] = {
              ...this.users[idx],
              is_active: updated.is_active,
              updated_at: updated.updated_at,
            };
          }
          const statusText = updated.is_active ? "เปิดใช้งาน" : "ปิดใช้งาน";
          toast.success(`${statusText}ผู้ใช้สำเร็จ`);
          return true;
        }

        return false;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้";
        toast.error(this.error);
        console.error("Error updating user:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async adminChangeRole(id: number | string, role: string) {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();
      try {
        const response = await usersApi.changeRole(id, role);

        if (response.data.success) {
          const updated = response.data.data;
          const idx = this.users.findIndex((u) => u.id === id);
          if (idx !== -1) {
            this.users[idx] = {
              ...this.users[idx],
              role: updated.role,
              updated_at: updated.updated_at,
            };
          }
          toast.success(response.data.message || "อัปเดตบทบาทผู้ใช้สำเร็จ");
          return true;
        }

        return false;
      } catch (err: any) {
        this.error =
          err.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะผู้ใช้ได้";
        toast.error(this.error);
        console.error("Error updating user:", err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    clearUsers() {
      this.users = [];
      this.error = null;
    },
  },
});
