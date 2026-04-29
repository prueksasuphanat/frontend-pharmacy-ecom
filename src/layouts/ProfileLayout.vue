<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, RouterView, useRoute } from "vue-router";
import { Navbar, Footer } from "@/components/layout";
import { useAuthStore } from "@/stores/auth.store";
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  ChevronRight,
} from "lucide-vue-next";

const auth = useAuthStore();
const route = useRoute();

const menuItems = [
  { to: "/profile/information", label: "ข้อมูลส่วนตัว", icon: User },
  { to: "/profile/orders", label: "คำสั่งซื้อของฉัน", icon: Package },
  { to: "/profile/address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { to: "/profile/security", label: "เปลี่ยนรหัสผ่าน", icon: Lock },
  { to: "/profile/wishlist", label: "สินค้าที่บันทึกไว้", icon: Heart },
];

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    PHARMACIST: "เภสัชกร",
    DEMO: "Demo",
    CUSTOMER: "ลูกค้า",
  };
  return map[auth.currentUser?.role ?? ""] ?? "ลูกค้า";
});

const fullName = computed(() => {
  const u = auth.currentUser;
  if (!u) return "ผู้ใช้งาน";
  return (
    [u.title, u.first_name, u.last_name].filter(Boolean).join(" ") || u.username
  );
});
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <h1 class="page-title mb-6">บัญชีของฉัน</h1>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- ── Sidebar — hidden on mobile ── -->
        <aside class="hidden lg:block w-64 shrink-0">
          <!-- Profile summary card -->
          <div class="card mb-4 flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden shrink-0"
            >
              <img
                v-if="auth.currentUser?.profile_image?.url"
                :src="auth.currentUser.profile_image.url"
                alt="รูปโปรไฟล์"
                class="w-full h-full object-cover"
              />
              <User v-else class="w-5 h-5 text-primary-500" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-semibold text-secondary-900 truncate">
                {{ fullName }}
              </p>
              <span class="badge badge-teal text-xs mt-0.5">{{
                roleLabel
              }}</span>
            </div>
          </div>

          <!-- Navigation -->
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
              <component :is="item.icon" class="w-4 h-4 shrink-0" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronRight class="w-3.5 h-3.5 opacity-40" />
            </RouterLink>
          </nav>
        </aside>

        <!-- ── Page content ── -->
        <main class="flex-1 min-w-0">
          <RouterView />
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>
