import { defineStore } from "pinia";
import type { Vendor, VendorListParams } from "@/types";
import { vendorsApi } from "@/api";
import { useToast } from "@/composables";

interface VendorState {
  vendors: Vendor[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  isLoading: boolean;
  error: string | null;
}

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

export const useVendorStore = defineStore("vendor", {
  state: (): VendorState => ({
    vendors: [],
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
    totalVendors: (state) => state.pagination.total,
    activeVendors: (state) =>
      state.vendors.filter((v) => v.is_active),
    inactiveVendors: (state) =>
      state.vendors.filter((v) => !v.is_active),
  },

  actions: {
    async getVendors(params?: VendorListParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const response = await vendorsApi.getVendors(params);

        this.vendors = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้จำหน่าย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getVendorById(id: number): Promise<Vendor | null> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const vendor = await vendorsApi.getVendorById(id);

        const idx = this.vendors.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.vendors[idx] = vendor;
        }

        return vendor;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลผู้จำหน่าย");
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createVendor(data: {
      name: string;
      seller_code?: string;
      address?: string;
      phone?: string;
    }): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        await vendorsApi.createVendor(data);

        toast.success("สร้างผู้จำหน่ายสำเร็จ");

        await this.getVendors({
          page: 1,
          limit: this.pagination.limit,
        });

        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการสร้างผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการสร้างผู้จำหน่าย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async updateVendor(
      id: number,
      data: {
        name: string;
        seller_code?: string;
        address?: string;
        phone?: string;
        is_active: boolean;
      },
    ): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const updated = await vendorsApi.updateVendor(id, data);

        const idx = this.vendors.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.vendors[idx] = {
            ...this.vendors[idx],
            ...updated,
          };
        }

        toast.success("อัปเดตผู้จำหน่ายสำเร็จ");
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการอัปเดตผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการอัปเดตผู้จำหน่าย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleVendorActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        const updated = await vendorsApi.toggleVendorActive(id);

        const idx = this.vendors.findIndex((v) => v.id === id);
        if (idx !== -1) {
          this.vendors[idx] = {
            ...updated,
            _count: this.vendors[idx]._count,
          };
        }

        toast.success(
          updated.is_active
            ? "เปิดใช้งานผู้จำหน่ายสำเร็จ"
            : "ปิดใช้งานผู้จำหน่ายสำเร็จ",
        );
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message ||
          "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะผู้จำหน่าย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteVendor(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();

      try {
        await vendorsApi.deleteVendor(id);

        toast.success("ลบผู้จำหน่ายสำเร็จ");

        this.vendors = this.vendors.filter((v) => v.id !== id);
        this.pagination.total -= 1;

        if (this.vendors.length === 0 && this.pagination.page > 1) {
          await this.getVendors({
            page: this.pagination.page - 1,
            limit: this.pagination.limit,
          });
        }

        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการลบผู้จำหน่าย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการลบผู้จำหน่าย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    clearVendors() {
      this.vendors = [];
      this.error = null;
    },
  },
});
