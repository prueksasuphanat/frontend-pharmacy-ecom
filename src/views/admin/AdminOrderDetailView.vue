<script setup lang="ts">
import { computed, ref } from "vue";
import { useRoute, RouterLink } from "vue-router";
import { MOCK_ORDERS } from "@/__mocks__/orders";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Truck,
  Package,
  FileText,
} from "lucide-vue-next";

const route = useRoute();
const orderId = route.params.id as string;
// TODO: GET /admin/orders/:id
const order = computed(
  () => MOCK_ORDERS.find((o) => o.id === orderId) || MOCK_ORDERS[0],
);

const newStatus = ref("");
const newPrescStatus = ref("");
const statusNote = ref("");
const isUpdating = ref(false);

const nextStatusMap: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipped", "cancelled"],
  shipped: ["completed"],
  completed: [],
  cancelled: [],
};

async function updateStatus(status: string) {
  isUpdating.value = true;
  // TODO: PATCH /admin/orders/:id/status { status, note }
  await new Promise((r) => setTimeout(r, 800));
  isUpdating.value = false;
  alert(`TODO: เปลี่ยนสถานะเป็น "${status}" (จะเชื่อม API จริงทีหลัง)`);
}

async function reviewPrescription(action: "approved" | "rejected") {
  // TODO: PATCH /admin/orders/:id/prescription { status: action }
  alert(`TODO: ${action === "approved" ? "อนุมัติ" : "ปฏิเสธ"}ใบสั่งแพทย์`);
}

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
function fmtDate(d: string) {
  return new Date(d).toLocaleString("th-TH");
}

const statusCls: Record<string, string> = {
  pending: "badge-yellow",
  confirmed: "badge-blue",
  shipped: "badge-teal",
  completed: "badge-green",
  cancelled: "badge-red",
};
const statusLbl: Record<string, string> = {
  pending: "รอดำเนินการ",
  confirmed: "ยืนยัน",
  shipped: "จัดส่งแล้ว",
  completed: "สำเร็จ",
  cancelled: "ยกเลิก",
};
</script>

<template>
  <div v-if="order">
    <div class="flex items-center gap-3 mb-6">
      <RouterLink to="/admin/orders" class="btn-ghost p-2"
        ><ArrowLeft class="w-4 h-4"
      /></RouterLink>
      <div>
        <h1 class="text-xl font-bold text-secondary-900 font-mono">
          {{ order.id }}
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
        <!-- Status management card -->
        <div class="card">
          <h3 class="font-bold text-secondary-900 mb-4 flex items-center gap-2">
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
                nextS === 'cancelled'
                  ? 'btn-danger'
                  : nextS === 'confirmed'
                    ? 'bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2.5 font-medium'
                    : nextS === 'shipped'
                      ? 'bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-4 py-2.5 font-medium'
                      : 'btn-primary',
              ]"
            >
              <component
                :is="
                  nextS === 'cancelled'
                    ? XCircle
                    : nextS === 'shipped'
                      ? Truck
                      : CheckCircle
                "
                class="w-4 h-4"
              />
              {{
                {
                  confirmed: "✅ ยืนยันคำสั่งซื้อ",
                  shipped: "🚚 จัดส่งแล้ว",
                  completed: "🎉 สำเร็จ",
                  cancelled: "❌ ยกเลิก",
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

        <!-- Prescription review -->
        <div
          v-if="order.prescription_status === 'pending'"
          class="card bg-yellow-50 border border-yellow-200"
        >
          <h3 class="font-bold text-yellow-800 mb-4 flex items-center gap-2">
            <FileText class="w-4 h-4" /> ใบสั่งแพทย์รอรีวิว
          </h3>
          <div
            class="bg-white rounded-xl p-4 border boder-secondary-100 mb-4 flex items-center justify-center h-32 text-secondary-300"
          >
            <!-- TODO: แสดงรูป/PDF ที่อัปโหลดจาก S3 -->
            📄 รูปใบสั่งแพทย์ (TODO: โหลดจาก S3)
          </div>
          <div class="flex gap-3">
            <button
              @click="reviewPrescription('approved')"
              class="btn-primary flex-1 gap-2"
            >
              <CheckCircle class="w-4 h-4" /> อนุมัติ
            </button>
            <button
              @click="reviewPrescription('rejected')"
              class="btn-danger flex-1 gap-2"
            >
              <XCircle class="w-4 h-4" /> ปฏิเสธ
            </button>
          </div>
        </div>

        <!-- Order items -->
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
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="w-14 h-14 rounded-xl object-cover"
              />
              <div class="flex-1">
                <p class="font-medium text-secondary-900 text-sm">
                  {{ item.product_name }}
                </p>
                <p class="text-xs text-secondary-400">{{ item.sku }}</p>
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

        <!-- Status log -->
        <div class="card">
          <h3 class="font-semibold text-secondary-900 mb-4 text-sm">
            ประวัติสถานะ
          </h3>
          <div class="space-y-3">
            <div
              v-for="(log, i) in order.status_logs"
              :key="i"
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
                  {{ log.to ? statusLbl[log.to] : "เริ่มต้น" }}
                </p>
                <p v-if="log.note" class="text-xs text-secondary-500">
                  {{ log.note }}
                </p>
                <p class="text-xs text-secondary-300">
                  {{ fmtDate(log.changed_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right sidebar -->
      <div class="space-y-4">
        <div class="card">
          <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
            ข้อมูลลูกค้า
          </h3>
          <p class="text-sm text-secondary-700 mb-1">{{ order.user_email }}</p>
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
              {{ order.shipping_address.district }},
              {{ order.shipping_address.province }}
            </p>
          </div>
        </div>
        <div class="card">
          <h3 class="font-semibold text-secondary-900 mb-3 text-sm">
            สรุปราคา
          </h3>
          <div class="space-y-1.5 text-sm">
            <div class="flex justify-between text-secondary-600">
              <span>สินค้า</span
              ><span>฿{{ fmt(order.total_amount - order.shipping_fee) }}</span>
            </div>
            <div class="flex justify-between text-secondary-600">
              <span>ค่าจัดส่ง</span
              ><span>{{
                order.shipping_fee === 0 ? "ฟรี" : "฿" + fmt(order.shipping_fee)
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
</template>
