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
  modelValue?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  type: "text",
  disabled: false,
  readonly: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  iconRightClick: [];
}>();

// ใช้ VeeValidate's useField
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

// แสดง error เมื่อ field ถูก touched และมี error
const displayError = computed(() => {
  return meta.touched && errorMessage.value ? errorMessage.value : "";
});

function onInput(value: string | number) {
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
    @update:model-value="onInput"
    @blur="handleBlur"
    @icon-right-click="onIconRightClick"
  />
</template>
