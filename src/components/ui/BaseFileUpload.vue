<script setup lang="ts">
import { ref, computed } from "vue";
import { Upload, X, FileText } from "lucide-vue-next";

interface Props {
  modelValue?: File | File[] | null;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number; // undefined = unlimited
  error?: string;
}

const props = withDefaults(defineProps<Props>(), {
  accept: "image/*,.pdf",
  maxSize: 5, // 5MB default
  multiple: false,
  maxFiles: undefined,
});

const emit = defineEmits<{
  "update:modelValue": [value: File | File[] | null];
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragging = ref(false);
const filePreviews = ref<Map<string, string>>(new Map());

const files = computed(() => {
  if (!props.modelValue) return [];
  return Array.isArray(props.modelValue)
    ? props.modelValue
    : [props.modelValue];
});

const formatFileSize = (bytes: number) => {
  const size = bytes / 1024 / 1024; // Convert to MB
  return size < 1 ? `${(size * 1024).toFixed(0)} KB` : `${size.toFixed(2)} MB`;
};

const isImage = (file: File) => {
  return file.type.startsWith("image/");
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const selectedFiles = Array.from(target.files || []);
  processFiles(selectedFiles);
};

const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const droppedFiles = Array.from(event.dataTransfer?.files || []);
  processFiles(droppedFiles);
};

const processFiles = (newFiles: File[]) => {
  if (!newFiles.length) return;

  // Filter valid files
  const validFiles = newFiles.filter((file) => {
    const fileSizeMB = file.size / 1024 / 1024;
    return fileSizeMB <= props.maxSize;
  });

  if (!validFiles.length) return;

  if (props.multiple) {
    const currentFiles = Array.isArray(props.modelValue)
      ? props.modelValue
      : [];
    const combinedFiles = [...currentFiles, ...validFiles];

    // Limit number of files if maxFiles is set
    const limitedFiles = props.maxFiles
      ? combinedFiles.slice(0, props.maxFiles)
      : combinedFiles;
    emit("update:modelValue", limitedFiles);

    // Create previews for new images
    validFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          filePreviews.value.set(file.name, e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    });
  } else {
    const file = validFiles[0];
    emit("update:modelValue", file);

    // Create preview for image
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        filePreviews.value.clear();
        filePreviews.value.set(file.name, e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      filePreviews.value.clear();
    }
  }

  // Reset input
  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const removeFile = (index: number) => {
  if (props.multiple && Array.isArray(props.modelValue)) {
    const file = props.modelValue[index];
    filePreviews.value.delete(file.name);

    const newFiles = props.modelValue.filter((_, i) => i !== index);
    emit("update:modelValue", newFiles.length > 0 ? newFiles : []);
  } else {
    emit("update:modelValue", null);
    filePreviews.value.clear();
  }

  if (fileInputRef.value) {
    fileInputRef.value.value = "";
  }
};

const openFileDialog = () => {
  fileInputRef.value?.click();
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragLeave = () => {
  isDragging.value = false;
};

const canAddMore = computed(() => {
  if (!props.multiple) return files.value.length === 0;
  // If maxFiles is not set, always allow adding more
  if (!props.maxFiles) return true;
  return files.value.length < props.maxFiles;
});
</script>

<template>
  <div class="space-y-2">
    <label v-if="label" class="block text-sm font-medium text-secondary-700">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
      <span
        v-if="multiple && maxFiles"
        class="text-xs text-secondary-500 font-normal ml-2"
      >
        (สูงสุด {{ maxFiles }} ไฟล์)
      </span>
    </label>

    <!-- Upload Area (only show when no files) -->
    <div
      v-if="files.length === 0"
      @click="openFileDialog"
      @drop.prevent="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      :class="[
        'border-[1px] border-dashed rounded-lg p-6 text-center cursor-pointer transition-all',
        isDragging
          ? 'border-primary-500 bg-primary-50'
          : 'border-secondary-300 hover:border-primary-400 hover:bg-secondary-50',
        error ? 'border-red-300 bg-red-50' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
    >
      <Upload
        :class="[
          'w-10 h-10 mx-auto mb-3',
          isDragging ? 'text-primary-600' : 'text-secondary-400',
        ]"
      />
      <p class="text-sm text-secondary-600 mb-1">
        <span class="text-primary-600 font-medium">คลิกเพื่ออัปโหลด</span>
        หรือลากไฟล์มาวาง
      </p>
      <p class="text-xs text-secondary-500">
        รองรับไฟล์ {{ accept }} (สูงสุด {{ maxSize }} MB{{
          multiple ? " ต่อไฟล์" : ""
        }})
      </p>
    </div>

    <!-- File Previews -->
    <div v-if="files.length > 0" class="space-y-2">
      <div
        v-for="(file, index) in files"
        :key="`${file.name}-${index}`"
        class="border-[1px] border-secondary-200 rounded-lg p-3 bg-secondary-50"
      >
        <div class="flex items-start gap-3">
          <!-- Preview Thumbnail -->
          <div
            class="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-white border border-secondary-200 flex items-center justify-center"
          >
            <img
              v-if="isImage(file) && filePreviews.get(file.name)"
              :src="filePreviews.get(file.name)"
              :alt="file.name"
              class="w-full h-full object-cover"
            />
            <FileText v-else class="w-6 h-6 text-secondary-400" />
          </div>

          <!-- File Info -->
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-secondary-900 truncate">
              {{ file.name }}
            </p>
            <p class="text-xs text-secondary-500">
              {{ formatFileSize(file.size) }}
            </p>
          </div>

          <!-- Remove Button -->
          <button
            type="button"
            @click="removeFile(index)"
            :disabled="disabled"
            class="flex-shrink-0 p-1 text-secondary-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
            title="ลบไฟล์"
          >
            <X class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Add More Button (for multiple mode) -->
      <button
        v-if="multiple && canAddMore"
        type="button"
        @click="openFileDialog"
        :disabled="disabled"
        class="w-full py-2 px-4 border-[1px] border-dashed border-secondary-300 rounded-lg text-sm text-secondary-600 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all"
      >
        <span v-if="maxFiles"
          >+ เพิ่มไฟล์ ({{ files.length }}/{{ maxFiles }})</span
        >
        <span v-else>+ เพิ่มไฟล์ ({{ files.length }})</span>
      </button>
    </div>

    <!-- Hidden File Input -->
    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      :multiple="multiple"
      @change="handleFileSelect"
      :disabled="disabled"
      class="hidden"
    />

    <!-- Error Message -->
    <p v-if="error" class="text-xs text-red-600 mt-1.5">
      {{ error }}
    </p>
  </div>
</template>
