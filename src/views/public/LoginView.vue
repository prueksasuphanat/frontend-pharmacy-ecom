<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useAuthStore, type MockRole } from "@/stores/auth.store";
import { Eye, EyeOff, Lock, Mail, Zap } from "lucide-vue-next";
import { BaseInput } from "@/components/ui";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const email = ref("");
const password = ref("");
const showPw = ref(false);

async function onSubmit() {
  const ok = await auth.login(email.value, password.value);
  if (ok) {
    const redirect = (route.query.redirect as string) || "/products";
    router.push(redirect);
  }
}

// Quick demo login
async function demoLogin(role: MockRole) {
  auth.switchDemoRole(role);
  const redirect =
    role === "admin"
      ? "/admin/dashboard"
      : (route.query.redirect as string) || "/products";
  router.push(redirect);
}

const demoAccounts = [
  {
    role: "admin" as MockRole,
    label: "ผู้ดูแลระบบ",
    color: "bg-primary-600 hover:bg-primary-700",
  },
  {
    role: "wholesale" as MockRole,
    label: "ร้านขายส่ง",
    color: "bg-indigo-600 hover:bg-indigo-700",
  },
  {
    role: "clinic" as MockRole,
    label: "คลินิก",
    color: "bg-violet-600 hover:bg-violet-700",
  },
  {
    role: "retail" as MockRole,
    label: "ลูกค้าทั่วไป",
    color: "bg-emerald-600 hover:bg-emerald-700",
  },
];
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Logo -->
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200"
        >
          <span class="text-white font-bold text-xl">Rx</span>
        </div>
        <h1 class="text-2xl font-bold text-secondary-900">เข้าสู่ระบบ</h1>
        <p class="text-secondary-500 text-sm mt-1">
          ฟาร์มาช็อป — ระบบขายยาออนไลน์
        </p>
      </div>

      <!-- Demo login panel -->
      <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6">
        <div class="flex items-center gap-2 mb-3">
          <Zap class="w-4 h-4 text-amber-600" />
          <span class="text-sm font-semibold text-amber-800"
            >เข้าสู่ระบบด้วย Demo Account</span
          >
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="d in demoAccounts"
            :key="d.role"
            @click="demoLogin(d.role)"
            :class="[
              'text-white text-xs font-medium py-2 px-3 rounded-xl transition-colors',
              d.color,
            ]"
          >
            {{ d.label }}
          </button>
        </div>
      </div>

      <!-- Login form -->
      <div class="card">
        <form @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="email"
            type="email"
            label="อีเมล"
            placeholder="your@email.com"
            :icon="Mail"
            required
          />

          <div>
            <div class="flex justify-between items-center mb-1.5">
              <label class="label mb-0">รหัสผ่าน</label>
              <RouterLink
                to="/forgot-password"
                class="text-xs text-primary-600 hover:text-primary-800"
                >ลืมรหัสผ่าน?</RouterLink
              >
            </div>
            <BaseInput
              v-model="password"
              :type="showPw ? 'text' : 'password'"
              placeholder="••••••••"
              :icon="Lock"
              :icon-right="showPw ? EyeOff : Eye"
              @icon-right-click="showPw = !showPw"
              required
            />
          </div>

          <p v-if="auth.loginError" class="error-msg text-center">
            {{ auth.loginError }}
          </p>

          <button
            type="submit"
            :disabled="auth.isLoading"
            class="btn-primary w-full"
          >
            <span
              v-if="auth.isLoading"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            {{ auth.isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ" }}
          </button>
        </form>

        <p class="text-center text-sm text-secondary-500 mt-5">
          ยังไม่มีบัญชี?
          <RouterLink
            to="/register"
            class="text-primary-600 font-medium hover:text-primary-800"
            >สมัครสมาชิก</RouterLink
          >
        </p>
      </div>
    </div>
  </div>
</template>
