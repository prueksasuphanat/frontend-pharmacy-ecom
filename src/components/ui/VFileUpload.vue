<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseFileUpload from "./BaseFileUpload.vue";

interface Props {
  name: string;
  label?: string;
  accept?: string;
  maxSize?: number; // in MB
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  maxFiles?: number; // undefined = unlimited
  modelValue?: File | File[] | null;
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

// ใช้ VeeValidate's useField
const {
  value: inputValue,
  errorMessage,
  handleChange,
  meta,
} = useField<File | File[] | null>(toRef(props, "name"), undefined, {
  initialValue: props.multiple ? [] : null,
  syncVModel: true,
});

// แสดง error เมื่อ field ถูก touched และมี error
const displayError = computed(() => {
  return meta.touched && errorMessage.value ? errorMessage.value : "";
});

function onUpdate(value: File | File[] | null) {
  handleChange(value);
  emit("update:modelValue", value);
}
</script>

<template>
  <BaseFileUpload
    :model-value="inputValue"
    :label="label"
    :accept="accept"
    :max-size="maxSize"
    :required="required"
    :disabled="disabled"
    :multiple="multiple"
    :max-files="maxFiles"
    :error="displayError"
    @update:model-value="onUpdate"
  />
</template>
