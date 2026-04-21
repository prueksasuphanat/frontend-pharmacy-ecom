<script setup lang="ts">
import { ref } from "vue";
import {
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  ClipboardList,
  BarChart2,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { MOCK_PRODUCTS } from "@/__mocks__/products";
import { MOCK_ORDERS } from "@/__mocks__/orders";
import { MOCK_LOTS } from "@/__mocks__/inventory";
import VueApexCharts from "vue3-apexcharts";

// TODO: replace all with GET /admin/dashboard/* (Kysely queries)

const lowStockProducts = MOCK_PRODUCTS.filter(
  (p) => p.stock <= p.reorder_level && !p.is_deleted,
);
const pendingOrders = MOCK_ORDERS.filter((o) => o.status === "pending");
const prescPending = MOCK_ORDERS.filter(
  (o) => o.prescription_status === "pending",
);

const today = new Date().toDateString();
const todaySales = MOCK_ORDERS.filter(
  (o) =>
    o.status === "confirmed" && new Date(o.updated_at).toDateString() === today,
).reduce((s, o) => s + o.total_amount, 0);

// Chart data
const chartSeries = [
  {
    name: "ยอดขาย (฿)",
    data: [
      28000, 35000, 44000, 38000, 52000, 61000, 55000, 48000, 67000, 72000,
      58000, 80000,
    ],
  },
];
const chartOptions = {
  chart: {
    type: "bar",
    toolbar: { show: false },
    fontFamily: "Noto Sans Thai, Inter, sans-serif",
  },
  colors: ["#0d9488"],
  plotOptions: { bar: { borderRadius: 6, columnWidth: "55%" } },
  dataLabels: { enabled: false },
  xaxis: {
    categories: [
      "ม.ค.",
      "ก.พ.",
      "มี.ค.",
      "เม.ย.",
      "พ.ค.",
      "มิ.ย.",
      "ก.ค.",
      "ส.ค.",
      "ก.ย.",
      "ต.ค.",
      "พ.ย.",
      "ธ.ค.",
    ],
    labels: { style: { colors: "#64748b", fontSize: "12px" } },
  },
  yaxis: {
    labels: {
      formatter: (v: number) => "฿" + (v / 1000).toFixed(0) + "k",
      style: { colors: "#64748b" },
    },
  },
  grid: { borderColor: "#f1f5f9" },
  tooltip: { y: { formatter: (v: number) => "฿" + v.toLocaleString("th-TH") } },
};

// Top products (mock)
const topProducts = [
  { name: "สูตร A — พาราเซตามอล 500 mg", sold: 1240, revenue: 31000 },
  { name: "วิตามิน C 1000 mg", sold: 890, revenue: 160200 },
  { name: "โอเมก้า-3 1000 mg", sold: 620, revenue: 179800 },
  { name: "ครีมซันสกรีน SPF50+", sold: 480, revenue: 201600 },
  { name: "ลอราทาดีน 10 mg", sold: 430, revenue: 36550 },
];

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}
</script>

<template>
  <div>
    <h1 class="page-title mb-6">[TODO] แดชบอร์ด</h1>

    <!-- Stat cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div class="stat-card">
        <div class="stat-icon bg-primary-100">
          <TrendingUp class="w-6 h-6 text-primary-600" />
        </div>
        <div>
          <p class="text-xs text-secondary-400">ยอดขายวันนี้</p>
          <p class="text-xl font-bold text-secondary-900">
            ฿{{ fmt(todaySales || 42500) }}
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
            {{ pendingOrders.length }}
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-orange-100">
          <Package class="w-6 h-6 text-orange-600" />
        </div>
        <div>
          <p class="text-xs text-secondary-400">สินค้าใกล้หมด</p>
          <p class="text-xl font-bold text-secondary-900">
            {{ lowStockProducts.length }}
          </p>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bg-yellow-100">
          <ClipboardList class="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <p class="text-xs text-secondary-400">ใบสั่งยารอรีวิว</p>
          <p class="text-xl font-bold text-secondary-900">
            {{ prescPending.length }}
          </p>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Sales chart -->
      <div class="card lg:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-secondary-900">ยอดขายรายเดือน 2026</h2>
          <span class="badge badge-teal">12 เดือนล่าสุด</span>
        </div>
        <!-- TODO: GET /admin/dashboard/sales-chart -->
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
        <!-- TODO: GET /admin/dashboard/top-products -->
        <div class="space-y-3">
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
              ฿{{ (p.revenue / 1000).toFixed(0) }}k
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Alerts row -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Low stock -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-secondary-900">⚠️ สินค้าใกล้หมด</h2>
          <RouterLink to="/admin/products" class="text-xs text-primary-600"
            >ดูทั้งหมด →</RouterLink
          >
        </div>
        <!-- TODO: GET /admin/dashboard/alerts -->
        <div class="space-y-2">
          <div
            v-for="p in lowStockProducts"
            :key="p.id"
            class="flex items-center justify-between p-3 bg-orange-50 rounded-xl"
          >
            <div>
              <p class="text-sm font-medium text-secondary-800">{{ p.name }}</p>
              <p class="text-xs text-secondary-400">{{ p.sku }}</p>
            </div>
            <div class="text-right">
              <span
                :class="['badge', p.stock === 0 ? 'badge-red' : 'badge-yellow']"
              >
                {{ p.stock === 0 ? "หมด" : `เหลือ ${p.stock}` }}
              </span>
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
        <div class="space-y-2">
          <RouterLink
            v-for="order in MOCK_ORDERS.slice(0, 4)"
            :key="order.id"
            :to="`/admin/orders/${order.id}`"
            class="flex items-center justify-between p-3 hover:bg-secondary-50 rounded-xl transition-colors"
          >
            <div>
              <p class="text-sm font-mono font-medium text-secondary-800">
                {{ order.id }}
              </p>
              <p class="text-xs text-secondary-400">{{ order.user_email }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-semibold text-secondary-900">
                ฿{{ fmt(order.total_amount) }}
              </p>
              <span
                :class="[
                  'badge text-xs',
                  order.status === 'pending'
                    ? 'badge-yellow'
                    : order.status === 'completed'
                      ? 'badge-green'
                      : order.status === 'shipped'
                        ? 'badge-teal'
                        : order.status === 'confirmed'
                          ? 'badge-blue'
                          : 'badge-red',
                ]"
              >
                {{
                  {
                    pending: "รอดำเนินการ",
                    confirmed: "ยืนยัน",
                    shipped: "จัดส่ง",
                    completed: "สำเร็จ",
                    cancelled: "ยกเลิก",
                  }[order.status]
                }}
              </span>
            </div>
          </RouterLink>
        </div>
      </div>
    </div>
  </div>
</template>
