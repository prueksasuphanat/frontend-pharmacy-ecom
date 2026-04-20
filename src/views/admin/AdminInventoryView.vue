<script setup lang="ts">
import { ref, computed } from "vue";
import { MOCK_PRODUCTS } from "@/__mocks__/products";
import { MOCK_LOTS } from "@/__mocks__/inventory";
import { Search, Plus, AlertTriangle, Edit, Eye } from "lucide-vue-next";
import { BaseInput, BaseSelect } from "@/components/ui";
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">สินค้า</h1>

      <button class="btn-primary text-sm gap-1.5">
        <Plus class="w-4 h-4" /> เพิ่มสินค้าใหม่
      </button>
    </div>
  </div>
</template>
