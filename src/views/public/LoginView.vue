<script setup lang="ts">
import { ref } from "vue";
import { useRouter, useRoute, RouterLink } from "vue-router";
import { useForm } from "vee-validate";
import { useToast } from "@/composables";
import { useAuthStore } from "@/stores/auth.store";
import { Eye, EyeOff, Lock, Mail } from "lucide-vue-next";
import { VInput } from "@/components/ui";
import "@/utils/validation";

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();
const toast = useToast();

const showPw = ref(false);

const { handleSubmit } = useForm({
  validationSchema: {
    username: (value: string) => {
      if (!value) return "กรุณากรอกชื่อผู้ใช้";
      return true;
    },
    password: (value: string) => {
      if (!value) return "กรุณากรอกรหัสผ่าน";
      return true;
    },
  },
});

const onSubmit = handleSubmit(async (values) => {
  const success = await auth.login(values.username, values.password);

  if (success) {
    toast.success("เข้าสู่ระบบสำเร็จ");
    const redirect = auth.isAdmin
      ? "/admin/dashboard"
      : (route.query.redirect as string) || "/products";
    router.push(redirect);
  } else {
    toast.error(auth.error || "เข้าสู่ระบบไม่สำเร็จ");
  }
});
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
        <p class="text-secondary-500 text-sm mt-1">Phanadrug</p>
      </div>

      <!-- Login form -->
      <div class="card">
        <form @submit.prevent="onSubmit" novalidate class="space-y-4">
          <VInput
            name="username"
            type="text"
            label="ชื่อผู้ใช้"
            placeholder="username"
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
            <VInput
              name="password"
              :type="showPw ? 'text' : 'password'"
              placeholder="••••••••"
              :icon="Lock"
              :icon-right="showPw ? EyeOff : Eye"
              @icon-right-click="showPw = !showPw"
              required
            />
          </div>

          <p v-if="auth.error" class="error-msg text-center">
            {{ auth.error }}
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
            >สมัครสมาชิก
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
