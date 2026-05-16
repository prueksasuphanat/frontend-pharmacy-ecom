<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Loader2,
  BarChart3,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import VueApexCharts from "vue3-apexcharts";
import {
  adminDashboardApi,
  type DashboardSummary,
  type TopProduct,
  type RecentOrder,
} from "@/api/admin/dashboard";
import { formatPrice } from "@/utils/format";

const loading = ref(true);
const summary = ref<DashboardSummary>({
  today_sales: 0,
  pending_orders: 0,
  low_stock_count: 0,
  total_orders: 0,
});
const topProducts = ref<TopProduct[]>([]);
const recentOrders = ref<RecentOrder[]>([]);

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
    const [summaryRes, chartRes, topRes, recentRes] = await Promise.all([
      adminDashboardApi.getSummary(),
      adminDashboardApi.getSalesChart(),
      adminDashboardApi.getTopProducts(),
      adminDashboardApi.getRecentOrders(),
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
  } catch {
    // graceful fallback
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

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center py-20">
      <Loader2 class="w-8 h-8 text-primary-600 animate-spin" />
    </div>

    <template v-else>
      <!-- Stat cards -->
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
              {{ summary.pending_orders }}
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
              {{ summary.low_stock_count }}
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
              {{ summary.total_orders }}
            </p>
          </div>
        </div>
      </div>

      <!-- Charts row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Sales chart -->
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

        <!-- Top products -->
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
                <p class="text-xs text-secondary-400">{{ p.sold }} ชิ้น</p>
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

      <!-- Recent orders -->
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
    </template>
  </div>
</template>
