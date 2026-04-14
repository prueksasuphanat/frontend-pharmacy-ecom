<script setup lang="ts">
import Navbar from '@/components/layout/Navbar.vue'
import { Lock } from 'lucide-vue-next'
import { ref } from 'vue'
const current = ref(''); const newPw = ref(''); const confirm = ref('')
const success = ref(false)
async function onSubmit() {
  // TODO: PATCH /profile/password { current, new_password }
  await new Promise(r => setTimeout(r, 600)); success.value = true
}
</script>
<template>
  <div>
    <Navbar />
    <div class="max-w-md mx-auto px-4 py-8">
      <h1 class="page-title mb-6">เปลี่ยนรหัสผ่าน</h1>
      <div class="card">
        <div v-if="success" class="text-center py-4">
          <div class="text-4xl mb-2">✅</div>
          <p class="font-semibold text-secondary-900">เปลี่ยนรหัสผ่านสำเร็จ</p>
        </div>
        <form v-else @submit.prevent="onSubmit" class="space-y-4">
          <div>
            <label class="label">รหัสผ่านปัจจุบัน</label>
            <input v-model="current" type="password" class="input" required />
          </div>
          <div>
            <label class="label">รหัสผ่านใหม่</label>
            <input v-model="newPw" type="password" class="input" required minlength="8" />
          </div>
          <div>
            <label class="label">ยืนยันรหัสผ่านใหม่</label>
            <input v-model="confirm" type="password" class="input" required :class="{ 'input-error': confirm && newPw !== confirm }" />
            <p v-if="confirm && newPw !== confirm" class="error-msg">รหัสผ่านไม่ตรงกัน</p>
          </div>
          <button type="submit" :disabled="newPw !== confirm" class="btn-primary w-full gap-2">
            <Lock class="w-4 h-4" /> บันทึกรหัสผ่านใหม่
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
