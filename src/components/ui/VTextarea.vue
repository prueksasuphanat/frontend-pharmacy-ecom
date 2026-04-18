<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseTextarea from "./BaseTextarea.vue";

interface Props {
  name: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  rows?: number;
  maxlength?: number;
  modelValue?: string;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  readonly: false,
  rows: 4,
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

function onInput(value: string) {
  handleChange(value);
  emit("update:modelValue", value);
}
</script>

<template>
  <BaseTextarea
    :model-value="inputValue"
    :label="label"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :rows="rows"
    :maxlength="maxlength"
    :error="displayError"
    @update:model-value="onInput"
  />
</template>
