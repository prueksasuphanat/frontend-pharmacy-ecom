<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseSelect from "./BaseSelect.vue";

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface Props {
  name: string;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  icon?: any;
  disabled?: boolean;
  modelValue?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number];
  change: [value: string | number];
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

function onUpdate(value: string | number) {
  handleChange(value);
  emit("update:modelValue", value);
  emit("change", value);
}
</script>

<template>
  <BaseSelect
    :model-value="inputValue"
    :options="options"
    :label="label"
    :placeholder="placeholder"
    :icon="icon"
    :disabled="disabled"
    :error="displayError"
    @update:model-value="onUpdate"
    @change="onUpdate"
  />
</template>
