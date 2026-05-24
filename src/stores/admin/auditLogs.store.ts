import { auditLogsApi } from "@/api";
import { useToast } from "@/composables";
import type {
  UserSessionLogEntry,
  ProductViewLogEntry,
  UserSessionLogParams,
  ProductViewLogParams,
} from "@/types";
import { defineStore } from "pinia";

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

interface AuditLogState {
  userSessionLogs: UserSessionLogEntry[];
  productViewLogs: ProductViewLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

export const useAuditLogStore = defineStore("auditLog", {
  state: (): AuditLogState => ({
    userSessionLogs: [],
    productViewLogs: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading: false,
    error: null,
  }),

  actions: {
    async fetchUserSessionLogs(params?: UserSessionLogParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const res = await auditLogsApi.getUserSessionLogs(params);
        this.userSessionLogs = res.data.data;
        this.pagination = res.data.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกประวัติการเข้าใช้งาน";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกประวัติการเข้าใช้งาน");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchProductViewLogs(params?: ProductViewLogParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const res = await auditLogsApi.getProductViewLogs(params);
        this.productViewLogs = res.data.data;
        this.pagination = res.data.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกประวัติการชมสินค้า";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกประวัติการชมสินค้า");
        return false;
      } finally {
        this.isLoading = false;
      }
    },
  },
});
