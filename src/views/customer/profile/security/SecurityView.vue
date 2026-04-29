<script setup lang="ts">
import { ref } from "vue";
import { BaseInput } from "@/components/ui";
import {
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
  Lock,
} from "lucide-vue-next";

const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const isSaving = ref(false);
const success = ref(false);
const errorMsg = ref("");

function getPasswordError(): string {
  if (!confirmPassword.value) return "";
  if (newPassword.value !== confirmPassword.value) return "รหัสผ่านไม่ตรงกัน";
  return "";
}

function getPasswordStrength(): {
  label: string;
  color: string;
  width: string;
} {
  const pw = newPassword.value;
  if (!pw) return { label: "", color: "", width: "0%" };
  if (pw.length < 8)
    return { label: "อ่อนเกินไป", color: "bg-red-500", width: "25%" };
  let score = 0;
  if (/[a-z]/.test(pw)) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "อ่อน", color: "bg-red-400", width: "25%" };
  if (score === 2)
    return { label: "ปานกลาง", color: "bg-yellow-400", width: "50%" };
  if (score === 3) return { label: "ดี", color: "bg-green-400", width: "75%" };
  return { label: "แข็งแรง", color: "bg-green-600", width: "100%" };
}

function validateForm(): boolean {
  if (!currentPassword.value) {
    errorMsg.value = "กรุณากรอกรหัสผ่านปัจจุบัน";
    return false;
  }
  if (newPassword.value.length < 8) {
    errorMsg.value = "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร";
    return false;
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = "รหัสผ่านใหม่ไม่ตรงกัน";
    return false;
  }
  return true;
}

async function onSubmit() {
  errorMsg.value = "";
  success.value = false;
  if (!validateForm()) return;
  isSaving.value = true;
  // TODO: PATCH /api/v1/customer/profile/password
  await new Promise((r) => setTimeout(r, 800));
  isSaving.value = false;
  success.value = true;
  currentPassword.value = "";
  newPassword.value = "";
  confirmPassword.value = "";
}

function resetForm() {
  success.value = false;
  errorMsg.value = "";
}
</script>

<template>
  <div>
    <div class="card">
      <div class="flex items-center gap-3 mb-6">
        <div
          class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
        >
          <ShieldCheck class="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 class="text-lg font-bold text-secondary-900">เปลี่ยนรหัสผ่าน</h2>
          <p class="text-sm text-secondary-500 mt-0.5">
            เพื่อความปลอดภัย ควรเปลี่ยนรหัสผ่านเป็นประจำ
          </p>
        </div>
      </div>

      <div v-if="success" class="text-center py-8">
        <div
          class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle class="w-8 h-8 text-green-600" />
        </div>
        <p class="font-bold text-secondary-900 mb-1">เปลี่ยนรหัสผ่านสำเร็จ</p>
        <p class="text-sm text-secondary-500 mb-6">
          รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว
        </p>
        <button @click="resetForm" class="btn-outline text-sm">
          เปลี่ยนรหัสผ่านอีกครั้ง
        </button>
      </div>

      <form v-else @submit.prevent="onSubmit" class="space-y-5 max-w-md">
        <div
          v-if="errorMsg"
          class="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
        >
          <AlertCircle class="w-4 h-4 shrink-0" />
          {{ errorMsg }}
        </div>

        <BaseInput
          v-model="currentPassword"
          :type="showCurrentPw ? 'text' : 'password'"
          label="รหัสผ่านปัจจุบัน"
          placeholder="กรอกรหัสผ่านปัจจุบัน"
          :icon="Lock"
          :icon-right="showCurrentPw ? EyeOff : Eye"
          @icon-right-click="showCurrentPw = !showCurrentPw"
          required
        />

        <div class="border-t border-secondary-100 pt-5" />

        <div>
          <BaseInput
            v-model="newPassword"
            :type="showNewPw ? 'text' : 'password'"
            label="รหัสผ่านใหม่"
            placeholder="อย่างน้อย 8 ตัวอักษร"
            :icon="Lock"
            :icon-right="showNewPw ? EyeOff : Eye"
            @icon-right-click="showNewPw = !showNewPw"
            required
          />
          <div v-if="newPassword" class="mt-2">
            <div class="flex items-center gap-2">
              <div
                class="flex-1 h-1.5 bg-secondary-100 rounded-full overflow-hidden"
              >
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-300',
                    getPasswordStrength().color,
                  ]"
                  :style="{ width: getPasswordStrength().width }"
                />
              </div>
              <span class="text-xs text-secondary-500 whitespace-nowrap">{{
                getPasswordStrength().label
              }}</span>
            </div>
            <ul class="mt-2 space-y-1">
              <li
                :class="[
                  'text-xs flex items-center gap-1.5',
                  newPassword.length >= 8
                    ? 'text-green-600'
                    : 'text-secondary-400',
                ]"
              >
                <CheckCircle class="w-3 h-3" /> อย่างน้อย 8 ตัวอักษร
              </li>
              <li
                :class="[
                  'text-xs flex items-center gap-1.5',
                  /[A-Z]/.test(newPassword)
                    ? 'text-green-600'
                    : 'text-secondary-400',
                ]"
              >
                <CheckCircle class="w-3 h-3" /> มีตัวอักษรพิมพ์ใหญ่
              </li>
              <li
                :class="[
                  'text-xs flex items-center gap-1.5',
                  /\d/.test(newPassword)
                    ? 'text-green-600'
                    : 'text-secondary-400',
                ]"
              >
                <CheckCircle class="w-3 h-3" /> มีตัวเลข
              </li>
            </ul>
          </div>
        </div>

        <BaseInput
          v-model="confirmPassword"
          :type="showNewPw ? 'text' : 'password'"
          label="ยืนยันรหัสผ่านใหม่"
          placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
          :icon="Lock"
          :error="getPasswordError()"
          required
        />

        <div class="pt-2">
          <button
            type="submit"
            :disabled="
              isSaving ||
              newPassword !== confirmPassword ||
              newPassword.length < 8
            "
            class="btn-primary gap-2"
          >
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Lock v-else class="w-4 h-4" />
            {{ isSaving ? "กำลังบันทึก..." : "เปลี่ยนรหัสผ่าน" }}
          </button>
        </div>
      </form>
    </div>

    <div class="card mt-4">
      <h3 class="text-sm font-semibold text-secondary-700 mb-3">
        💡 เคล็ดลับความปลอดภัย
      </h3>
      <ul class="space-y-2 text-xs text-secondary-500">
        <li class="flex items-start gap-2">
          <span class="text-primary-500 mt-0.5">•</span>
          ใช้รหัสผ่านที่ไม่ซ้ำกับเว็บไซต์อื่น
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-500 mt-0.5">•</span> ผสมตัวอักษรพิมพ์ใหญ่
          พิมพ์เล็ก ตัวเลข และอักขระพิเศษ
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-500 mt-0.5">•</span> หลีกเลี่ยงข้อมูลส่วนตัว
          เช่น ชื่อ วันเกิด เบอร์โทร
        </li>
        <li class="flex items-start gap-2">
          <span class="text-primary-500 mt-0.5">•</span> เปลี่ยนรหัสผ่านทุก 3-6
          เดือน
        </li>
      </ul>
    </div>
  </div>
</template>
