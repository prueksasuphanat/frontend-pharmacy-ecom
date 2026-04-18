<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Mail } from "lucide-vue-next";
import { BaseInput } from "@/components/ui";
const email = ref("");
const sent = ref(false);
async function onSubmit() {
  // TODO: POST /auth/forgot-password
  await new Promise((r) => setTimeout(r, 600));
  sent.value = true;
}
</script>
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4"
        >
          <Mail class="w-7 h-7 text-primary-600" />
        </div>
        <h1 class="text-2xl font-bold text-secondary-900">ลืมรหัสผ่าน?</h1>
        <p class="text-secondary-500 text-sm mt-1">
          กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน
        </p>
      </div>
      <div class="card">
        <div v-if="sent" class="text-center py-4">
          <div class="text-4xl mb-3">📧</div>
          <p class="font-semibold text-secondary-900 mb-1">ส่งลิงก์แล้ว!</p>
          <p class="text-sm text-secondary-500">
            ตรวจสอบอีเมล <strong>{{ email }}</strong>
          </p>
          <RouterLink to="/login" class="btn-secondary mt-4 inline-flex"
            >กลับหน้าเข้าสู่ระบบ</RouterLink
          >
        </div>
        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="email"
            type="email"
            label="อีเมล"
            placeholder="your@email.com"
            required
          />
          <button type="submit" class="btn-primary w-full">
            ส่งลิงก์รีเซ็ตรหัสผ่าน
          </button>
          <RouterLink
            to="/login"
            class="block text-center text-sm text-secondary-500 hover:text-secondary-700"
            >← กลับ</RouterLink
          >
        </form>
      </div>
    </div>
  </div>
</template>
