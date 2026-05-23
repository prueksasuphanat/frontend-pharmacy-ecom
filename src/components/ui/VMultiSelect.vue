<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseMultiSelect, { type MultiSelectOption } from "./BaseMultiSelect.vue";

interface Props {
  name: string;
  options: MultiSelectOption[];
  label?: string;
  placeholder?: string;
  icon?: any;
  disabled?: boolean;
  max?: number;
  noResultText?: string;
  modelValue?: (string | number)[];
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  modelValue: () => [],
});

const emit = defineEmits<{
  "update:modelValue": [value: (string | number)[]];
  change: [value: (string | number)[]];
  search: [query: string];
}>();

const {
  value: fieldValue,
  errorMessage,
  handleChange,
  meta,
} = useField<(string | number)[]>(toRef(props, "name"), undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const displayError = computed(() =>
  meta.touched && errorMessage.value ? errorMessage.value : "",
);

function onUpdate(value: (string | number)[]) {
  handleChange(value);
  emit("update:modelValue", value);
  emit("change", value);
}
</script>

<template>
  <BaseMultiSelect
    :model-value="fieldValue"
    :options="options"
    :label="label"
    :placeholder="placeholder"
    :icon="icon"
    :disabled="disabled"
    :max="max"
    :no-result-text="noResultText"
    :error="displayError"
    @update:model-value="onUpdate"
    @change="onUpdate"
    @search="emit('search', $event)"
  />
</template>
