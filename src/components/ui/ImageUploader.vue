<script setup lang="ts">
import { ref, computed } from "vue";
import { Camera, Trash2, Upload } from "lucide-vue-next";

interface Props {
  modelValue?: File | null;
  currentImageUrl?: string | null;
  disabled?: boolean;
  maxSizeMb?: number;
}

const props = withDefaults(defineProps<Props>(), {
  maxSizeMb: 5,
});

const emit = defineEmits<{
  "update:modelValue": [value: File | null];
  remove: [];
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const error = ref("");
const previewUrl = ref<string | null>(null);

const displayUrl = computed(
  () => previewUrl.value ?? props.currentImageUrl ?? null,
);
const hasImage = computed(() => !!displayUrl.value);

function openDialog() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function processFile(file: File) {
  error.value = "";
  if (!file.type.startsWith("image/")) {
    error.value = "รองรับเฉพาะไฟล์รูปภาพ (PNG, JPG, WEBP)";
    return;
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    error.value = `ขนาดไฟล์ต้องไม่เกิน ${props.maxSizeMb} MB`;
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target?.result as string;
  };
  reader.readAsDataURL(file);
  emit("update:modelValue", file);
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (file) processFile(file);
  if (inputRef.value) inputRef.value.value = "";
}

function onDrop(e: DragEvent) {
  isDragging.value = false;
  const file = e.dataTransfer?.files?.[0];
  if (file) processFile(file);
}

function removeImage() {
  previewUrl.value = null;
  error.value = "";
  emit("update:modelValue", null);
  emit("remove");
}
</script>

<template>
  <div class="flex flex-col gap-1">
    <!-- กล่องรูป — aspect-square จาก class ที่ส่งมา -->
    <div
      class="relative w-full overflow-hidden rounded-xl border-2 transition-all select-none"
      :class="[
        isDragging
          ? 'border-primary-500 bg-primary-50 scale-[1.02]'
          : hasImage
            ? 'border-secondary-200'
            : 'border-dashed border-secondary-300 hover:border-primary-400 hover:bg-secondary-50 cursor-pointer',
        disabled ? 'opacity-50 pointer-events-none' : '',
      ]"
      @click="!hasImage ? openDialog() : undefined"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <!-- ต้องมี padding-top เพื่อทำ aspect-ratio 1:1 -->
      <div class="pt-[100%]" />

      <!-- content วางทับด้วย absolute -->
      <div class="absolute inset-0">
        <!-- มีรูป -->
        <template v-if="hasImage">
          <img
            :src="displayUrl!"
            alt="รูปสินค้า"
            class="w-full h-full object-cover"
          />
          <div
            class="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center gap-3 opacity-0 hover:opacity-100"
          >
            <button
              type="button"
              @click.stop="openDialog"
              class="p-2 bg-white/90 hover:bg-white rounded-full text-secondary-700 hover:text-primary-600 transition-colors shadow"
              title="เปลี่ยนรูป"
            >
              <Camera class="w-4 h-4" />
            </button>
            <button
              type="button"
              @click.stop="removeImage"
              class="p-2 bg-white/90 hover:bg-white rounded-full text-secondary-700 hover:text-red-600 transition-colors shadow"
              title="ลบรูป"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </template>

        <!-- ไม่มีรูป: placeholder -->
        <template v-else>
          <div
            class="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center"
          >
            <div
              :class="[
                'w-12 h-12 rounded-full flex items-center justify-center transition-colors',
                isDragging ? 'bg-primary-100' : 'bg-secondary-100',
              ]"
            >
              <Upload
                :class="[
                  'w-5 h-5',
                  isDragging ? 'text-primary-600' : 'text-secondary-400',
                ]"
              />
            </div>
            <div>
              <p class="text-sm font-medium text-secondary-600">
                คลิกหรือลากรูปมาวาง
              </p>
              <p class="text-xs text-secondary-400 mt-0.5">
                PNG, JPG, WEBP ≤ {{ maxSizeMb }} MB
              </p>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Error -->
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

    <!-- Hidden input -->
    <input
      ref="inputRef"
      type="file"
      accept="image/*"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
