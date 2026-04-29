<script setup lang="ts">
import { ref } from "vue";
import { Navbar, Footer } from "@/components/layout";
import { BaseInput } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { RouterLink, useRoute } from "vue-router";
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  ChevronRight,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-vue-next";

const auth = useAuthStore();
const route = useRoute();

// ── Sidebar menu ──────────────────────────────────────────
const menuItems = [
  { to: "/profile/information", label: "ข้อมูลส่วนตัว", icon: User },
  { to: "/profile/orders", label: "คำสั่งซื้อของฉัน", icon: Package },
  { to: "/profile/address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { to: "/profile/security", label: "เปลี่ยนรหัสผ่าน", icon: Lock },
  { to: "/profile/wishlist", label: "สินค้าที่บันทึกไว้", icon: Heart },
];

// ── Form state ────────────────────────────────────────────
const currentPassword = ref("");
const newPassword = ref("");
const confirmPassword = ref("");
const showCurrentPw = ref(false);
const showNewPw = ref(false);
const isSaving = ref(false);
const success = ref(false);
const errorMsg = ref("");

// ── Validation ────────────────────────────────────────────
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

const isFormValid = ref(true);

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

// ── Actions ───────────────────────────────────────────────
async function onSubmit() {
  errorMsg.value = "";
  success.value = false;

  if (!validateForm()) return;

  isSaving.value = true;

  // TODO: PATCH /api/v1/profile/password
  // await apiClient.patch('/profile/password', {
  //   current_password: currentPassword.value,
  //   new_password: newPassword.value,
  // })
  await new Promise((r) => setTimeout(r, 800));

  isSaving.value = false;
  success.value = true;

  // Reset form
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
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <h1 class="page-title mb-6">บัญชีของฉัน</h1>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- ── Sidebar ── -->
        <aside class="w-full lg:w-64 shrink-0">
          <nav class="card p-2 space-y-0.5">
            <RouterLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors',
                route.path === item.to
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-600 hover:bg-secondary-50',
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronRight class="w-3.5 h-3.5 opacity-40" />
            </RouterLink>
          </nav>
        </aside>

        <!-- ── Main content ── -->
        <main class="flex-1 min-w-0">
          <div class="card">
            <!-- Header -->
            <div class="flex items-center gap-3 mb-6">
              <div
                class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center"
              >
                <ShieldCheck class="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h2 class="text-lg font-bold text-secondary-900">
                  เปลี่ยนรหัสผ่าน
                </h2>
                <p class="text-sm text-secondary-500 mt-0.5">
                  เพื่อความปลอดภัย ควรเปลี่ยนรหัสผ่านเป็นประจำ
                </p>
              </div>
            </div>

            <!-- Success state -->
            <div v-if="success" class="text-center py-8">
              <div
                class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <CheckCircle class="w-8 h-8 text-green-600" />
              </div>
              <p class="font-bold text-secondary-900 mb-1">
                เปลี่ยนรหัสผ่านสำเร็จ
              </p>
              <p class="text-sm text-secondary-500 mb-6">
                รหัสผ่านของคุณได้รับการอัปเดตเรียบร้อยแล้ว
              </p>
              <button @click="resetForm" class="btn-outline text-sm">
                เปลี่ยนรหัสผ่านอีกครั้ง
              </button>
            </div>

            <!-- Form -->
            <form v-else @submit.prevent="onSubmit" class="space-y-5 max-w-md">
              <!-- Error message -->
              <div
                v-if="errorMsg"
                class="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700"
              >
                <AlertCircle class="w-4 h-4 shrink-0" />
                {{ errorMsg }}
              </div>

              <!-- Current password -->
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

              <div class="border-t border-secondary-100 pt-5"></div>

              <!-- New password -->
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
                <!-- Password strength indicator -->
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
                    <span class="text-xs text-secondary-500 whitespace-nowrap">
                      {{ getPasswordStrength().label }}
                    </span>
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

              <!-- Confirm password -->
              <BaseInput
                v-model="confirmPassword"
                :type="showNewPw ? 'text' : 'password'"
                label="ยืนยันรหัสผ่านใหม่"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                :icon="Lock"
                :error="getPasswordError()"
                required
              />

              <!-- Submit -->
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

          <!-- Security tips -->
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
                <span class="text-primary-500 mt-0.5">•</span>
                ผสมตัวอักษรพิมพ์ใหญ่ พิมพ์เล็ก ตัวเลข และอักขระพิเศษ
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary-500 mt-0.5">•</span>
                หลีกเลี่ยงข้อมูลส่วนตัว เช่น ชื่อ วันเกิด เบอร์โทร
              </li>
              <li class="flex items-start gap-2">
                <span class="text-primary-500 mt-0.5">•</span>
                เปลี่ยนรหัสผ่านทุก 3-6 เดือน
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>
