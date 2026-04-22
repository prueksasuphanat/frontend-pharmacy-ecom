import { defineStore } from "pinia";
import type {
  DefaultPriceLogEntry,
  DefaultPriceLogByProductEntry,
  SpecialPriceLogEntry,
  SpecialPriceLogByProductEntry,
  SpecialPriceLogByUserEntry,
  PricingLogProduct,
  PricingLogUser,
  PricingLogParams,
  PricingLogPagination,
  PricingType,
} from "@/types";
import { pricingLogsApi } from "@/api";
import { useToast } from "@/composables";

interface PricingLogState {
  defaultLogs: DefaultPriceLogEntry[];
  specialLogs: SpecialPriceLogEntry[];
  pricingType: PricingType;

  defaultProductLogs: DefaultPriceLogByProductEntry[];

  specialProductLogs: SpecialPriceLogByProductEntry[];
  specialUserLogs: SpecialPriceLogByUserEntry[];

  selectedProduct: (PricingLogProduct & { default_price: string }) | null;
  selectedUser: PricingLogUser | null;

  pagination: PricingLogPagination;
  modalPagination: PricingLogPagination;
  isLoading: boolean;
  isModalLoading: boolean;
  error: string | null;
}

export const usePricingLogStore = defineStore("pricingLog", {
  state: (): PricingLogState => ({
    defaultLogs: [],
    specialLogs: [],
    pricingType: "default",

    defaultProductLogs: [],
    specialProductLogs: [],
    specialUserLogs: [],

    selectedProduct: null,
    selectedUser: null,

    pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    modalPagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading: false,
    isModalLoading: false,
    error: null,
  }),

  actions: {
    async fetchLogs(params?: PricingLogParams): Promise<boolean> {
      this.isLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        if (this.pricingType === "default") {
          const res = await pricingLogsApi.getDefaultPriceLogs(params);
          this.defaultLogs = res.data.data;
          this.pagination = res.data.pagination;
        } else {
          const res = await pricingLogsApi.getSpecialPriceLogs(params);
          this.specialLogs = res.data.data;
          this.pagination = res.data.pagination;
        }
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกราคา";
        toast.error(this.error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchDefaultLogsByProduct(
      productId: number,
      params?: { page?: number; limit?: number },
    ): Promise<boolean> {
      this.isModalLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const res = await pricingLogsApi.getDefaultPriceLogsByProduct(
          productId,
          params,
        );
        this.selectedProduct = res.data.data.product;
        this.defaultProductLogs = res.data.data.logs;
        this.modalPagination = res.data.pagination;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกราคา";
        toast.error(this.error);
        return false;
      } finally {
        this.isModalLoading = false;
      }
    },

    // ─── Detail: special price by product ───────────────────────────────

    async fetchSpecialLogsByProduct(
      productId: number,
      params?: { page?: number; limit?: number; changed_at?: string },
    ): Promise<boolean> {
      this.isModalLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const res = await pricingLogsApi.getSpecialPriceLogsByProduct(
          productId,
          params,
        );
        this.selectedProduct = res.data.data.product;
        this.specialProductLogs = res.data.data.logs;
        this.modalPagination = res.data.pagination;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกราคา";
        toast.error(this.error);
        return false;
      } finally {
        this.isModalLoading = false;
      }
    },

    async fetchSpecialLogsByUser(
      userId: number,
      params?: {
        page?: number;
        limit?: number;
        product_id?: number;
        changed_at?: string;
      },
    ): Promise<boolean> {
      this.isModalLoading = true;
      this.error = null;
      const toast = useToast();

      try {
        const res = await pricingLogsApi.getSpecialPriceLogsByUser(
          userId,
          params,
        );
        this.selectedUser = res.data.data.user;
        this.specialUserLogs = res.data.data.logs;
        this.modalPagination = res.data.pagination;
        return true;
      } catch (err: any) {
        this.error =
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการดึงข้อมูลบันทึกราคา";
        toast.error(this.error);
        return false;
      } finally {
        this.isModalLoading = false;
      }
    },

    setPricingType(type: PricingType) {
      this.pricingType = type;
      this.pagination.page = 1;
      this.defaultLogs = [];
      this.specialLogs = [];
    },

    clearModal() {
      this.defaultProductLogs = [];
      this.specialProductLogs = [];
      this.specialUserLogs = [];
      this.selectedProduct = null;
      this.selectedUser = null;
      this.modalPagination = { page: 1, limit: 10, total: 0, totalPages: 1 };
    },
  },
});
