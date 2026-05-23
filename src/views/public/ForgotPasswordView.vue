<script setup lang="ts">
import { ref } from "vue";
import { RouterLink } from "vue-router";
import { Mail } from "lucide-vue-next";
import { BaseInput } from "@/components/ui";
import { authApi } from "@/api/auth";
import { useToast } from "@/composables";

const toast = useToast();
const email = ref("");
const sent = ref(false);
const isLoading = ref(false);
const errorMessage = ref("");

async function onSubmit() {
  if (!email.value) {
    errorMessage.value = "กรุณากรอกอีเมล";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await authApi.forgotPassword(email.value);

    if (response.data.success) {
      sent.value = true;
      toast.success("ส่งลิงก์รีเซ็ตรหัสผ่านแล้ว");
    }
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
    toast.error(errorMessage.value);
  } finally {
    isLoading.value = false;
  }
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
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <Mail class="w-8 h-8 text-green-600" />
          </div>
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
            :error="errorMessage"
            required
          />
          <button
            type="submit"
            :disabled="isLoading"
            class="btn-primary w-full"
          >
            <span
              v-if="isLoading"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
            />
            {{ isLoading ? "กำลังส่ง..." : "ส่งลิงก์รีเซ็ตรหัสผ่าน" }}
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
