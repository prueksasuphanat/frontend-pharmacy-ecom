<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { Mail, Eye, EyeOff, Camera, X } from "lucide-vue-next";
import { useForm } from "vee-validate";
import { useToast } from "@/composables";
import type { RegisterData } from "@/types";
import "@/utils/validation";

import {
  VInput,
  VCheckbox,
  VFileUpload,
  VSelect,
  VDatePicker,
  VTextarea,
} from "@/components/ui";

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const showPw = ref(false);
const isLoading = ref(false);

// Profile image preview
const profileFile = ref<File | null>(null);
const profilePreview = ref<string | null>(null);
const profileInputRef = ref<HTMLInputElement | null>(null);

function onProfileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toast.error("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");
    return;
  }
  profileFile.value = file;
  profilePreview.value = URL.createObjectURL(file);
}

function removeProfile() {
  profileFile.value = null;
  if (profilePreview.value) URL.revokeObjectURL(profilePreview.value);
  profilePreview.value = null;
  if (profileInputRef.value) profileInputRef.value.value = "";
}

const prefixOptions = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
];

const { handleSubmit, values, errors } = useForm({
  validationSchema: {
    username: "required",
    title: "required",
    first_name: "required",
    last_name: "required",
    birthdate: "required",
    phone: "required",
    email: "required|email",
    password: "required|password",
    password_confirmation: "required|confirmed:@password",
    verificationDocument: (value: File[] | null) => {
      if (!value || value.length === 0) {
        return "กรุณาอัปโหลดเอกสารยืนยันตัวตน";
      }
      const maxSize = 5 * 1024 * 1024;
      for (const file of value) {
        if (file.size > maxSize) {
          return `ไฟล์ ${file.name} มีขนาดเกิน 5 MB ต่อไฟล์`;
        }
      }
      return true;
    },
    agreed: (value: boolean) => {
      if (!value) return "กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัว";
      return true;
    },
  },
});

const onSubmit = handleSubmit(
  async (formValues) => {
    isLoading.value = true;
    try {
      const registerData: RegisterData = {
        email: formValues.email,
        password: formValues.password,
        username: formValues.username,
        title: formValues.title,
        first_name: formValues.first_name,
        last_name: formValues.last_name,
        birthdata: formValues.birthdate,
        phone: formValues.phone,
        address: formValues.address,
        files: formValues.verificationDocument || null,
        profileImage: profileFile.value || null,
      };

      const success = await auth.register(registerData);

      if (success) {
        toast.success("สมัครสมาชิกสำเร็จ!");
        sessionStorage.setItem("fromRegister", "true");
        router.push("/register/complete");
      } else {
        toast.error(
          auth.error || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
        );
      }
    } catch (error: any) {
      toast.error(
        error.message || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
      );
    } finally {
      isLoading.value = false;
    }
  },
  (validationErrors) => {
    console.log("❌ Form validation failed!", validationErrors);
    console.log("Current values:", values);
    toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
  },
);
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <div
          class="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-200"
        >
          <span class="text-white font-bold text-xl">Rx</span>
        </div>
        <h1 class="text-2xl font-bold text-secondary-900">สมัครสมาชิก</h1>
        <p class="text-secondary-500 text-sm mt-1">เริ่มต้นใช้งาน Phanadrug</p>
      </div>

      <div class="card">
        <form @submit="onSubmit" novalidate class="space-y-4">
          <!-- Profile Image -->
          <div class="flex flex-col items-center gap-2 pb-2">
            <div class="relative group">
              <!-- Avatar circle -->
              <div
                class="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-secondary-300 bg-secondary-50 flex items-center justify-center transition-colors group-hover:border-primary-400"
                :class="{
                  'border-solid border-primary-400 bg-primary-50':
                    profilePreview,
                }"
              >
                <img
                  v-if="profilePreview"
                  :src="profilePreview"
                  alt="profile preview"
                  class="w-full h-full object-cover"
                />
                <Camera
                  v-else
                  class="w-8 h-8 text-secondary-300 group-hover:text-primary-400 transition-colors"
                />
              </div>

              <!-- Upload overlay button -->
              <label
                class="absolute inset-0 rounded-full cursor-pointer"
                title="เลือกรูปโปรไฟล์"
              >
                <input
                  ref="profileInputRef"
                  type="file"
                  accept="image/*"
                  class="sr-only"
                  @change="onProfileChange"
                />
              </label>

              <!-- Remove button -->
              <button
                v-if="profilePreview"
                type="button"
                class="absolute -top-1 -right-1 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors"
                @click="removeProfile"
              >
                <X class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="text-xs text-secondary-400">
              {{ profileFile ? profileFile.name : "รูปโปรไฟล์ (ไม่บังคับ)" }}
            </p>
          </div>

          <VInput
            name="email"
            type="email"
            label="อีเมล"
            placeholder="your@email.com"
            :icon="Mail"
            required
          />

          <VInput name="username" type="text" label="ชื่อผู้ใช้" required />

          <VInput
            name="password"
            :type="showPw ? 'text' : 'password'"
            label="รหัสผ่าน"
            placeholder="อย่างน้อย 8 ตัวอักษร และมีตัวเลข"
            :icon-right="showPw ? EyeOff : Eye"
            @icon-right-click="showPw = !showPw"
            required
          />

          <VInput
            name="password_confirmation"
            :type="showPw ? 'text' : 'password'"
            label="ยืนยันรหัสผ่าน"
            placeholder="กรอกรหัสผ่านอีกครั้ง"
            required
          />

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <VSelect
              name="title"
              label="คำนำหน้า"
              :options="prefixOptions"
              placeholder="เลือกคำนำหน้า"
              required
            />
            <VInput
              name="first_name"
              type="text"
              label="ชื่อจริง"
              placeholder="กรอกชื่อจริง"
              required
            />
            <VInput
              name="last_name"
              type="text"
              label="นามสกุล"
              placeholder="กรอกนามสกุล"
              required
            />
          </div>

          <VInput
            name="phone"
            type="tel"
            label="เบอร์โทรศัพท์"
            placeholder="0812345678"
            required
          />

          <VDatePicker
            name="birthdate"
            label="วันเกิด"
            placeholder="เลือกวันเกิด"
            :max="new Date().toISOString().split('T')[0]"
            required
          />

          <VTextarea
            name="address"
            label="ที่อยู่"
            placeholder="กรอกที่อยู่ของคุณ"
            :rows="3"
          />

          <VFileUpload
            name="verificationDocument"
            label="เอกสารยืนยันตัวตน"
            accept="image/*,.pdf"
            :max-size="5"
            :multiple="true"
            :max-files="3"
            required
          />

          <VCheckbox name="agreed">
            <span class="text-xs text-secondary-600"
              >ฉันยอมรับ<a href="#" class="text-primary-600">
                ข้อกำหนดการใช้งาน</a
              >และ<a href="#" class="text-primary-600"
                >นโยบายความเป็นส่วนตัว</a
              ></span
            >
          </VCheckbox>

          <button
            type="submit"
            :disabled="isLoading"
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
