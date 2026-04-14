<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { Mail, Eye, EyeOff, User } from 'lucide-vue-next'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const confirmPw = ref('')
const showPw = ref(false)
const agreed = ref(false)
const isLoading = ref(false)
const registered = ref(false)

async function onSubmit() {
  if (password.value !== confirmPw.value) return
  isLoading.value = true
  // TODO: replace with POST /auth/register
  await auth.register(email.value, password.value)
  isLoading.value = false
  registered.value = true
}
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200">
          <span class="text-white font-bold text-xl">Rx</span>
        </div>
        <h1 class="text-2xl font-bold text-secondary-900">สมัครสมาชิก</h1>
        <p class="text-secondary-500 text-sm mt-1">เริ่มต้นใช้งานฟาร์มาช็อปฟรี</p>
      </div>

      <!-- Success state -->
      <div v-if="registered" class="card text-center">
        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span class="text-3xl">📧</span>
        </div>
        <h2 class="font-bold text-lg text-secondary-900 mb-2">ตรวจสอบอีเมลของคุณ</h2>
        <p class="text-secondary-500 text-sm mb-6">
          เราได้ส่งลิงก์ยืนยันตัวตนไปที่ <strong>{{ email }}</strong> กรุณายืนยันก่อนเข้าใช้งาน
        </p>
        <!-- TODO: actually send email verify token -->
        <RouterLink to="/products" class="btn-primary w-full">ไปดูสินค้าก่อน</RouterLink>
      </div>

      <div v-else class="card">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="label">อีเมล</label>
            <div class="relative">
              <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
              <input v-model="email" type="email" placeholder="your@email.com" required class="input pl-9" />
            </div>
          </div>
          <div>
            <label class="label">รหัสผ่าน</label>
            <div class="relative">
              <input v-model="password" :type="showPw ? 'text' : 'password'" placeholder="อย่างน้อย 8 ตัวอักษร" required minlength="8" class="input pr-10" />
              <button type="button" @click="showPw = !showPw" class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary-400">
                <Eye v-if="!showPw" class="w-4 h-4" /><EyeOff v-else class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div>
            <label class="label">ยืนยันรหัสผ่าน</label>
            <input v-model="confirmPw" :type="showPw ? 'text' : 'password'" placeholder="กรอกรหัสผ่านอีกครั้ง" required class="input" :class="{ 'input-error': confirmPw && password !== confirmPw }" />
            <p v-if="confirmPw && password !== confirmPw" class="error-msg">รหัสผ่านไม่ตรงกัน</p>
          </div>
          <label class="flex items-start gap-2 cursor-pointer">
            <input v-model="agreed" type="checkbox" class="mt-0.5 w-4 h-4 rounded border-secondary-300 text-primary-600" required />
            <span class="text-xs text-secondary-600">ฉันยอมรับ<a href="#" class="text-primary-600"> ข้อกำหนดการใช้งาน</a>และ<a href="#" class="text-primary-600">นโยบายความเป็นส่วนตัว</a></span>
          </label>
          <button type="submit" :disabled="isLoading || password !== confirmPw" class="btn-primary w-full">
            <span v-if="isLoading" class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {{ isLoading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}
          </button>
        </form>
        <p class="text-center text-sm text-secondary-500 mt-5">
          มีบัญชีแล้ว? <RouterLink to="/login" class="text-primary-600 font-medium">เข้าสู่ระบบ</RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
