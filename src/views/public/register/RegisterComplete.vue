<script setup lang="ts">
import { RouterLink } from "vue-router";
import { CheckCircle } from "lucide-vue-next";
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center p-4"
  >
    <div class="card max-w-md w-full text-center">
      <div
        class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
      >
        <CheckCircle class="w-10 h-10 text-green-600" />
      </div>
      <h1 class="text-2xl font-bold text-secondary-900 mb-2">
        สมัครสมาชิกสำเร็จ
      </h1>
      <p class="text-secondary-500 text-sm mb-6">
        ขณะนี้บัญชีของคุณอยู่ระหว่างการตรวจสอบ<br />
        คุณจะสามารถเข้าสู่ระบบได้เมื่อแอดมินอนุมัติแล้ว หากมีข้อสงสัย
        กรุณาติดต่อ
        <a href="mailto:admin@phanadrug.com" class="text-primary-600 underline"
          >admin@phanadrug.com</a
        >
      </p>

      <RouterLink to="/login" class="btn-primary w-full">
        เข้าสู่ระบบ
      </RouterLink>
    </div>
  </div>
</template>
