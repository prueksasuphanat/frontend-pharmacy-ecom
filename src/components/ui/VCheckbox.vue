<script setup lang="ts">
import { useField } from "vee-validate";
import { computed, toRef } from "vue";
import BaseCheckbox from "./BaseCheckbox.vue";

interface Props {
  name: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  modelValue?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

// ใช้ VeeValidate's useField
const {
  value: checkboxValue,
  errorMessage,
  handleChange,
  meta,
} = useField<boolean>(toRef(props, "name"), undefined, {
  initialValue: props.modelValue,
  type: "checkbox",
  syncVModel: true,
});

// แสดง error เมื่อ field ถูก touched และมี error
const displayError = computed(() => {
  return meta.touched && errorMessage.value ? errorMessage.value : "";
});

function onChange(value: boolean) {
  handleChange(value);
  emit("update:modelValue", value);
}
</script>

<template>
  <BaseCheckbox
    :model-value="checkboxValue"
    :label="label"
    :description="description"
    :disabled="disabled"
    :error="displayError"
    @update:model-value="onChange"
  >
    <slot />
  </BaseCheckbox>
</template>
