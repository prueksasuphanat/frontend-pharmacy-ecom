<script setup lang="ts">
import Navbar from "@/components/layout/Navbar.vue";
import { Lock, Eye, EyeOff, CheckCircle } from "lucide-vue-next";
import { ref } from "vue";
import { BaseInput } from "@/components/ui";
const current = ref("");
const newPw = ref("");
const confirm = ref("");
const success = ref(false);
const showPw = ref(false);
async function onSubmit() {
  // TODO: PATCH /profile/password { current, new_password }
  await new Promise((r) => setTimeout(r, 600));
  success.value = true;
}
</script>
<template>
  <div>
    <Navbar />
    <div class="max-w-md mx-auto px-4 py-8">
      <h1 class="page-title mb-6">เปลี่ยนรหัสผ่าน</h1>
      <div class="card">
        <div v-if="success" class="text-center py-4">
          <div
            class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <CheckCircle class="w-8 h-8 text-green-600" />
          </div>
          <p class="font-semibold text-secondary-900">เปลี่ยนรหัสผ่านสำเร็จ</p>
        </div>
        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <BaseInput
            v-model="current"
            :type="showPw ? 'text' : 'password'"
            label="รหัสผ่านปัจจุบัน"
            :icon-right="showPw ? EyeOff : Eye"
            @icon-right-click="showPw = !showPw"
            required
          />

          <BaseInput
            v-model="newPw"
            :type="showPw ? 'text' : 'password'"
            label="รหัสผ่านใหม่"
            required
            minlength="8"
          />

          <BaseInput
            v-model="confirm"
            :type="showPw ? 'text' : 'password'"
            label="ยืนยันรหัสผ่านใหม่"
            :error="confirm && newPw !== confirm ? 'รหัสผ่านไม่ตรงกัน' : ''"
            required
          />

          <button
            type="submit"
            :disabled="newPw !== confirm"
            class="btn-primary w-full gap-2"
          >
            <Lock class="w-4 h-4" /> บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
