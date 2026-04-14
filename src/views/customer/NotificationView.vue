<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import { useNotificationStore } from '@/stores/notification.store'
import { Check, Bell } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const notif = useNotificationStore()
const iconMap: Record<string, string> = {
  order_confirmed:'✅', order_shipped:'🚚', order_completed:'🎉',
  order_cancelled:'❌', prescription_approved:'📋', prescription_rejected:'❌',
  low_stock:'⚠️', expiry_alert:'📅', prescription_pending:'🔔', new_order:'🛒',
}
function formatTime(iso: string) {
  return new Date(iso).toLocaleString('th-TH', { year:'numeric', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })
}
// TODO: GET /notifications (paginated), polling 30s
</script>
<template>
  <div>
    <Navbar />
    <div class="max-w-2xl mx-auto px-4 py-8">
      <div class="page-header mb-6">
        <h1 class="page-title">การแจ้งเตือน</h1>
        <button v-if="notif.unreadCount > 0" @click="notif.markAllRead()" class="btn-secondary text-sm gap-1.5">
          <Check class="w-4 h-4" /> อ่านทั้งหมด
        </button>
      </div>
      <div v-if="notif.notifications.length === 0" class="text-center py-20">
        <Bell class="w-14 h-14 text-secondary-200 mx-auto mb-4" />
        <p class="text-secondary-400">ไม่มีการแจ้งเตือน</p>
      </div>
      <div v-else class="space-y-2">
        <RouterLink v-for="n in notif.notifications" :key="n.id" :to="n.link"
          @click="notif.markRead(n.id)"
          :class="['card block hover:shadow-md transition-shadow', !n.is_read && 'border-primary-200 bg-primary-50/30']">
          <div class="flex gap-3">
            <span class="text-xl shrink-0">{{ iconMap[n.type] || '🔔' }}</span>
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2">
                <p :class="['text-sm', !n.is_read ? 'font-semibold text-secondary-900' : 'text-secondary-700']">{{ n.title }}</p>
                <div v-if="!n.is_read" class="w-2 h-2 bg-primary-600 rounded-full mt-1 shrink-0" />
              </div>
              <p class="text-xs text-secondary-500 mt-0.5">{{ n.message }}</p>
              <p class="text-xs text-secondary-300 mt-1">{{ formatTime(n.created_at) }}</p>
            </div>
          </div>
        </RouterLink>
      </div>
    </div>
  </div>
</template>
