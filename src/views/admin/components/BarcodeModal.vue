<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import JsBarcode from "jsbarcode";
import type { AdminOrderItem } from "@/types";
import { BaseModal } from "@/components/ui";

const props = defineProps<{
  items: AdminOrderItem[];
  open: boolean;
}>();
defineEmits<{ close: [] }>();

const svgRefs = ref<SVGElement[]>([]);

function renderAll() {
  nextTick(() => {
    props.items.forEach((item, i) => {
      const el = svgRefs.value[i];
      if (!el || !item.product_code) return;
      JsBarcode(el, item.product_code, {
        format: "CODE128",
        displayValue: true,
        fontSize: 12,
        margin: 10,
        width: 2,
        height: 60,
      });
    });
  });
}

watch(() => props.open, (val) => {
  if (val) renderAll();
});
</script>

<template>
  <BaseModal
    v-if="open"
    title="บาร์โค้ดสินค้าในคำสั่งซื้อ"
    size="md"
    @close="$emit('close')"
  >
    <div class="divide-y divide-secondary-100">
      <div
        v-for="(item, i) in items"
        :key="item.id"
        class="py-4 first:pt-0 last:pb-0 space-y-2"
      >
        <div>
          <p class="text-sm font-medium text-secondary-900">{{ item.product_name }}</p>
          <p class="text-xs text-secondary-400">รหัส: {{ item.product_code || "-" }}</p>
        </div>
        <template v-if="item.product_code">
          <svg
            :ref="(el) => { if (el) svgRefs[i] = el as SVGElement }"
            class="w-full"
          />
        </template>
        <p v-else class="text-xs text-secondary-400 italic">ยังไม่มีรหัสสินค้า</p>
      </div>
    </div>
  </BaseModal>
</template>
