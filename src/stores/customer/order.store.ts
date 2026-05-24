import { defineStore } from "pinia";
import { ordersApi } from "@/api/customer/orders";
import type { Order, OrderStatus, CreateOrderRequest } from "@/types";
import { useCartStore } from "@/stores/customer/cart.store";

export const useOrderStore = defineStore("order", {
  state: () => ({
    orders: [] as Order[],
    currentOrder: null as Order | null,
    isLoading: false,
    error: null as string | null,
    pagination: { total: 0, page: 1, limit: 10, totalPages: 1 },
  }),

  getters: {
    hasOrders: (state) => state.orders.length > 0,
  },

  actions: {
    async fetchOrders(params?: {
      page?: number;
      status?: OrderStatus;
    }): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await ordersApi.getAll(params);
        this.orders = res.data.data;
        this.pagination = res.data.pagination;
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "โหลดคำสั่งซื้อไม่ได้";
      } finally {
        this.isLoading = false;
      }
    },

    async fetchOrder(id: number): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await ordersApi.getById(id);
        this.currentOrder = res.data.data;
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ไม่พบคำสั่งซื้อ";
        this.currentOrder = null;
      } finally {
        this.isLoading = false;
      }
    },

    async createOrder(data: CreateOrderRequest): Promise<Order> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await ordersApi.create(data);
        const order = res.data.data;
        this.orders.unshift(order);
        this.currentOrder = order;

        const cartStore = useCartStore();
        cartStore.reset();
        return order;
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "สร้างคำสั่งซื้อไม่ได้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async cancelOrder(id: number, reason?: string): Promise<void> {
      this.isLoading = true;
      this.error = null;
      try {
        const res = await ordersApi.cancel(id, reason);
        const updated = res.data.data;
        const idx = this.orders.findIndex((o) => o.id === id);
        if (idx !== -1) this.orders[idx] = updated;
        if (this.currentOrder?.id === id) this.currentOrder = updated;
      } catch (err: unknown) {
        this.error = (err as any).response?.data?.message ?? "ยกเลิกคำสั่งซื้อไม่ได้";
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    reset() {
      this.orders = [];
      this.currentOrder = null;
      this.error = null;
    },
  },
});
