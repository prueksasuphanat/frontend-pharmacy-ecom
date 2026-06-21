<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  BarChart3,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { BaseLoading } from "@/components/ui";
import VueApexCharts from "vue3-apexcharts";
import { adminDashboardApi } from "@/api/admin/dashboard";
import type {
  DashboardSummary,
  TopProduct,
  RecentOrder,
  TopViewedProduct,
  ActiveCart,
  SessionStats,
} from "@/types";
import { formatPrice, formatNum } from "@/utils/format";

const loading = ref(true);
const summary = ref<DashboardSummary>({
  today_sales: 0,
  pending_orders: 0,
  low_stock_count: 0,
  total_orders: 0,
});
const topProducts = ref<TopProduct[]>([]);
const recentOrders = ref<RecentOrder[]>([]);
const topViewedProducts = ref<TopViewedProduct[]>([]);
const activeCarts = ref<ActiveCart[]>([]);
const sessionStats = ref<SessionStats | null>(null);

const chartSeries = ref([{ name: "ยอดขาย (฿)", data: [] as number[] }]);
const chartOptions = ref({
  chart: {
    type: "bar" as const,
    toolbar: { show: false },
    fontFamily: "Noto Sans Thai, Inter, sans-serif",
  },
  colors: ["#0d9488"],
  plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [] as string[],
    labels: { style: { colors: "#64748b", fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (v: number) => "฿" + (v / 1000).toFixed(0) + "k",
      style: { colors: "#64748b" },
    },
  },
  grid: { borderColor: "#f1f5f9" },
  tooltip: {
    y: { formatter: (v: number) => "฿" + v.toLocaleString("th-TH") },
  },
});

onMounted(async () => {
  try {
    const [
      summaryRes,
      chartRes,
      topRes,
      recentRes,
      topViewedRes,
      activeCartsRes,
      sessionRes,
    ] = await Promise.all([
      adminDashboardApi.getSummary(),
      adminDashboardApi.getSalesChart(),
      adminDashboardApi.getTopProducts(),
      adminDashboardApi.getRecentOrders(),
      adminDashboardApi.getTopViewedProducts(),
      adminDashboardApi.getActiveCarts(),
      adminDashboardApi.getSessionStats(),
    ]);

    summary.value = summaryRes.data.data;
    chartSeries.value = [
      { name: "ยอดขาย (฿)", data: chartRes.data.data.values },
    ];
    chartOptions.value = {
      ...chartOptions.value,
      xaxis: {
        ...chartOptions.value.xaxis,
        categories: chartRes.data.data.labels,
      },
    };
    topProducts.value = topRes.data.data;
    recentOrders.value = recentRes.data.data;
    topViewedProducts.value = topViewedRes.data.data;
    activeCarts.value = activeCartsRes.data.data;
    sessionStats.value = sessionRes.data.data;
  } catch {
  } finally {
    loading.value = false;
  }
});

function fmt(n: number) {
  return formatPrice(n);
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
  CONFIRMED: "ยืนยัน",
  SHIPPED: "จัดส่ง",
  COMPLETED: "สำเร็จ",
  CANCELLED: "ยกเลิก",
};

function orderUser(o: RecentOrder) {
  if (o.user.first_name || o.user.last_name) {
    return `${o.user.first_name || ""} ${o.user.last_name || ""}`.trim();
  }
  return o.user.username || o.user.email || "-";
}
</script>

<template>
  <div>
    <h1 class="page-title mb-6">แดชบอร์ด</h1>

    <!-- Loading state -->
    <BaseLoading v-if="loading" :loading="loading" text="กำลังดาวน์โหลดข้อมูลแดชบอร์ด..." />

    <template v-else>
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div class="stat-card">
          <div class="stat-icon bg-primary-100">
            <TrendingUp class="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p class="text-xs text-secondary-400">ยอดขายวันนี้</p>
            <p class="text-xl font-bold text-secondary-900">
              ฿{{ fmt(summary.today_sales) }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-blue-100">
            <ShoppingBag class="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p class="text-xs text-secondary-400">คำสั่งซื้อรอดำเนินการ</p>
            <p class="text-xl font-bold text-secondary-900">
              {{ formatNum(summary.pending_orders) }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-orange-100">
            <Package class="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p class="text-xs text-secondary-400">สินค้าสต็อกต่ำ</p>
            <p class="text-xl font-bold text-secondary-900">
              {{ formatNum(summary.low_stock_count) }}
            </p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon bg-teal-100">
            <BarChart3 class="w-6 h-6 text-teal-600" />
          </div>
          <div>
            <p class="text-xs text-secondary-400">คำสั่งซื้อทั้งหมด</p>
            <p class="text-xl font-bold text-secondary-900">
              {{ formatNum(summary.total_orders) }}
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="card lg:col-span-2">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-secondary-900">ยอดขายรายเดือน</h2>
            <span class="badge badge-teal">12 เดือนล่าสุด</span>
          </div>
          <VueApexCharts
            type="bar"
            height="240"
            :options="chartOptions"
            :series="chartSeries"
          />
        </div>

        <div class="card">
          <h2 class="font-bold text-secondary-900 mb-4">สินค้าขายดี 🏆</h2>
          <div v-if="topProducts.length === 0" class="text-center py-8">
            <p class="text-sm text-secondary-400">ยังไม่มีข้อมูล</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="(p, i) in topProducts"
              :key="i"
              class="flex items-center gap-3"
            >
              <div
                :class="[
                  'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                  i === 0
                    ? 'bg-yellow-100 text-yellow-700'
                    : i === 1
                      ? 'bg-secondary-100 text-secondary-600'
                      : i === 2
                        ? 'bg-orange-100 text-orange-600'
                        : 'bg-secondary-50 text-secondary-400',
                ]"
              >
                {{ i + 1 }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-medium text-secondary-700 truncate">
                  {{ p.name }}
                </p>
                <p class="text-xs text-secondary-400">{{ formatNum(p.sold) }} ชิ้น</p>
              </div>
              <p class="text-xs font-semibold text-primary-700 shrink-0">
                ฿{{
                  p.revenue > 1000
                    ? (p.revenue / 1000).toFixed(0) + "k"
                    : fmt(p.revenue)
                }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-secondary-900">🛒 คำสั่งซื้อล่าสุด</h2>
          <RouterLink to="/admin/orders" class="text-xs text-primary-600"
            >ดูทั้งหมด →</RouterLink
          >
        </div>
        <div v-if="recentOrders.length === 0" class="text-center py-8">
          <p class="text-sm text-secondary-400">ยังไม่มีคำสั่งซื้อ</p>
        </div>
        <div v-else class="space-y-2">
          <RouterLink
            v-for="order in recentOrders"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            class="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-xl transition-colors"
          >
            <div>
              <p class="text-sm font-mono font-medium text-secondary-800">
                #{{ order.id }}
              </p>
              <p class="text-xs text-secondary-400">{{ orderUser(order) }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-secondary-900">
                ฿{{ fmt(order.total_amount) }}
              </p>
              <span :class="['badge text-xs', statusCls[order.status]]">
                {{ statusLbl[order.status] }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>

      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-secondary-900">
            👁️ สินค้าที่ถูกดูมากที่สุด
          </h2>
          <span class="badge badge-teal">7 วันล่าสุด</span>
        </div>
        <div v-if="topViewedProducts.length === 0" class="text-center py-8">
          <p class="text-sm text-secondary-400">ยังไม่มีข้อมูลการเข้าชม</p>
        </div>
        <div v-else class="space-y-3">
          <div
            v-for="(p, i) in topViewedProducts"
            :key="p.product_id"
            class="flex items-center gap-3"
          >
            <div
              :class="[
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                i === 0
                  ? 'bg-yellow-100 text-yellow-700'
                  : i === 1
                    ? 'bg-secondary-100 text-secondary-600'
                    : i === 2
                      ? 'bg-orange-100 text-orange-600'
                      : 'bg-secondary-50 text-secondary-400',
              ]"
            >
              {{ i + 1 }}
            </div>

            <div class="flex-1 min-w-0">
              <p class="text-xs font-medium text-secondary-700 truncate">
                {{ p.product_name }}
              </p>
              <div
                class="mt-1 h-1.5 bg-secondary-100 rounded-full overflow-hidden"
              >
                <div
                  class="h-full bg-primary-400 rounded-full transition-all"
                  :style="{
                    width:
                      topViewedProducts[0]?.view_count > 0
                        ? (p.view_count / topViewedProducts[0].view_count) *
                            100 +
                          '%'
                        : '0%',
                  }"
                />
              </div>
            </div>

            <p class="text-xs font-semibold text-primary-700 shrink-0">
              {{ formatNum(p.view_count) }} ครั้ง
            </p>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-secondary-900">
              🧺 ตะกร้าที่ยังค้างอยู่
            </h2>
            <span v-if="activeCarts.length > 0" class="badge badge-yellow"
              >{{ formatNum(activeCarts.length) }} ราย</span
            >
          </div>
          <div v-if="activeCarts.length === 0" class="text-center py-8">
            <p class="text-sm text-secondary-400">ไม่มีตะกร้าค้างอยู่</p>
          </div>
          <div v-else class="space-y-2 max-h-60 overflow-y-auto pr-1">
            <div
              v-for="cart in activeCarts"
              :key="cart.user_id"
              class="flex items-center justify-between p-2.5 rounded-xl bg-secondary-50"
            >
              <div class="min-w-0">
                <p class="text-xs font-semibold text-secondary-800 truncate">
                  {{ cart.user_name }}
                </p>
                <p class="text-xs text-secondary-400">
                  {{
                    new Date(cart.last_updated).toLocaleDateString("th-TH", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }}
                </p>
              </div>
              <span class="badge badge-blue shrink-0 ml-2">
                {{ formatNum(cart.item_count) }} รายการ
              </span>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="flex items-center justify-between mb-4">
            <h2 class="font-bold text-secondary-900">📊 สถิติการใช้งาน</h2>
            <span class="badge badge-teal">7 วันล่าสุด</span>
          </div>
          <div v-if="!sessionStats" class="text-center py-8">
            <p class="text-sm text-secondary-400">ยังไม่มีข้อมูล</p>
          </div>
          <template v-else>
            <div class="grid grid-cols-3 gap-2 mb-4">
              <div class="bg-primary-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold text-primary-700">
                  {{ formatNum(sessionStats.total_sessions) }}
                </p>
                <p class="text-xs text-primary-500 mt-0.5">Sessions</p>
              </div>
              <div class="bg-teal-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold text-teal-700">
                  {{ formatNum(sessionStats.unique_users) }}
                </p>
                <p class="text-xs text-teal-500 mt-0.5">Users</p>
              </div>
              <div class="bg-orange-50 rounded-xl p-3 text-center">
                <p class="text-lg font-bold text-orange-700">
                  {{ formatNum(sessionStats.avg_duration_minutes) }}
                </p>
                <p class="text-xs text-orange-500 mt-0.5">นาที/session</p>
              </div>
            </div>

            <div v-if="sessionStats.daily.length > 0">
              <p class="text-xs text-secondary-400 mb-2">รายวัน (sessions)</p>
              <div class="flex items-end gap-1 h-16">
                <div
                  v-for="day in sessionStats.daily"
                  :key="day.date"
                  class="flex-1 flex flex-col items-center gap-0.5 group"
                >
                  <div class="relative w-full flex justify-center">
                    <div
                      class="absolute -top-6 bg-secondary-800 text-white text-xs rounded px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none"
                    >
                      {{ day.date.slice(5) }} · {{ day.sessions }} sessions
                    </div>
                  </div>
                  <div
                    class="w-full bg-primary-400 rounded-t transition-all"
                    :style="{
                      height:
                        sessionStats &&
                        sessionStats.daily.reduce(
                          (m, d) => Math.max(m, d.sessions),
                          0,
                        ) > 0
                          ? (day.sessions /
                              sessionStats.daily.reduce(
                                (m, d) => Math.max(m, d.sessions),
                                0,
                              )) *
                              56 +
                            'px'
                          : '4px',
                    }"
                  />
                  <p class="text-[9px] text-secondary-400 leading-none">
                    {{ day.date.slice(8) }}
                  </p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <p class="text-xs text-secondary-400">ยังไม่มีข้อมูลรายวัน</p>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>
