<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import { Mail, Eye, EyeOff } from "lucide-vue-next";
import { VInput, VCheckbox } from "@/components/ui";
import { useForm } from "vee-validate";
import { useToast } from "@/composables";
import "@/utils/validation"; // import validation rules

const auth = useAuthStore();
const router = useRouter();
const toast = useToast();

const showPw = ref(false);
const isLoading = ref(false);
const registered = ref(false);

// กำหนด validation schema
const { handleSubmit, values } = useForm({
  validationSchema: {
    email: "required|email",
    password: "required|password",
    password_confirmation: "required|confirmed:@password",
    agreed: (value: boolean) => {
      if (!value) {
        return "กรุณายอมรับข้อกำหนดและเงื่อนไข";
      }
      return true;
    },
  },
});

// Handle form submission
const onSubmit = handleSubmit(async (values) => {
  isLoading.value = true;

  try {
    // TODO: replace with POST /auth/register
    await auth.register(values.email, values.password);

    // แสดง toast success
    toast.success("สมัครสมาชิกสำเร็จ!");

    registered.value = true;

    // Redirect หลัง 2 วินาที
    setTimeout(() => {
      router.push("/products");
    }, 2000);
  } catch (error: any) {
    // แสดง toast error
    toast.error(
      error.message || "ไม่สามารถสมัครสมาชิกได้ กรุณาลองใหม่อีกครั้ง",
    );
  } finally {
    isLoading.value = false;
  }
});
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
          เริ่มต้นใช้งานPhanadrugฟรี
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
          <strong>{{ values.email }}</strong> กรุณายืนยันก่อนเข้าใช้งาน
        </p>
        <!-- TODO: actually send email verify token -->
        <RouterLink to="/products" class="btn-primary w-full"
          >ไปดูสินค้าก่อน</RouterLink
        >
      </div>

      <div v-else class="card">
        <form @submit="onSubmit" novalidate class="space-y-4">
          <VInput
            name="email"
            type="email"
            label="อีเมล"
            placeholder="your@email.com"
            :icon="Mail"
            required
          />

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
