<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import AdminSidebar from "@/components/layout/AdminSidebar.vue";
import { useAuthStore } from "@/stores/auth.store";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  BarChart2,
  Settings,
} from "lucide-vue-next";
import { useRoute } from "vue-router";
import NotificationBell from "@/components/notification/NotificationBell.vue";
import { onMounted, onUnmounted } from "vue";
import { useNotificationStore } from "@/stores/notification.store";

const auth = useAuthStore();
const notif = useNotificationStore();
const route = useRoute();

onMounted(() => notif.startPolling());
onUnmounted(() => notif.stopPolling());

const mobileLinks = [
  { to: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { to: "/admin/orders", label: "คำสั่งซื้อ", icon: ShoppingBag },
  { to: "/admin/inventory", label: "คลังสินค้า", icon: Package },
  { to: "/admin/logs", label: "บันทึก", icon: BarChart2 },
  { to: "/admin/settings", label: "ตั้งค่า", icon: Settings },
];
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-secondary-50">
    <AdminSidebar />

    <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
      <!-- Top bar -->
      <header
        class="bg-white border-b border-secondary-100 px-6 h-16 flex items-center justify-between shrink-0"
      >
        <div>
          <h1 class="text-sm font-semibold text-secondary-900">
            ยินดีต้อนรับ,
            {{ auth.currentUser?.full_name || auth.currentUser?.email }}
          </h1>
          <p class="text-xs text-secondary-400">
            {{
              new Date().toLocaleDateString("th-TH", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <NotificationBell />
          <RouterLink to="/products" class="btn-secondary text-xs"
            >← หน้าร้าน</RouterLink
          >
        </div>
      </header>

      <!-- Main content -->
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>

    <!-- Mobile bottom nav -->
    <nav
      class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-secondary-100 flex z-30"
    >
      <RouterLink
        v-for="link in mobileLinks"
        :key="link.to"
        :to="link.to"
        class="flex-1 flex flex-col items-center gap-0.5 py-2 text-secondary-400 hover:text-primary-600"
        :class="{
          'text-primary-600': link.to.includes('/settings')
            ? route.path.startsWith('/admin/settings')
            : route.path.startsWith(link.to),
        }"
      >
        <component :is="link.icon" class="w-5 h-5" />
        <span class="text-[10px]">{{ link.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>
