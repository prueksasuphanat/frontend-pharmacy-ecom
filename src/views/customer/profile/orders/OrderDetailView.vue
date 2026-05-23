<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { useToast } from "vue-toastification";
import { ordersApi, type Order } from "@/api/customer/orders";
import {
  ArrowLeft,
  X,
  CheckCircle,
  Clock,
  Truck,
  Package,
  Loader2,
} from "lucide-vue-next";
import { BaseTextarea } from "@/components/ui";
import { formatPrice, formatDateTime } from "@/utils/format";

const route = useRoute();
const toast = useToast();
const orderId = parseInt(route.params.id as string, 10);

const order = ref<Order | null>(null);
const loading = ref(true);
const cancelReason = ref("");
const showCancelModal = ref(false);
const isCancelling = ref(false);

onMounted(async () => {
  try {
    const res = await ordersApi.getById(orderId);
    order.value = res.data.data;
  } catch {
    toast.error("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
  } finally {
    loading.value = false;
  }
});

function fmt(n: number) {
  return formatPrice(n);
}
function fmtDate(d: string) {
  return formatDateTime(d);
}

const statusSteps = ["PENDING", "CONFIRMED", "SHIPPED", "COMPLETED"];
const statusConfig: Record<
  string,
  { label: string; icon: any; color: string }
> = {
  PENDING: {
    label: "รอดำเนินการ",
    icon: Clock,
    color: "text-yellow-600 bg-yellow-100",
  },
  CONFIRMED: {
    label: "ยืนยันแล้ว",
    icon: CheckCircle,
    color: "text-blue-600 bg-blue-100",
  },
  SHIPPED: {
    label: "จัดส่งแล้ว",
    icon: Truck,
    color: "text-teal-600 bg-teal-100",
  },
  COMPLETED: {
    label: "สำเร็จ",
    icon: Package,
    color: "text-green-600 bg-green-100",
  },
  CANCELLED: { label: "ยกเลิก", icon: X, color: "text-red-600 bg-red-100" },
};

const currentStepIndex = computed(() => {
  if (!order.value) return -1;
  return order.value.status === "CANCELLED"
    ? -1
    : statusSteps.indexOf(order.value.status);
});

async function cancelOrder() {
  isCancelling.value = true;
  try {
    const res = await ordersApi.cancel(
      orderId,
      cancelReason.value || undefined,
    );
    order.value = res.data.data;
    showCancelModal.value = false;
    toast.success("ยกเลิกคำสั่งซื้อสำเร็จ");
  } catch (err: any) {
    toast.error(err.response?.data?.message || "ไม่สามารถยกเลิกได้");
  } finally {
    isCancelling.value = false;
  }
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
      <RouterLink to="/profile/orders" class="btn-outline text-sm"
        >กลับรายการ</RouterLink
      >
    </div>

    <div v-else class="max-w-4xl mx-auto">
      <div class="flex items-center gap-3 mb-6">
        <RouterLink to="/profile/orders" class="btn-ghost p-2"
          ><ArrowLeft class="w-4 h-4"
        /></RouterLink>
        <div>
          <h1 class="text-xl font-bold text-secondary-900 font-mono">
            #{{ order.id }}
          </h1>
          <p class="text-sm text-secondary-400">
            {{
              new Date(order.created_at).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </p>
        </div>
        <span
          :class="[
            'badge ml-2',
            order.status === 'CANCELLED'
              ? 'badge-red'
              : order.status === 'COMPLETED'
                ? 'badge-green'
                : order.status === 'SHIPPED'
                  ? 'badge-teal'
                  : order.status === 'CONFIRMED'
                    ? 'badge-blue'
                    : 'badge-yellow',
          ]"
        >
          {{ statusConfig[order.status]?.label }}
        </span>
        <div class="ml-auto flex gap-2">
          <button
            v-if="order.status === 'PENDING'"
            @click="showCancelModal = true"
            class="btn-danger text-sm"
          >
            ยกเลิก
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 space-y-5">
          <div v-if="order.status !== 'CANCELLED'" class="card">
            <h3 class="font-semibold text-secondary-900 mb-5 text-sm">
              สถานะการสั่งซื้อ
            </h3>
            <div class="flex items-start justify-between relative">
              <div
                class="absolute top-4 left-0 right-0 h-0.5 bg-secondary-100 z-0"
              />
              <template v-for="(step, i) in statusSteps" :key="step">
                <div class="flex flex-col items-center z-10 flex-1">
                  <div
                    :class="[
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2',
                      i <= currentStepIndex
                        ? 'bg-primary-600 border-primary-600 text-white'
                        : 'bg-white border-secondary-200 text-secondary-400',
                    ]"
                  >
                    <component :is="statusConfig[step].icon" class="w-4 h-4" />
                  </div>
                  <p
                    :class="[
                      'text-xs mt-2 text-center',
                      i <= currentStepIndex
                        ? 'text-primary-700 font-semibold'
                        : 'text-secondary-400',
                    ]"
                  >
                    {{ statusConfig[step].label }}
                  </p>
                  <p
                    v-if="order.status_logs.find((l) => l.to_status === step)"
                    class="text-[10px] text-secondary-300 mt-0.5"
                  >
                    {{
                      fmtDate(
                        order.status_logs.find((l) => l.to_status === step)!
                          .created_at,
                      )
                    }}
                  </p>
                </div>
              </template>
            </div>
          </div>

          <div
            v-if="order.status === 'CANCELLED'"
            class="card border-red-200 bg-red-50"
          >
            <h3 class="font-semibold text-red-800 mb-2 text-sm">
              คำสั่งซื้อถูกยกเลิก
            </h3>
            <p v-if="order.cancelled_reason" class="text-sm text-red-600">
              เหตุผล: {{ order.cancelled_reason }}
            </p>
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
                  <p class="text-xs text-secondary-400 mt-0.5">
                    หน่วย: {{ item.unit_name }}
                    <span
                      v-if="item.is_special_price"
                      class="text-primary-600 ml-1"
                      >(ราคาพิเศษ)</span
                    >
                  </p>
                  <p class="text-xs text-secondary-500 mt-0.5">
                    x{{ item.quantity }}
                  </p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-bold text-secondary-900">
                    ฿{{ fmt(item.unit_price * item.quantity) }}
                  </p>
                  <p class="text-xs text-secondary-400">
                    ฿{{ fmt(item.unit_price) }}/หน่วย
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <div class="card">
            <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
              ที่อยู่จัดส่ง
            </h3>
            <div class="text-sm space-y-1 text-secondary-600">
              <p class="font-semibold text-secondary-900">
                {{ order.shipping_address.recipient }}
              </p>
              <p>{{ order.shipping_address.phone }}</p>
              <p>{{ order.shipping_address.address }}</p>
              <p>
                {{ order.shipping_address.district }}
                {{ order.shipping_address.province }}
              </p>
              <p>{{ order.shipping_address.postal_code }}</p>
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
                <span>ยอดสินค้า</span><span>฿{{ fmt(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between text-secondary-600">
                <span>ค่าจัดส่ง</span>
                <span :class="order.shipping_fee === 0 ? 'text-success' : ''">{{
                  order.shipping_fee === 0
                    ? "ฟรี"
                    : "฿" + fmt(order.shipping_fee)
                }}</span>
              </div>
              <div
                class="flex justify-between font-bold text-secondary-900 border-t pt-2"
              >
                <span>รวมทั้งหมด</span
                ><span class="text-primary-700"
                  >฿{{ fmt(order.total_amount) }}</span
                >
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="showCancelModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <h3 class="font-bold text-lg text-secondary-900 mb-2">
          ยืนยันการยกเลิก
        </h3>
        <p class="text-sm text-secondary-500 mb-4">โปรดระบุเหตุผลในการยกเลิก</p>
        <BaseTextarea
          v-model="cancelReason"
          placeholder="เหตุผล..."
          :rows="3"
        />
        <div class="flex gap-3 mt-4">
          <button @click="showCancelModal = false" class="btn-secondary flex-1">
            ปิด
          </button>
          <button
            @click="cancelOrder"
            :disabled="isCancelling"
            class="btn-danger flex-1"
          >
            <Loader2 v-if="isCancelling" class="w-4 h-4 animate-spin mr-1" />
            ยืนยันยกเลิก
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
