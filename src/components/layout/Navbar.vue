<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { RouterLink, useRouter } from "vue-router";
import {
  ShoppingCart,
  Bell,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Package,
  MapPin,
  Lock,
  Heart,
  Settings,
} from "lucide-vue-next";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { useNotificationStore } from "@/stores/notification.store";
import MiniCart from "@/components/cart/MiniCart.vue";
import NotificationBell from "@/components/notification/NotificationBell.vue";

const router = useRouter();
const auth = useAuthStore();
const cart = useCartStore();
const notif = useNotificationStore();

const mobileOpen = ref(false);
const userMenuOpen = ref(false);

// Close menus when clicking outside
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest("#user-menu-btn")) userMenuOpen.value = false;
}
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  if (auth.isLoggedIn) notif.startPolling();
});
onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  notif.stopPolling();
});

async function logout() {
  auth.logout();
  cart.clearCart();
  router.push("/login");
}
</script>

<template>
  <header
    class="sticky top-0 z-40 bg-white border-b border-secondary-100 shadow-sm"
  >
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink to="/products" class="flex items-center gap-2.5 shrink-0">
          <div
            class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center"
          >
            <span class="text-white font-bold text-sm">Rx</span>
          </div>
          <span class="font-bold text-lg text-secondary-900 hidden sm:block"
            >Phanadrug</span
          >
        </RouterLink>

        <!-- Search (desktop) -->
        <div class="hidden md:flex flex-1 max-w-md mx-6">
          <RouterLink
            to="/products"
            class="w-full flex items-center gap-2 px-4 py-2 bg-secondary-50 border border-secondary-200 rounded-xl text-sm text-secondary-400 hover:border-primary-400 transition-colors"
          >
            <svg
              class="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            ค้นหายา...
          </RouterLink>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-1">
          <!-- Admin badge -->
          <RouterLink
            v-if="auth.isAdmin || auth.userRole === 'DEMO'"
            to="/admin/dashboard"
            class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors"
          >
            <Settings class="w-3.5 h-3.5" /> จัดการระบบ
          </RouterLink>

          <!-- Notification bell -->
          <NotificationBell v-if="auth.isLoggedIn" />

          <!-- Cart -->
          <MiniCart />

          <!-- User menu (logged in) -->
          <div v-if="auth.isLoggedIn" class="relative">
            <button
              id="user-menu-btn"
              @click="userMenuOpen = !userMenuOpen"
              class="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-secondary-50 transition-colors text-sm font-medium text-secondary-700"
            >
              <div
                class="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center"
              >
                <User class="w-4 h-4 text-primary-700" />
              </div>
              <span class="hidden sm:block max-w-24 truncate">{{
                auth.currentUser?.email?.split("@")[0]
              }}</span>
              <ChevronDown class="w-3.5 h-3.5 text-secondary-400" />
            </button>

            <Transition name="slide-up">
              <div
                v-if="userMenuOpen"
                class="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-secondary-100 py-2 z-50"
              >
                <div class="px-4 py-2 border-b border-secondary-50 mb-1">
                  <p class="text-sm font-semibold text-secondary-800 truncate">
                    {{ auth.currentUser?.email }}
                  </p>
                </div>
                <RouterLink
                  to="/profile/information"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <User class="w-4 h-4" /> โปรไฟล์
                </RouterLink>
                <RouterLink
                  to="/profile/orders"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <Package class="w-4 h-4" /> คำสั่งซื้อของฉัน
                </RouterLink>
                <RouterLink
                  to="/profile/wishlist"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <Heart class="w-4 h-4" /> รายการที่บันทึก
                </RouterLink>
                <RouterLink
                  to="/profile/address"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <MapPin class="w-4 h-4" /> ที่อยู่จัดส่ง
                </RouterLink>
                <RouterLink
                  to="/profile/security"
                  @click="userMenuOpen = false"
                  class="flex items-center gap-2.5 px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50"
                >
                  <Lock class="w-4 h-4" /> รหัสผ่าน
                </RouterLink>
                <div class="border-t border-secondary-50 mt-1 pt-1">
                  <button
                    @click="logout"
                    class="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50"
                  >
                    <LogOut class="w-4 h-4" /> ออกจากระบบ
                  </button>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Guest buttons -->
          <template v-else>
            <RouterLink to="/login" class="btn-ghost text-sm"
              >เข้าสู่ระบบ</RouterLink
            >
            <RouterLink
              to="/register"
              class="btn-primary text-sm hidden sm:flex"
              >สมัครสมาชิก</RouterLink
            >
          </template>

          <!-- Mobile menu button -->
          <button
            @click="mobileOpen = !mobileOpen"
            class="ml-1 p-2 rounded-lg text-secondary-500 hover:bg-secondary-50 md:hidden"
          >
            <Menu v-if="!mobileOpen" class="w-5 h-5" />
            <X v-else class="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile menu -->
    <Transition name="slide-up">
      <div
        v-if="mobileOpen"
        class="md:hidden border-t border-secondary-100 bg-white px-4 py-3 space-y-1"
      >
        <RouterLink
          to="/products"
          @click="mobileOpen = false"
          class="block py-2 text-sm text-secondary-700"
          >สินค้าทั้งหมด</RouterLink
        >
        <RouterLink
          v-if="auth.isAdmin"
          to="/admin/dashboard"
          @click="mobileOpen = false"
          class="block py-2 text-sm text-primary-700 font-medium"
          >จัดการระบบ</RouterLink
        >
        <RouterLink
          v-if="!auth.isLoggedIn"
          to="/register"
          @click="mobileOpen = false"
          class="block py-2 text-sm text-primary-700 font-medium"
          >สมัครสมาชิก</RouterLink
        >
      </div>
    </Transition>
  </header>
</template>
