<script setup lang="ts">
import { ref, computed } from "vue";
import { Navbar, Footer } from "@/components/layout";
import { BaseSelect } from "@/components/ui";
import { MOCK_ORDERS } from "@/__mocks__/orders";
import { useAuthStore } from "@/stores/auth.store";
import { RouterLink, useRoute } from "vue-router";
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  ChevronRight,
  Search,
  ShoppingBag,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
} from "lucide-vue-next";

const auth = useAuthStore();
const route = useRoute();

// ── Sidebar menu ──────────────────────────────────────────
const menuItems = [
  { to: "/profile/information", label: "ข้อมูลส่วนตัว", icon: User },
  { to: "/profile/orders", label: "คำสั่งซื้อของฉัน", icon: Package },
  { to: "/profile/address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { to: "/profile/security", label: "เปลี่ยนรหัสผ่าน", icon: Lock },
  { to: "/profile/wishlist", label: "สินค้าที่บันทึกไว้", icon: Heart },
];

// ── Data ──────────────────────────────────────────────────
// TODO: GET /api/v1/orders?status=&page=
const orders = computed(() => MOCK_ORDERS);

const statusFilter = ref("");
const statusOpts = [
  { value: "", label: "ทุกสถานะ" },
  { value: "pending", label: "รอดำเนินการ" },
  { value: "confirmed", label: "ยืนยันแล้ว" },
  { value: "shipped", label: "จัดส่งแล้ว" },
  { value: "completed", label: "สำเร็จ" },
  { value: "cancelled", label: "ยกเลิก" },
];

const filtered = computed(() =>
  statusFilter.value
    ? orders.value.filter((o) => o.status === statusFilter.value)
    : orders.value,
);

// ── Status config ─────────────────────────────────────────
const statusConfig: Record<
  string,
  { label: string; badge: string; icon: any; color: string }
> = {
  pending: {
    label: "รอดำเนินการ",
    badge: "badge-yellow",
    icon: Clock,
    color: "text-yellow-600",
  },
  confirmed: {
    label: "ยืนยันแล้ว",
    badge: "badge-blue",
    icon: FileText,
    color: "text-blue-600",
  },
  shipped: {
    label: "จัดส่งแล้ว",
    badge: "badge-teal",
    icon: Truck,
    color: "text-primary-600",
  },
  completed: {
    label: "สำเร็จ",
    badge: "badge-green",
    icon: CheckCircle,
    color: "text-green-600",
  },
  cancelled: {
    label: "ยกเลิก",
    badge: "badge-red",
    icon: XCircle,
    color: "text-red-500",
  },
};

// ── Summary stats ─────────────────────────────────────────
const stats = computed(() => {
  const all = orders.value;
  return [
    {
      label: "ทั้งหมด",
      count: all.length,
      color: "bg-secondary-100 text-secondary-600",
    },
    {
      label: "รอดำเนินการ",
      count: all.filter((o) => o.status === "pending").length,
      color: "bg-yellow-100 text-yellow-700",
    },
    {
      label: "กำลังจัดส่ง",
      count: all.filter((o) => o.status === "shipped").length,
      color: "bg-primary-100 text-primary-700",
    },
    {
      label: "สำเร็จ",
      count: all.filter((o) => o.status === "completed").length,
      color: "bg-green-100 text-green-700",
    },
  ];
});

// ── Helpers ───────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <h1 class="page-title mb-6">บัญชีของฉัน</h1>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- ── Sidebar ── -->
        <aside class="w-full lg:w-64 shrink-0">
          <nav class="card p-2 space-y-0.5">
            <RouterLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors',
                route.path === item.to
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-600 hover:bg-secondary-50',
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronRight class="w-3.5 h-3.5 opacity-40" />
            </RouterLink>
          </nav>
        </aside>

        <!-- ── Main content ── -->
        <main class="flex-1 min-w-0">
          <!-- Stats -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div
              v-for="stat in stats"
              :key="stat.label"
              class="card py-3 px-4 text-center"
            >
              <p class="text-2xl font-bold text-secondary-900">
                {{ stat.count }}
              </p>
              <p class="text-xs text-secondary-500 mt-0.5">{{ stat.label }}</p>
            </div>
          </div>

          <div class="card">
            <!-- Header + Filter -->
            <div
              class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5"
            >
              <div>
                <h2 class="text-lg font-bold text-secondary-900">
                  คำสั่งซื้อของฉัน
                </h2>
                <p class="text-sm text-secondary-500 mt-0.5">
                  ติดตามสถานะคำสั่งซื้อทั้งหมดของคุณ
                </p>
              </div>
              <BaseSelect
                v-model="statusFilter"
                :options="statusOpts"
                class="w-full sm:w-44"
              />
            </div>

            <!-- Empty state -->
            <div v-if="filtered.length === 0" class="text-center py-16">
              <div
                class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <ShoppingBag class="w-8 h-8 text-secondary-400" />
              </div>
              <p class="text-secondary-600 font-medium mb-1">ไม่พบคำสั่งซื้อ</p>
              <p class="text-sm text-secondary-400 mb-4">
                {{
                  statusFilter
                    ? "ลองเปลี่ยนตัวกรองสถานะ"
                    : "คุณยังไม่มีคำสั่งซื้อ"
                }}
              </p>
              <RouterLink to="/products" class="btn-primary text-sm">
                เลือกซื้อสินค้า
              </RouterLink>
            </div>

            <!-- Order list -->
            <div v-else class="space-y-3">
              <RouterLink
                v-for="order in filtered"
                :key="order.id"
                :to="`/orders/${order.id}`"
                class="block rounded-xl border border-secondary-200 hover:border-primary-300 hover:shadow-sm p-4 transition-all"
              >
                <!-- Top row: ID + Status + Amount -->
                <div class="flex items-start justify-between gap-3 mb-3">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <span
                        class="font-mono font-semibold text-secondary-900 text-sm"
                      >
                        {{ order.id }}
                      </span>
                      <span
                        :class="['badge', statusConfig[order.status].badge]"
                      >
                        {{ statusConfig[order.status].label }}
                      </span>
                      <span
                        v-if="order.prescription_status === 'pending'"
                        class="badge badge-yellow"
                      >
                        ใบสั่งยารอรีวิว
                      </span>
                    </div>
                    <p class="text-xs text-secondary-400 mt-1">
                      {{ fmtDate(order.created_at) }} ·
                      {{ fmtTime(order.created_at) }}
                    </p>
                  </div>
                  <div class="text-right shrink-0">
                    <p class="font-bold text-primary-700 text-sm">
                      ฿{{ fmt(order.total_amount) }}
                    </p>
                    <p class="text-xs text-secondary-400 mt-0.5">
                      {{ order.items.length }} รายการ
                    </p>
                  </div>
                </div>

                <!-- Product thumbnails -->
                <div class="flex items-center gap-2">
                  <div
                    v-for="item in order.items.slice(0, 4)"
                    :key="item.id"
                    class="w-10 h-10 rounded-lg overflow-hidden border border-secondary-100 shrink-0"
                  >
                    <img
                      :src="item.product_image"
                      :alt="item.product_name"
                      class="w-full h-full object-cover"
                    />
                  </div>
                  <span
                    v-if="order.items.length > 4"
                    class="text-xs text-secondary-400 ml-1"
                  >
                    +{{ order.items.length - 4 }} รายการ
                  </span>
                  <span class="ml-auto text-xs text-primary-600 font-medium">
                    ดูรายละเอียด →
                  </span>
                </div>
              </RouterLink>
            </div>
          </div>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>
