<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  User,
  MapPin,
  FileText,
  CreditCard,
  Calendar,
  AlertTriangle,
  Clock,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
} from "lucide-vue-next";
import { formatPrice, formatDateTime } from "@/utils/format";
import { formatOrderUser } from "@/utils";
import { BaseLoading } from "@/components/ui";

const route = useRoute();
const toast = useToast();
const orderId = parseInt(route.params.id as string, 10);
const order = ref<AdminOrder | null>(null);
const loading = ref(true);
const isUpdating = ref(false);
const statusNote = ref("");
const showNoteInputForStatus = ref<string | null>(null);

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

async function handleUpdateStatus(status: string) {
  if (!order.value) return;
  
  // If the status requires a note or if the user clicks it, let them enter it first
  if (!showNoteInputForStatus.value && (status === "CANCELLED" || status === "SHIPPED")) {
    showNoteInputForStatus.value = status;
    statusNote.value = "";
    return;
  }

  isUpdating.value = true;
  try {
    const res = await adminOrdersApi.updateStatus(orderId, status, statusNote.value);
    order.value = res.data.data;
    toast.success(res.data.message);
    showNoteInputForStatus.value = null;
    statusNote.value = "";
  } catch (err: any) {
    toast.error(err.response?.data?.message || "ไม่สามารถเปลี่ยนสถานะได้");
  } finally {
    isUpdating.value = false;
  }
}

function cancelStatusUpdate() {
  showNoteInputForStatus.value = null;
  statusNote.value = "";
}

// Status visual systems
const statusConfig: Record<string, { cls: string; lbl: string; icon: any; color: string }> = {
  PENDING: {
    cls: "bg-amber-50 text-amber-700 border-amber-200/60",
    lbl: "รอดำเนินการ",
    icon: Clock,
    color: "amber"
  },
  CONFIRMED: {
    cls: "bg-blue-50 text-blue-700 border-blue-200/60",
    lbl: "ยืนยันแล้ว",
    icon: CheckCircle,
    color: "blue"
  },
  SHIPPED: {
    cls: "bg-teal-50 text-teal-700 border-teal-200/60",
    lbl: "จัดส่งแล้ว",
    icon: Truck,
    color: "teal"
  },
  COMPLETED: {
    cls: "bg-emerald-50 text-emerald-700 border-emerald-200/60",
    lbl: "สำเร็จ",
    icon: ShieldCheck,
    color: "emerald"
  },
  CANCELLED: {
    cls: "bg-rose-50 text-rose-700 border-rose-200/60",
    lbl: "ยกเลิก",
    icon: XCircle,
    color: "rose"
  },
};

const steps = [
  { key: "PENDING",   label: "สร้างคำสั่งซื้อ" },
  { key: "CONFIRMED", label: "ยืนยันการรับออเดอร์" },
  { key: "SHIPPED",   label: "จัดส่งสินค้าแล้ว" },
  { key: "COMPLETED", label: "ทำรายการสำเร็จ" },
];

function getStepStatus(step: string, currentStatus: string): "completed" | "current" | "upcoming" | "cancelled" {
  if (currentStatus === "CANCELLED") {
    return "cancelled";
  }
  const currentIndex = steps.findIndex(s => s.key === currentStatus);
  const stepIndex = steps.findIndex(s => s.key === step);

  if (stepIndex < currentIndex) return "completed";
  if (stepIndex === currentIndex) return "current";
  return "upcoming";
}
</script>

<template>
  <div>
    <!-- Loading state -->
    <BaseLoading v-if="loading" :loading="loading" text="กำลังดาวน์โหลดรายละเอียดคำสั่งซื้อ..." />

    <!-- Error state -->
    <div v-else-if="!order" class="text-center py-20 bg-white rounded-3xl border border-secondary-100 shadow-sm max-w-lg mx-auto">
      <Package class="w-16 h-16 text-secondary-300 mx-auto mb-4" />
      <h3 class="text-lg font-bold text-secondary-900 mb-1">ไม่พบคำสั่งซื้อ</h3>
      <p class="text-sm text-secondary-500 mb-6">คำสั่งซื้อรหัสนี้อาจถูกลบหรือไม่มีอยู่ในระบบ</p>
      <RouterLink to="/admin/orders" class="btn bg-secondary-900 hover:bg-secondary-800 text-white rounded-xl px-5 text-sm">
        กลับหน้ารายการคำสั่งซื้อ
      </RouterLink>
    </div>

    <!-- Main Order Details View -->
    <div v-else class="space-y-6 animate-[fadeIn_0.35s_ease-out]">
      
      <!-- Page Header -->
      <div class="page-header">
        <div class="flex items-center gap-3">
          <RouterLink 
            to="/admin/orders" 
            class="p-2 rounded-xl border border-secondary-200 bg-white text-secondary-600 hover:text-secondary-950 hover:bg-secondary-50 hover:border-secondary-300 transition-all shadow-sm active:scale-95"
            title="กลับรายการ"
          >
            <ArrowLeft class="w-4 h-4" />
          </RouterLink>
          <div>
            <h1 class="page-title flex items-center gap-2">
              รายละเอียดคำสั่งซื้อ <span class="font-mono text-teal-600 font-bold">#{{ order.id }}</span>
            </h1>
            <p class="text-xs text-secondary-400 mt-0.5">
              สั่งซื้อเมื่อ: {{ formatDateTime(order.created_at) }}
            </p>
          </div>
        </div>

        <!-- Order Main Status Pill -->
        <div class="flex items-center gap-2">
          <span 
            v-if="statusConfig[order.status]"
            :class="['px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-1.5 shadow-sm', statusConfig[order.status].cls]"
          >
            <component :is="statusConfig[order.status].icon" class="w-3.5 h-3.5 shrink-0" />
            {{ statusConfig[order.status].lbl }}
          </span>
        </div>
      </div>

      <!-- visual clinical status timeline tracker -->
      <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm">
        <div class="relative">
          <!-- Stepper for screens >= sm -->
          <div class="hidden sm:flex items-center justify-between relative z-10">
            <div v-for="(step, idx) in steps" :key="step.key" class="flex-1 flex flex-col items-center relative">

              <!-- Connector line -->
              <div
                v-if="idx < steps.length - 1"
                :class="[
                  'absolute top-5 left-1/2 w-full h-[3px] -z-10 transition-all duration-500',
                  order.status === 'CANCELLED' ? 'bg-rose-100' :
                  getStepStatus(steps[idx+1].key, order.status) === 'completed' || getStepStatus(steps[idx+1].key, order.status) === 'current'
                    ? 'bg-teal-500' : 'bg-secondary-100'
                ]"
              ></div>

              <!-- Step indicator bubble -->
              <div
                :class="[
                  'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm font-mono text-sm font-bold',
                  order.status === 'CANCELLED'
                    ? 'bg-rose-50 border-rose-400 text-rose-500'
                    : getStepStatus(step.key, order.status) === 'completed'
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : getStepStatus(step.key, order.status) === 'current'
                        ? 'bg-white border-teal-600 text-teal-600 ring-4 ring-teal-50'
                        : 'bg-white border-secondary-200 text-secondary-400'
                ]"
              >
                <CheckCircle v-if="order.status !== 'CANCELLED' && getStepStatus(step.key, order.status) === 'completed'" class="w-5 h-5" />
                <XCircle v-else-if="order.status === 'CANCELLED'" class="w-5 h-5" />
                <span v-else>{{ idx + 1 }}</span>
              </div>

              <!-- Step labels -->
              <span
                :class="[
                  'text-xs font-semibold mt-3 text-center transition-colors duration-200',
                  order.status === 'CANCELLED' ? 'text-rose-500' :
                  getStepStatus(step.key, order.status) === 'current' ? 'text-teal-700 font-bold' :
                  getStepStatus(step.key, order.status) === 'completed' ? 'text-secondary-800' : 'text-secondary-400'
                ]"
              >
                {{ step.label }}
              </span>

              <!-- Badge indicator for current status -->
              <span
                v-if="step.key === order.status"
                :class="[
                  'absolute -top-7 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider shadow-sm border animate-bounce',
                  order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-teal-100 text-teal-700 border-teal-200'
                ]"
              >
                ปัจจุบัน
              </span>
            </div>
          </div>

          <!-- Mobile view status (Simple text layout) -->
          <div class="sm:hidden flex items-center justify-between bg-secondary-50 p-4 rounded-2xl border border-secondary-100">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center">
                <ClipboardList class="w-4 h-4" />
              </div>
              <div>
                <p class="text-xs text-secondary-400">สถานะคำสั่งซื้อ</p>
                <p class="text-sm font-bold text-secondary-900">
                  {{ statusConfig[order.status]?.lbl || order.status }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xs text-secondary-400">ยอดชำระสุทธิ</p>
              <p class="text-sm font-black text-teal-700 font-mono">฿{{ formatPrice(order.total_amount) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Layout Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left: Status updates, items list, log timeline -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- 1. Status Management Section -->
          <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div class="flex items-center justify-between pb-3 border-b border-secondary-50">
              <h3 class="font-bold text-secondary-900 flex items-center gap-2.5 text-base">
                <span class="p-1.5 rounded-lg bg-teal-50 text-teal-600"><ClipboardList class="w-4 h-4" /></span>
                ดำเนินการและจัดการสถานะคำสั่งซื้อ
              </h3>
            </div>
            
            <div class="flex flex-col gap-3">
              <!-- Note Input form before submitting state change -->
              <div v-if="showNoteInputForStatus" class="bg-secondary-50 rounded-2xl p-4 border border-secondary-200/80 space-y-3 animate-[slideDown_0.2s_ease-out]">
                <div class="flex items-center">
                  <span class="text-xs font-bold text-secondary-800 flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                    ระบุข้อมูลบันทึกสำหรับสถานะ: {{ statusConfig[showNoteInputForStatus]?.lbl }}
                  </span>
                </div>
                <div>
                  <textarea
                    v-model="statusNote"
                    rows="2"
                    class="input w-full focus:ring-teal-500 focus:border-teal-500 text-xs"
                    placeholder="กรอกรายละเอียดเพิ่มเติม เช่น เลขพัสดุ, หมายเหตุ หรือเหตุผลการยกเลิก..."
                  ></textarea>
                </div>
                <div class="flex justify-end gap-2">
                  <button 
                    @click="cancelStatusUpdate" 
                    class="px-3.5 py-1.5 border border-secondary-200 rounded-xl text-xs font-semibold text-secondary-600 bg-white hover:bg-secondary-50"
                  >
                    ยกเลิก
                  </button>
                  <button 
                    @click="handleUpdateStatus(showNoteInputForStatus)" 
                    :disabled="isUpdating"
                    :class="[
                      'px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 shadow-sm',
                      showNoteInputForStatus === 'CANCELLED' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-teal-600 hover:bg-teal-700'
                    ]"
                  >
                    <BaseLoading v-if="isUpdating" inline class="w-3 h-3" />
                    ยืนยันเปลี่ยนสถานะ
                  </button>
                </div>
              </div>

              <!-- General action buttons -->
              <div v-else class="flex flex-wrap gap-2.5">
                <button
                  v-for="nextS in nextStatusMap[order.status]"
                  :key="nextS"
                  @click="handleUpdateStatus(nextS)"
                  :disabled="isUpdating"
                  :class="[
                    'px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                    nextS === 'CANCELLED'
                      ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100 hover:border-rose-300'
                      : nextS === 'CONFIRMED'
                        ? 'bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700 text-white'
                        : nextS === 'SHIPPED'
                          ? 'bg-teal-600 hover:bg-teal-700 border-teal-600 hover:border-teal-700 text-white'
                          : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 hover:border-emerald-700 text-white',
                  ]"
                >
                  <BaseLoading v-if="isUpdating" inline class="w-4 h-4" />
                  <component
                    v-else
                    :is="
                      nextS === 'CANCELLED'
                        ? XCircle
                        : nextS === 'SHIPPED'
                          ? Truck
                          : CheckCircle
                    "
                    class="w-4.5 h-4.5 shrink-0"
                  />
                  <span>
                    {{
                      {
                        CONFIRMED: "ยืนยันคำสั่งซื้อ",
                        SHIPPED: "จัดส่งสินค้าแล้ว",
                        COMPLETED: "ทำรายการสำเร็จเสร็จสิ้น",
                        CANCELLED: "ยกเลิกคำสั่งซื้อ",
                      }[nextS]
                    }}
                  </span>
                </button>
                <div
                  v-if="nextStatusMap[order.status].length === 0"
                  class="flex items-center gap-2 text-xs font-medium text-secondary-400 bg-secondary-50/50 border border-secondary-100 rounded-xl px-4 py-3 w-full"
                >
                  <ShieldCheck class="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>คำสั่งซื้อนี้มีสถานะสิ้นสุดแล้ว ไม่มีการเปลี่ยนสถานะเพิ่มเติม</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 2. Detailed Order Items Section -->
          <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 class="font-bold text-secondary-900 flex items-center gap-2.5 text-base pb-3 border-b border-secondary-50">
              <span class="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Package class="w-4 h-4" /></span>
              รายการยาและเวชภัณฑ์ในตะกร้า ({{ order.items.length }} รายการ)
            </h3>
            
            <!-- Table layout for items -->
            <div class="overflow-x-auto rounded-2xl border border-secondary-100">
              <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr class="bg-secondary-50 border-b border-secondary-100 text-xs font-bold text-secondary-600">
                    <th class="py-3 px-4 w-[45%]">ชื่อสินค้า / รหัสสินค้า</th>
                    <th class="py-3 px-4 text-center w-[20%]">ตรวจสอบสินค้าคงคลัง</th>
                    <th class="py-3 px-4 text-center w-[12%]">จำนวน</th>
                    <th class="py-3 px-4 text-right w-[11%]">ราคาต่อหน่วย</th>
                    <th class="py-3 px-4 text-right w-[12%]">ราคารวม</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-secondary-50 text-sm text-secondary-700">
                  <tr v-for="item in order.items" :key="item.id" class="hover:bg-secondary-50/30 transition-colors">
                    <!-- Product details name/code -->
                    <td class="py-3.5 px-4">
                      <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 flex items-center justify-center text-teal-600 shrink-0 mt-0.5">
                          <Package class="w-5 h-5" />
                        </div>
                        <div class="space-y-0.5">
                          <p class="font-bold text-secondary-900 leading-snug">
                            {{ item.product_name }}
                          </p>
                          <p v-if="item.generic_name" class="text-xs text-secondary-400 italic">
                            ชื่อสามัญ: {{ item.generic_name }}
                          </p>
                          <div class="flex items-center gap-2 mt-1.5">
                            <span 
                              v-if="item.product_code" 
                              class="font-mono bg-secondary-100 border border-secondary-200 text-secondary-700 rounded px-1.5 py-0.5 text-[10px] font-bold tracking-wider"
                              title="รหัสสินค้า"
                            >
                              CODE: {{ item.product_code }}
                            </span>
                            <span class="text-xs bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 text-[11px] font-medium">
                              หน่วย: {{ item.unit_name }}
                            </span>
                            <span
                              v-if="item.is_special_price"
                              class="text-[10px] bg-teal-50 border border-teal-200 text-teal-700 rounded px-1.5 py-0.5 font-bold"
                            >
                              ราคาพิเศษ
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    <!-- Stock indicator -->
                    <td class="py-3.5 px-4 text-center">
                      <div class="inline-flex items-center justify-center">
                        <div 
                          v-if="item.current_stock !== undefined"
                          :class="[
                            'px-2.5 py-1 rounded-full text-[11px] font-semibold border flex items-center gap-1.5 shadow-sm',
                            item.current_stock >= item.quantity * (item.multiplier_to_base || 1)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50'
                              : 'bg-rose-50 text-rose-700 border-rose-200/50'
                          ]"
                        >
                          <span :class="['w-1.5 h-1.5 rounded-full shrink-0', item.current_stock >= item.quantity * (item.multiplier_to_base || 1) ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500']"></span>
                          <span>
                            {{ 
                              item.current_stock >= item.quantity * (item.multiplier_to_base || 1)
                                ? `พร้อมจัดส่ง (คลัง: ${item.current_stock} ชิ้น)` 
                                : `สินค้าไม่พอ (คลัง: ${item.current_stock} / ขาด: ${item.quantity * (item.multiplier_to_base || 1) - item.current_stock} ชิ้น)` 
                            }}
                          </span>
                        </div>
                        <span v-else class="text-xs text-secondary-400">-</span>
                      </div>
                    </td>

                    <!-- Quantity -->
                    <td class="py-3.5 px-4 text-center font-mono font-bold text-secondary-900">
                      x{{ item.quantity }}
                    </td>

                    <!-- Unit Price -->
                    <td class="py-3.5 px-4 text-right font-mono font-medium text-secondary-600">
                      ฿{{ formatPrice(item.unit_price) }}
                    </td>

                    <!-- Subtotal Price -->
                    <td class="py-3.5 px-4 text-right font-mono font-bold text-teal-700">
                      ฿{{ formatPrice(item.unit_price * item.quantity) }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 3. Redesigned Status Timeline (ประวัติสถานะ) -->
          <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 class="font-bold text-secondary-900 flex items-center gap-2.5 text-base pb-3 border-b border-secondary-50">
              <span class="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Clock class="w-4 h-4" /></span>
              บันทึกไทม์ไลน์และประวัติการเปลี่ยนแปลง
            </h3>

            <div class="relative pl-6 space-y-6">
              <!-- Timeline vertical line connector -->
              <div class="absolute left-[11px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-500 to-secondary-200"></div>

              <div
                v-for="(log, i) in order.status_logs"
                :key="log.id"
                class="relative flex items-start gap-4 animate-[fadeIn_0.3s_ease-out]"
              >
                <!-- Timeline bullet node -->
                <div 
                  :class="[
                    'absolute -left-[20px] w-[11px] h-[11px] rounded-full ring-4 bg-white z-10 transition-all',
                    i === order.status_logs.length - 1 
                      ? 'ring-teal-100 bg-teal-600 scale-125' 
                      : 'ring-secondary-100 bg-secondary-400'
                  ]"
                ></div>

                <div class="flex-1 bg-secondary-50/70 border border-secondary-200/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm hover:border-secondary-300 transition-colors">
                  <div class="space-y-1">
                    <div class="flex items-center gap-2">
                      <span 
                        v-if="statusConfig[log.to_status]"
                        :class="['px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1', statusConfig[log.to_status].cls]"
                      >
                        <span class="w-1 h-1 rounded-full bg-current"></span>
                        {{ statusConfig[log.to_status].lbl }}
                      </span>
                      <span v-if="log.from_status" class="text-xs text-secondary-400 flex items-center gap-1">
                        เปลี่ยนผ่านจาก <span class="font-semibold">{{ statusConfig[log.from_status]?.lbl || log.from_status }}</span>
                      </span>
                    </div>

                    <!-- Note content -->
                    <p v-if="log.note" class="text-xs text-secondary-700 bg-white border border-secondary-100 rounded-lg p-2 mt-2 leading-relaxed">
                      <span class="font-bold text-secondary-500 block mb-0.5">บันทึกข้อความ:</span>
                      {{ log.note }}
                    </p>
                  </div>

                  <div class="text-left md:text-right shrink-0">
                    <p class="text-[11px] font-mono text-secondary-400 flex items-center md:justify-end gap-1">
                      <Calendar class="w-3 h-3" />
                      {{ formatDateTime(log.created_at) }}
                    </p>
                    <p v-if="log.changed_by" class="text-[10px] text-teal-600 font-semibold mt-0.5">
                      ดำเนินการโดยแอดมิน ID: {{ log.changed_by }}
                    </p>
                    <p v-else class="text-[10px] text-secondary-400 font-medium mt-0.5">
                      ทำรายการโดยระบบ
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Customer Info, Shipping Address, Receipt Summary -->
        <div class="space-y-6">
          
          <!-- 1. Customer Information Card -->
          <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 class="font-bold text-secondary-900 flex items-center gap-2 text-sm pb-2 border-b border-secondary-50">
              <User class="w-4 h-4 text-teal-600" />
              ข้อมูลบัญชีผู้สั่งซื้อ
            </h3>
            
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
                {{ order.user.first_name ? order.user.first_name[0] : order.user.username ? order.user.username[0].toUpperCase() : 'U' }}
              </div>
              <div class="overflow-hidden">
                <p class="text-sm font-bold text-secondary-900 truncate">
                  {{ formatOrderUser(order.user) }}
                </p>
                <p class="text-xs text-secondary-400 truncate">
                  ID: {{ order.user_id }}
                </p>
              </div>
            </div>

            <div class="bg-secondary-50 rounded-2xl p-3 border border-secondary-100 space-y-1.5 text-xs text-secondary-600 font-medium">
              <div class="flex justify-between">
                <span class="text-secondary-400">อีเมล:</span>
                <span class="text-secondary-900 select-all truncate">{{ order.user.email || '-' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-secondary-400">เบอร์โทรศัพท์:</span>
                <span class="text-secondary-900 select-all">{{ order.user.phone || '-' }}</span>
              </div>
            </div>
          </div>

          <!-- 2. Shipping Address Card -->
          <div class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 class="font-bold text-secondary-900 flex items-center gap-2 text-sm pb-2 border-b border-secondary-50">
              <MapPin class="w-4 h-4 text-teal-600" />
              ข้อมูลสถานที่จัดส่ง
            </h3>

            <div class="space-y-3">
              <div class="border-l-2 border-teal-500 pl-3 py-1 space-y-1 text-sm text-secondary-700">
                <p class="font-bold text-secondary-900">
                  {{ order.shipping_address.recipient }}
                </p>
                <p class="font-mono text-xs font-semibold text-secondary-500">
                  {{ order.shipping_address.phone }}
                </p>
              </div>

              <div class="bg-secondary-50 rounded-2xl p-4 border border-secondary-100 text-xs text-secondary-600 leading-relaxed">
                <p class="font-medium text-secondary-800">{{ order.shipping_address.address }}</p>
                <p class="mt-1 font-semibold text-secondary-900">
                  {{ order.shipping_address.district }} 
                  {{ order.shipping_address.province }} 
                  {{ order.shipping_address.postal_code }}
                </p>
              </div>
            </div>
          </div>

          <!-- 3. Notes Card -->
          <div v-if="order.note || order.cancelled_reason" class="bg-white border border-secondary-100 rounded-3xl p-6 shadow-sm space-y-4">
            <h3 class="font-bold text-secondary-900 flex items-center gap-2 text-sm pb-2 border-b border-secondary-50">
              <FileText class="w-4 h-4 text-teal-600" />
              หมายเหตุจากคำสั่งซื้อ
            </h3>

            <div class="space-y-3">
              <!-- Customer Note -->
              <div v-if="order.note" class="bg-amber-50/70 border border-amber-200/50 rounded-2xl p-3.5">
                <span class="text-[10px] font-bold text-amber-700 block mb-1">หมายเหตุจากลูกค้า:</span>
                <p class="text-xs text-amber-900 leading-relaxed font-medium">“{{ order.note }}”</p>
              </div>

              <!-- Cancel Reason Note -->
              <div v-if="order.cancelled_reason" class="bg-rose-50 border border-rose-200/50 rounded-2xl p-3.5">
                <span class="text-[10px] font-bold text-rose-700 block mb-1 flex items-center gap-1">
                  <AlertTriangle class="w-3.5 h-3.5" />
                  เหตุผลการยกเลิกคำสั่งซื้อ:
                </span>
                <p class="text-xs text-rose-900 leading-relaxed font-medium">“{{ order.cancelled_reason }}”</p>
              </div>
            </div>
          </div>

          <!-- 4. Price & Invoice Receipt Summary Card -->
          <div class="bg-gradient-to-br from-white to-secondary-50 border border-secondary-200 rounded-3xl p-6 shadow-sm space-y-4 relative overflow-hidden">
            <!-- Decorative circle overlay -->
            <div class="absolute -right-6 -bottom-6 w-24 h-24 bg-teal-500/5 rounded-full"></div>
            
            <h3 class="font-bold text-secondary-900 flex items-center gap-2 text-sm pb-2 border-b border-secondary-100">
              <CreditCard class="w-4 h-4 text-teal-600" />
              ใบสรุปรายการเงินและยอดชำระ
            </h3>

            <div class="space-y-2.5 text-xs text-secondary-600">
              <div class="flex justify-between items-center">
                <span>ราคารวมสินค้าทั้งหมด</span>
                <span class="font-mono font-medium text-secondary-900">฿{{ formatPrice(order.subtotal) }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span>ค่าบริการจัดส่งพัสดุ</span>
                <span :class="['font-semibold', order.shipping_fee === 0 ? 'text-emerald-600' : 'font-mono text-secondary-900']">
                  {{ order.shipping_fee === 0 ? "จัดส่งฟรี" : `฿${formatPrice(order.shipping_fee)}` }}
                </span>
              </div>

              <!-- Net amount summary -->
              <div class="border-t border-dashed border-secondary-200 pt-3 mt-1 flex justify-between items-baseline">
                <span class="text-sm font-bold text-secondary-900">ยอดชำระสุทธิ</span>
                <span class="text-xl font-black text-teal-700 font-mono">
                  ฿{{ formatPrice(order.total_amount) }}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
