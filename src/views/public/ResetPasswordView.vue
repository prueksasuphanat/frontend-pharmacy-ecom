<script setup lang="ts">
import { ref, onMounted } from "vue";
import { RouterLink, useRouter, useRoute } from "vue-router";
import { BaseInput } from "@/components/ui";
import { authApi } from "@/api/auth";
import { useToast } from "@/composables";
import { AlertTriangle, PartyPopper, Eye, EyeOff } from "lucide-vue-next";

const router = useRouter();
const route = useRoute();
const toast = useToast();

const token = ref("");
const password = ref("");
const confirm = ref("");
const success = ref(false);
const isLoading = ref(false);
const isVerifying = ref(true);
const tokenValid = ref(false);
const errorMessage = ref("");
const username = ref("");
const showPw = ref(false);

// ตรวจสอบ token เมื่อโหลดหน้า
onMounted(async () => {
  token.value = (route.query.token as string) || "";

  if (!token.value) {
    errorMessage.value = "ไม่พบ token กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่";
    isVerifying.value = false;
    return;
  }

  try {
    const response = await authApi.verifyResetToken(token.value);
    if (response.data.success && response.data.data.valid) {
      tokenValid.value = true;
      username.value = response.data.data.username;
    } else {
      errorMessage.value = "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว";
    }
  } catch (error: any) {
    errorMessage.value =
      error.response?.data?.message ||
      "ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาขอลิงก์ใหม่";
  } finally {
    isVerifying.value = false;
  }
});

async function onSubmit() {
  if (password.value !== confirm.value) {
    errorMessage.value = "รหัสผ่านไม่ตรงกัน";
    return;
  }

  if (password.value.length < 8) {
    errorMessage.value = "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";

  try {
    const response = await authApi.resetPassword(token.value, password.value);

    if (response.data.success) {
      success.value = true;
      toast.success("เปลี่ยนรหัสผ่านสำเร็จ");
      setTimeout(() => router.push("/login"), 2000);
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
        <h1 class="text-2xl font-bold text-secondary-900">ตั้งรหัสผ่านใหม่</h1>
        <p v-if="username" class="text-sm text-secondary-500 mt-1">
          สำหรับบัญชี: <strong>{{ username }}</strong>
        </p>
      </div>

      <div class="card">
        <!-- Loading state -->
        <div v-if="isVerifying" class="text-center py-8">
          <div
            class="inline-block w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-3"
          />
          <p class="text-sm text-secondary-500">กำลังตรวจสอบลิงก์...</p>
        </div>

        <!-- Token invalid -->
        <div v-else-if="!tokenValid" class="text-center py-4">
          <div
            class="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <AlertTriangle class="w-8 h-8 text-amber-600" />
          </div>
          <p class="font-semibold text-secondary-900 mb-2">
            ลิงก์ไม่ถูกต้องหรือหมดอายุ
          </p>
          <p class="text-sm text-secondary-500 mb-4">{{ errorMessage }}</p>
          <RouterLink to="/forgot-password" class="btn-primary inline-flex">
            ขอลิงก์ใหม่
          </RouterLink>
          <RouterLink
            to="/login"
            class="block text-center text-sm text-secondary-500 hover:text-secondary-700 mt-3"
          >
            กลับหน้าเข้าสู่ระบบ
          </RouterLink>
        </div>

        <!-- Success state -->
        <div v-else-if="success" class="text-center py-4">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <PartyPopper class="w-8 h-8 text-green-600" />
          </div>
          <p class="font-semibold text-secondary-900">เปลี่ยนรหัสผ่านสำเร็จ!</p>
          <p class="text-sm text-secondary-500 mt-1">
            กำลังนำไปหน้าเข้าสู่ระบบ...
          </p>
        </div>

        <!-- Reset password form -->
        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="password"
            :type="showPw ? 'text' : 'password'"
            label="รหัสผ่านใหม่"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            :icon-right="showPw ? EyeOff : Eye"
            @icon-right-click="showPw = !showPw"
            required
            minlength="8"
          />

          <BaseInput
            v-model="confirm"
            :type="showPw ? 'text' : 'password'"
            label="ยืนยันรหัสผ่านใหม่"
            placeholder="กรอกอีกครั้ง"
            :error="
              confirm && password !== confirm
                ? 'รหัสผ่านไม่ตรงกัน'
                : errorMessage
            "
            required
          />

          <button
            type="submit"
            :disabled="password !== confirm || isLoading"
            class="btn-primary w-full"
          >
            <span
              v-if="isLoading"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"
            />
            {{ isLoading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่" }}
          </button>

          <RouterLink
            to="/login"
            class="block text-center text-sm text-secondary-500 hover:text-secondary-700"
          >
            ← กลับหน้าเข้าสู่ระบบ
          </RouterLink>
        </form>
      </div>
    </div>
  </div>
</template>
