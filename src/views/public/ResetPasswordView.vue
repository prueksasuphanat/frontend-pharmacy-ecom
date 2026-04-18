<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { BaseInput } from "@/components/ui";
const router = useRouter();
const password = ref("");
const confirm = ref("");
const success = ref(false);
async function onSubmit() {
  // TODO: POST /auth/reset-password?token=
  await new Promise((r) => setTimeout(r, 600));
  success.value = true;
  setTimeout(() => router.push("/login"), 2000);
}
</script>
<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold text-secondary-900">ตั้งรหัสผ่านใหม่</h1>
      </div>
      <div class="card">
        <div v-if="success" class="text-center py-4">
          <div class="text-4xl mb-3">🎉</div>
          <p class="font-semibold text-secondary-900">เปลี่ยนรหัสผ่านสำเร็จ!</p>
          <p class="text-sm text-secondary-500 mt-1">
            กำลังนำไปหน้าเข้าสู่ระบบ...
          </p>
        </div>
        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="password"
            type="password"
            label="รหัสผ่านใหม่"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            required
            minlength="8"
          />

          <BaseInput
            v-model="confirm"
            type="password"
            label="ยืนยันรหัสผ่านใหม่"
            placeholder="กรอกอีกครั้ง"
            :error="confirm && password !== confirm ? 'รหัสผ่านไม่ตรงกัน' : ''"
            required
          />

          <button
            type="submit"
            :disabled="password !== confirm"
            class="btn-primary w-full"
          >
            บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
