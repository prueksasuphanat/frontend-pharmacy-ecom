<script setup lang="ts">
import {
  Bell,
  Check,
  CheckCircle,
  Truck,
  PartyPopper,
  X,
  ClipboardCheck,
  AlertTriangle,
  Calendar,
  ShoppingCart,
} from "lucide-vue-next";
import { RouterLink } from "vue-router";
import { useNotificationStore } from "@/stores/customer/notification.store";
import type { Component } from "vue";

const notif = useNotificationStore();

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} นาทีที่แล้ว`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} ชั่วโมงที่แล้ว`;
  return `${Math.floor(hrs / 24)} วันที่แล้ว`;
}

const iconMap: Record<string, Component> = {
  order_confirmed: CheckCircle,
  order_shipped: Truck,
  order_completed: PartyPopper,
  order_cancelled: X,
  prescription_approved: ClipboardCheck,
  prescription_rejected: X,
  low_stock: AlertTriangle,
  expiry_alert: Calendar,
  prescription_pending: Bell,
  new_order: ShoppingCart,
};
</script>

<template>
  <div class="relative">
    <button
      @click="notif.toggle()"
      class="relative p-2 rounded-xl text-secondary-600 hover:bg-secondary-50 transition-colors"
    >
      <Bell class="w-5 h-5" />
      <span
        v-if="notif.unreadCount > 0"
        class="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-danger text-white text-[10px] font-bold rounded-full flex items-center justify-center"
      >
        {{ notif.unreadCount > 9 ? "9+" : notif.unreadCount }}
      </span>
    </button>

    <!-- Overlay -->
    <Transition name="fade">
      <div
        v-if="notif.isOpen"
        class="fixed inset-0 z-30"
        @click="notif.close()"
      />
    </Transition>

    <!-- Dropdown -->
    <Transition name="slide-up">
      <div
        v-if="notif.isOpen"
        class="fixed sm:absolute right-2 sm:right-0 left-2 sm:left-auto mt-2 sm:w-80 max-w-md bg-white rounded-2xl shadow-xl border border-secondary-100 z-40 overflow-hidden max-h-[80vh] sm:max-h-none flex flex-col"
      >
        <div
          class="flex items-center justify-between px-4 py-3 border-b border-secondary-50 shrink-0"
        >
          <h3 class="font-semibold text-sm">การแจ้งเตือน</h3>
          <button
            v-if="notif.unreadCount > 0"
            @click="notif.markAllRead()"
            class="text-xs text-primary-600 hover:text-primary-800 flex items-center gap-1"
          >
            <Check class="w-3 h-3" /> อ่านทั้งหมด
          </button>
        </div>

        <div
          class="flex-1 overflow-y-auto divide-y divide-secondary-50"
          style="max-height: min(18rem, 60vh)"
        >
          <div
            v-if="notif.notifications.length === 0"
            class="py-8 text-center text-secondary-400 text-sm"
          >
            ไม่มีการแจ้งเตือน
          </div>
          <RouterLink
            v-for="n in notif.latest5"
            :key="n.id"
            :to="n.link"
            @click="
              notif.markRead(n.id);
              notif.close();
            "
            :class="[
              'flex gap-3 px-4 py-3 hover:bg-secondary-50 transition-colors',
              !n.is_read && 'bg-primary-50/50',
            ]"
          >
            <component
              :is="iconMap[n.type] || Bell"
              class="w-5 h-5 text-primary-600 shrink-0 mt-0.5"
            />
            <div class="flex-1 min-w-0">
              <p
                :class="[
                  'text-sm leading-snug',
                  !n.is_read
                    ? 'font-semibold text-secondary-900'
                    : 'text-secondary-600',
                ]"
              >
                {{ n.title }}
              </p>
              <p class="text-xs text-secondary-400 mt-0.5 line-clamp-2">
                {{ n.message }}
              </p>
              <p class="text-xs text-secondary-300 mt-1">
                {{ formatTime(n.created_at) }}
              </p>
            </div>
            <div
              v-if="!n.is_read"
              class="w-2 h-2 bg-primary-600 rounded-full mt-1.5 shrink-0"
            />
          </RouterLink>
        </div>

        <div class="border-t border-secondary-50 px-4 py-2.5 shrink-0">
          <RouterLink
            to="/notifications"
            @click="notif.close()"
            class="block text-center text-sm text-primary-600 hover:text-primary-800 font-medium"
          >
            ดูทั้งหมด →
          </RouterLink>
        </div>
      </div>
    </Transition>
  </div>
</template>
