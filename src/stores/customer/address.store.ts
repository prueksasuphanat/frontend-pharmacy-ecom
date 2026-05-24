import { defineStore } from "pinia";
import { addressesApi } from "@/api/customer/addresses";
import type { Address, AddressBody } from "@/types";
import { useToast } from "@/composables";

let toastInstance: ReturnType<typeof useToast> | null = null;
const getToast = () => {
  if (!toastInstance) toastInstance = useToast();
  return toastInstance;
};

export const useAddressStore = defineStore("customerAddress", {
  state: () => ({
    addresses: [] as Address[],
    isLoading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAddresses(): Promise<void> {
      const toast = getToast();
      this.isLoading = true;
      this.error = null;
      try {
        const res = await addressesApi.getAddresses();
        if (res.success) {
          this.addresses = res.data;
        }
      } catch (err: unknown) {
        this.error =
          (err as any).response?.data?.message || "ไม่สามารถดึงข้อมูลที่อยู่ได้";
        toast.error(this.error || "ไม่สามารถดึงข้อมูลที่อยู่ได้");
      } finally {
        this.isLoading = false;
      }
    },

    async createAddress(data: AddressBody): Promise<boolean> {
      const toast = getToast();
      this.isLoading = true;
      try {
        const res = await addressesApi.createAddress(data);
        if (res.success) {
          toast.success(res.message);
          await this.fetchAddresses();
          return true;
        }
      } catch (err: unknown) {
        toast.error((err as any).response?.data?.message || "ไม่สามารถเพิ่มที่อยู่ได้");
      } finally {
        this.isLoading = false;
      }
      return false;
    },

    async updateAddress(id: number, data: AddressBody): Promise<boolean> {
      const toast = getToast();
      this.isLoading = true;
      try {
        const res = await addressesApi.updateAddress(id, data);
        if (res.success) {
          toast.success(res.message);
          await this.fetchAddresses();
          return true;
        }
      } catch (err: unknown) {
        toast.error((err as any).response?.data?.message || "ไม่สามารถแก้ไขที่อยู่ได้");
      } finally {
        this.isLoading = false;
      }
      return false;
    },

    async deleteAddress(id: number): Promise<boolean> {
      const toast = getToast();
      this.isLoading = true;
      try {
        const res = await addressesApi.deleteAddress(id);
        if (res.success) {
          toast.success(res.message);
          await this.fetchAddresses();
          return true;
        }
      } catch (err: unknown) {
        toast.error((err as any).response?.data?.message || "ไม่สามารถลบที่อยู่ได้");
      } finally {
        this.isLoading = false;
      }
      return false;
    },

    async setAsDefault(id: number): Promise<boolean> {
      const toast = getToast();
      this.isLoading = true;
      try {
        const res = await addressesApi.setAsDefault(id);
        if (res.success) {
          toast.success(res.message);
          await this.fetchAddresses();
          return true;
        }
      } catch (err: unknown) {
        toast.error(
          (err as any).response?.data?.message || "ไม่สามารถตั้งเป็นที่อยู่หลักได้",
        );
      } finally {
        this.isLoading = false;
      }
      return false;
    },
  },
});
