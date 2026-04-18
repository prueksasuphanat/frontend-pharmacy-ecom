<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseDatePicker from "./BaseDatePicker.vue";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  modelValue?: string;
  min?: string;
  max?: string;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: "เลือกวันที่",
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

// ใช้ VeeValidate's useField
const {
  value: inputValue,
  errorMessage,
  handleChange,
  meta,
} = useField(toRef(props, "name"), undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

// แสดง error เมื่อ field ถูก touched และมี error
const displayError = computed(() => {
  return meta.touched && errorMessage.value ? errorMessage.value : "";
});

function onUpdate(value: string) {
  handleChange(value);
  emit("update:modelValue", value);
}
</script>

<template>
  <BaseDatePicker
    :model-value="inputValue"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :min="min"
    :max="max"
    :error="displayError"
    @update:model-value="onUpdate"
  />
</template>
