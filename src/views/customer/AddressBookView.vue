<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import { MapPin, Plus, Trash2, Check } from 'lucide-vue-next'
import { ref } from 'vue'
const addresses = ref([
  { id:1, label:'บ้าน', recipient:'นาย สมชาย ใจดี', phone:'081-234-5678', address:'123/45 ถ.พหลโยธิน', district:'จตุจักร', province:'กรุงเทพมหานคร', postal_code:'10900', is_default:true },
  { id:2, label:'ที่ทำงาน', recipient:'สมชาย ใจดี', phone:'02-345-6789', address:'456 ถ.สีลม', district:'บางรัก', province:'กรุงเทพมหานคร', postal_code:'10500', is_default:false },
])
// TODO: GET /addresses, POST /addresses, PUT /addresses/:id, DELETE /addresses/:id, PATCH /addresses/:id/default
</script>
<template>
  <div>
    <Navbar />
    <div class="max-w-3xl mx-auto px-4 py-8">
      <div class="page-header mb-6">
        <h1 class="page-title">ที่อยู่จัดส่ง</h1>
        <button class="btn-primary text-sm gap-1.5"><Plus class="w-4 h-4" /> เพิ่มที่อยู่</button>
      </div>
      <div class="space-y-3">
        <div v-for="addr in addresses" :key="addr.id"
          :class="['card flex gap-4', addr.is_default && 'ring-2 ring-primary-400']">
          <MapPin class="w-5 h-5 text-primary-600 mt-0.5 shrink-0" />
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-sm text-secondary-900">{{ addr.label }}</span>
              <span v-if="addr.is_default" class="badge badge-teal text-xs">ค่าเริ่มต้น</span>
            </div>
            <p class="text-sm text-secondary-700">{{ addr.recipient }} · {{ addr.phone }}</p>
            <p class="text-sm text-secondary-500">{{ addr.address }}, {{ addr.district }}, {{ addr.province }} {{ addr.postal_code }}</p>
            <div class="flex gap-2 mt-3">
              <button class="btn-secondary text-xs py-1">แก้ไข</button>
              <button v-if="!addr.is_default" class="btn-ghost text-xs py-1 text-primary-600 gap-1"><Check class="w-3 h-3" /> ตั้งเป็นค่าเริ่มต้น</button>
              <button class="btn-ghost text-xs py-1 text-danger gap-1"><Trash2 class="w-3 h-3" /> ลบ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
