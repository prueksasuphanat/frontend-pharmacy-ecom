<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { Mail, Eye, EyeOff } from "lucide-vue-next";
import { BaseInput, BaseCheckbox } from "@/components/ui";

const auth = useAuthStore();
const router = useRouter();

const email = ref("");
const password = ref("");
const confirmPw = ref("");
const showPw = ref(false);
const agreed = ref(false);
const isLoading = ref(false);
const registered = ref(false);

async function onSubmit() {
  if (password.value !== confirmPw.value) return;
  isLoading.value = true;
  // TODO: replace with POST /auth/register
  await auth.register(email.value, password.value);
  isLoading.value = false;
  registered.value = true;
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200"
        >
          <span class="text-white font-bold text-xl">Rx</span>
        </div>
        <h1 class="text-2xl font-bold text-secondary-900">สมัครสมาชิก</h1>
        <p class="text-secondary-500 text-sm mt-1">
          เริ่มต้นใช้งานฟาร์มาช็อปฟรี
        </p>
      </div>

      <!-- Success state -->
      <div v-if="registered" class="card text-center">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <span class="text-3xl">📧</span>
        </div>
        <h2 class="font-bold text-lg text-secondary-900 mb-2">
          ตรวจสอบอีเมลของคุณ
        </h2>
        <p class="text-secondary-500 text-sm mb-6">
          เราได้ส่งลิงก์ยืนยันตัวตนไปที่
          <strong>{{ email }}</strong> กรุณายืนยันก่อนเข้าใช้งาน
        </p>
        <!-- TODO: actually send email verify token -->
        <RouterLink to="/products" class="btn-primary w-full"
          >ไปดูสินค้าก่อน</RouterLink
        >
      </div>

      <div v-else class="card">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="email"
            type="email"
            label="อีเมล"
            placeholder="your@email.com"
            :icon="Mail"
            required
          />

          <BaseInput
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            label="รหัสผ่าน"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            :icon-right="showPw ? EyeOff : Eye"
            @icon-right-click="showPw = !showPw"
            required
            minlength="8"
          />

          <BaseInput
            v-model="confirmPw"
            :type="showPw ? 'text' : 'password'"
            label="ยืนยันรหัสผ่าน"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            :error="
              confirmPw && password !== confirmPw ? 'รหัสผ่านไม่ตรงกัน' : ''
            "
            required
          />

          <BaseCheckbox v-model="agreed" required>
            <span class="text-xs text-secondary-600"
              >ฉันยอมรับ<a href="#" class="text-primary-600">
                ข้อกำหนดการใช้งาน</a
              >และ<a href="#" class="text-primary-600"
                >นโยบายความเป็นส่วนตัว</a
              ></span
            >
          </BaseCheckbox>

          <button
            type="submit"
            :disabled="isLoading || password !== confirmPw"
            class="btn-primary w-full"
          >
            <span
              v-if="isLoading"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            {{ isLoading ? "กำลังสมัคร..." : "สมัครสมาชิก" }}
          </button>
        </form>
        <p class="text-center text-sm text-secondary-500 mt-5">
          มีบัญชีแล้ว?
          <RouterLink to="/login" class="text-primary-600 font-medium"
            >เข้าสู่ระบบ</RouterLink
          >
        </p>
      </div>
    </div>
  </div>
</template>
