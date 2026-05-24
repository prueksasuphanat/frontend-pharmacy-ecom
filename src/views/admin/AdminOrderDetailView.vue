<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useToast } from "vue-toastification";
import { adminOrdersApi } from "@/api/admin/orders";
import type { AdminOrder } from "@/types";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  Loader2,
} from "lucide-vue-next";
import { formatPrice, formatDateTime } from "@/utils/format";

const route = useRoute();
const toast = useToast();
const orderId = parseInt(route.params.id as string, 10);
const order = ref<AdminOrder | null>(null);
const loading = ref(true);
const isUpdating = ref(false);

onMounted(async () => {
  try {
    const res = await adminOrdersApi.getById(orderId);
    order.value = res.data.data;
  } catch {
    toast.error("ไม่สามารถโหลดข้อมูลคำสั่งซื้อ");
  } finally {
    loading.value = false;
  }
});

const nextStatusMap: Record<string, string[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

async function updateStatus(status: string) {
  if (!order.value) return;
  isUpdating.value = true;
  try {
    const res = await adminOrdersApi.updateStatus(orderId, status);
    order.value = res.data.data;
    toast.success(res.data.message);
  } catch (err: any) {
    toast.error(err.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะได้");
  } finally {
    isUpdating.value = false;
  }
}

function fmt(n: number) {
  return formatPrice(n);
}
function fmtDate(d: string) {
  return formatDateTime(d);
}

const statusCls: Record<string, string> = {
  PENDING: "badge-yellow",
  CONFIRMED: "badge-blue",
  SHIPPED: "badge-teal",
  COMPLETED: "badge-green",
  CANCELLED: "badge-red",
};
const statusLbl: Record<string, string> = {
  PENDING: "รอดำเนินการ",
  CONFIRMED: "ยืนยันแล้ว",
  SHIPPED: "จัดส่งแล้ว",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

function customerName(o: AdminOrder) {
  if (o.user.first_name || o.user.last_name) {
    return `${o.user.first_name || ""} ${o.user.last_name || ""}`.trim();
  }
  return o.user.username || o.user.email || "-";
}
</script>

<template>
  <div>
    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <div v-else-if="!order" class="text-center py-20">
      <Package class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
      <p class="text-secondary-400 mb-4">ไม่พบคำสั่งซื้อ</p>
      <RouterLink to="/admin/orders" class="btn-outline text-sm"
        >กลับรายการ</RouterLink
      >
    </div>

    <div v-else>
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/admin/orders" class="btn-ghost p-2"
          ><ArrowLeft class="w-4 h-4"
        /></RouterLink>
        <div>
          <h1 class="text-xl font-bold text-secondary-900 font-mono">
            #{{ order.id }}
          </h1>
          <p class="text-sm text-secondary-400">
            {{ fmtDate(order.created_at) }}
          </p>
        </div>
        <span :class="['badge ml-2', statusCls[order.status]]">{{
          statusLbl[order.status]
        }}</span>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">
          <div class="card">
            <h3
              class="font-bold text-secondary-900 mb-4 flex items-center gap-2"
            >
              <Package class="w-4 h-4 text-primary-600" /> จัดการสถานะ
            </h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="nextS in nextStatusMap[order.status]"
                :key="nextS"
                @click="updateStatus(nextS)"
                :disabled="isUpdating"
                :class="[
                  'btn text-sm gap-1.5',
                  nextS === 'CANCELLED'
                    ? 'btn-danger'
                    : nextS === 'CONFIRMED'
                      ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-medium'
                      : nextS === 'SHIPPED'
                        ? 'bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-4 py-2.5 font-medium'
                        : 'btn-primary',
                ]"
              >
                <Loader2 v-if="isUpdating" class="w-4 h-4 animate-spin" />
                <component
                  v-else
                  :is="
                    nextS === 'CANCELLED'
                      ? XCircle
                      : nextS === 'SHIPPED'
                        ? Truck
                        : CheckCircle
                  "
                  class="w-4 h-4"
                />
                {{
                  {
                    CONFIRMED: "✅ ยืนยันคำสั่งซื้อ",
                    SHIPPED: "🚚 จัดส่งแล้ว",
                    COMPLETED: "🎉 สำเร็จ",
                    CANCELLED: "❌ ยกเลิก",
                  }[nextS]
                }}
              </button>
              <p
                v-if="nextStatusMap[order.status].length === 0"
                class="text-sm text-secondary-400"
              >
                ไม่มีการเปลี่ยนสถานะเพิ่มเติม
              </p>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4 text-sm">
              รายการสินค้า
            </h3>
            <div class="divide-y divide-secondary-50">
              <div
                v-for="item in order.items"
                :key="item.id"
                class="flex gap-3 py-3"
              >
                <div
                  class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center text-xs text-primary-500 font-semibold p-1 leading-snug text-center shrink-0"
                >
                  {{ item.product_name.slice(0, 12) }}
                </div>
                <div class="flex-1">
                  <p class="font-medium text-secondary-900 text-sm">
                    {{ item.product_name }}
                  </p>
                  <p class="text-xs text-secondary-400">
                    หน่วย: {{ item.unit_name }}
                    <span
                      v-if="item.is_special_price"
                      class="text-primary-600 ml-1"
                    >
                      (ราคาพิเศษ)
                    </span>
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold">
                    ฿{{ fmt(item.unit_price * item.quantity) }}
                  </p>
                  <p class="text-xs text-secondary-400">
                    x{{ item.quantity }} @ ฿{{ fmt(item.unit_price) }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-4 text-sm">
              ประวัติสถานะ
            </h3>
            <div class="space-y-3">
              <div
                v-for="(log, i) in order.status_logs"
                :key="log.id"
                class="flex gap-3"
              >
                <div class="flex flex-col items-center">
                  <div class="w-2 h-2 bg-primary-600 rounded-full mt-1" />
                  <div
                    v-if="i < order.status_logs.length - 1"
                    class="w-0.5 flex-1 bg-secondary-100 my-1"
                  />
                </div>
                <div class="pb-2">
                  <p class="text-sm font-medium text-secondary-800">
                    {{ statusLbl[log.to_status] || log.to_status }}
                  </p>
                  <p v-if="log.note" class="text-xs text-secondary-500">
                    {{ log.note }}
                  </p>
                  <p class="text-xs text-secondary-300">
                    {{ fmtDate(log.created_at) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              ข้อมูลลูกค้า
            </h3>
            <p class="text-sm font-medium text-secondary-900 mb-0.5">
              {{ customerName(order) }}
            </p>
            <p class="text-sm text-secondary-500">{{ order.user.email }}</p>
            <p v-if="order.user.phone" class="text-sm text-secondary-500">
              {{ order.user.phone }}
            </p>
          </div>
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              ที่อยู่จัดส่ง
            </h3>
            <div class="text-sm text-secondary-600 space-y-0.5">
              <p class="font-medium text-secondary-900">
                {{ order.shipping_address.recipient }}
              </p>
              <p>{{ order.shipping_address.phone }}</p>
              <p>{{ order.shipping_address.address }}</p>
              <p>
                {{ order.shipping_address.district }}
                {{ order.shipping_address.province }}
                {{ order.shipping_address.postal_code }}
              </p>
            </div>
          </div>
          <div v-if="order.note" class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              หมายเหตุ
            </h3>
            <p class="text-sm text-secondary-600">{{ order.note }}</p>
          </div>
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              สรุปราคา
            </h3>
            <div class="space-y-1.5 text-sm">
              <div class="flex justify-between text-secondary-600">
                <span>สินค้า</span><span>฿{{ fmt(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-secondary-600">
                <span>ค่าจัดส่ง</span
                ><span>{{
                  order.shipping_fee === 0
                    ? "ฟรี"
                    : "฿" + fmt(order.shipping_fee)
                }}</span>
              </div>
              <div class="flex justify-between font-bold border-t pt-2">
                <span>รวม</span
                ><span class="text-primary-700"
                  >฿{{ fmt(order.total_amount) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
