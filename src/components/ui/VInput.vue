<script setup lang="ts">
import { useField } from "vee-validate";
import { computed, toRef } from "vue";
import BaseInput from "./BaseInput.vue";

interface Props {
  name: string;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  placeholder?: string;
  icon?: any;
  iconRight?: any;
  disabled?: boolean;
  readonly?: boolean;
  modelValue?: string | number | null;
  /** อนุญาตให้กรอกค่าติดลบได้ (ใช้เฉพาะ type="number") */
  allowNegative?: boolean;
  /** อนุญาตเฉพาะตัวอักษรภาษาอังกฤษและตัวเลขเท่านั้น (บล็อกภาษาไทย, ช่องว่าง, อักขระพิเศษ) */
  alphanumericOnly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
  allowNegative: false,
  alphanumericOnly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  iconRightClick: [];
}>();

const {
  value: inputValue,
  errorMessage,
  handleBlur,
  handleChange,
  meta,
} = useField(toRef(props, "name"), undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const displayError = computed(() => {
  return meta.touched && errorMessage.value ? errorMessage.value : "";
});

function onInput(value: string | number | null) {
  handleChange(value);
  emit("update:modelValue", value);
}

function onIconRightClick() {
  emit("iconRightClick");
}
</script>

<template>
  <BaseInput
    :model-value="inputValue"
    :type="type"
    :label="label"
    :placeholder="placeholder"
    :icon="icon"
    :icon-right="iconRight"
    :disabled="disabled"
    :readonly="readonly"
    :error="displayError"
    :allow-negative="allowNegative"
    :alphanumeric-only="alphanumericOnly"
    @update:model-value="onInput"
    @blur="handleBlur"
    @icon-right-click="onIconRightClick"
  />
</template>
