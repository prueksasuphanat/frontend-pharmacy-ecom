import { unitsApi } from "@/api";
import { useToast } from "@/composables";
import type { Unit, UnitListParams } from "@/types";
import { defineStore } from "pinia";

interface UnitState {
  units: Unit[];
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

export const useUnitStore = defineStore("unit", {
  state: (): UnitState => ({
    units: [],
    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading: false,
    error: null,
  }),

  getters: {
    activeUnits: (state) => state.units.filter((u) => u.is_active),
  },

  actions: {
    async getUnits(params?: UnitListParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        const response = await unitsApi.getUnits(params);
        this.units = response.data;
        this.pagination = response.pagination;
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async getUnitById(id: number): Promise<Unit | null> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        const unit = await unitsApi.getUnitById(id);
        const idx = this.units.findIndex((u) => u.id === id);
        if (idx !== -1) this.units[idx] = unit;
        return unit;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการดึงข้อมูลหน่วย");
        return null;
      } finally {
        this.isLoading = false;
      }
    },

    async createUnit(name: string): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        await unitsApi.createUnit({ name });
        toast.success("สร้างหน่วยสำเร็จ");
        await this.getUnits({ page: 1, limit: this.pagination.limit });
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการสร้างหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการสร้างหน่วย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async updateUnit(
      id: number,
      data: { name?: string; is_active?: boolean },
    ): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        const updated = await unitsApi.updateUnit(id, data);
        const idx = this.units.findIndex((u) => u.id === id);
        if (idx !== -1) this.units[idx] = { ...this.units[idx], ...updated };
        toast.success("อัปเดตหน่วยสำเร็จ");
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการอัปเดตหน่วย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async toggleUnitActive(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        const updated = await unitsApi.toggleUnitActive(id);
        const idx = this.units.findIndex((u) => u.id === id);
        if (idx !== -1)
          this.units[idx] = { ...updated, _count: this.units[idx]._count };
        toast.success(
          updated.is_active ? "เปิดใช้งานหน่วยสำเร็จ" : "ปิดใช้งานหน่วยสำเร็จ",
        );
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการเปลี่ยนสถานะหน่วย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async deleteUnit(id: number): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = getToast();
      try {
        await unitsApi.deleteUnit(id);
        toast.success("ลบหน่วยสำเร็จ");
        this.units = this.units.filter((u) => u.id !== id);
        this.pagination.total -= 1;
        if (this.units.length === 0 && this.pagination.page > 1) {
          await this.getUnits({
            page: this.pagination.page - 1,
            limit: this.pagination.limit,
          });
        }
        return true;
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "เกิดข้อผิดพลาดในการลบหน่วย";
        toast.error(this.error || "เกิดข้อผิดพลาดในการลบหน่วย");
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    clearUnits() {
      this.units = [];
      this.error = null;
    },
  },
});
