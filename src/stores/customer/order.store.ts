import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { ordersApi, type Order, type OrderStatus, type CreateOrderRequest } from "@/api/customer/orders";

export const useOrderStore = defineStore("order", () => {
  const orders = ref<Order[]>([]);
  const currentOrder = ref<Order | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const pagination = ref({ total: 0, page: 1, limit: 10, totalPages: 1 });

  const hasOrders = computed(() => orders.value.length > 0);

  // ==========================================
  // Fetch all orders
  // ==========================================
  async function fetchOrders(params?: { page?: number; status?: OrderStatus }): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await ordersApi.getAll(params);
      orders.value = res.data.data;
      pagination.value = res.data.pagination;
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "โหลดคำสั่งซื้อไม่ได้";
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // Fetch single order
  // ==========================================
  async function fetchOrder(id: number): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await ordersApi.getById(id);
      currentOrder.value = res.data.data;
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ไม่พบคำสั่งซื้อ";
      currentOrder.value = null;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // Create order
  // ==========================================
  async function createOrder(data: CreateOrderRequest): Promise<Order> {
    isLoading.value = true;
    error.value = null;
    try {
      const res = await ordersApi.create(data);
      const order = res.data.data;
      orders.value.unshift(order);
      currentOrder.value = order;
      return order;
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "สร้างคำสั่งซื้อไม่ได้";
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  // ==========================================
  // Cancel order
  // ==========================================
  async function cancelOrder(id: number, reason?: string): Promise<void> {
    try {
      const res = await ordersApi.cancel(id, reason);
      const updated = res.data.data;
      const idx = orders.value.findIndex((o) => o.id === id);
      if (idx !== -1) orders.value[idx] = updated;
      if (currentOrder.value?.id === id) currentOrder.value = updated;
    } catch (err: any) {
      error.value = err.response?.data?.message ?? "ยกเลิกคำสั่งซื้อไม่ได้";
      throw err;
    }
  }

  function reset() {
    orders.value = [];
    currentOrder.value = null;
    error.value = null;
  }

  return {
    orders,
    currentOrder,
    isLoading,
    error,
    pagination,
    hasOrders,
    fetchOrders,
    fetchOrder,
    createOrder,
    cancelOrder,
    reset,
  };
});
