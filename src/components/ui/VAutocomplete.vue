<script setup lang="ts">
import { computed, toRef } from "vue";
import { useField } from "vee-validate";
import BaseAutocomplete, {
  type AutocompleteOption,
} from "./BaseAutocomplete.vue";

interface Props {
  name: string;
  options: AutocompleteOption[];
  label?: string;
  placeholder?: string;
  icon?: any;
  disabled?: boolean;
  clearable?: boolean;
  noResultText?: string;
  modelValue?: string | number | null;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  clearable: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: string | number | null];
  change: [value: string | number | null];
  search: [query: string];
}>();

const {
  value: fieldValue,
  errorMessage,
  handleChange,
  meta,
} = useField(toRef(props, "name"), undefined, {
  initialValue: props.modelValue,
  syncVModel: true,
});

const displayError = computed(() =>
  meta.touched && errorMessage.value ? errorMessage.value : "",
);

function onUpdate(value: string | number | null) {
  handleChange(value);
  emit("update:modelValue", value);
  emit("change", value);
}
</script>

<template>
  <BaseAutocomplete
    :model-value="fieldValue"
    :options="options"
    :label="label"
    :placeholder="placeholder"
    :icon="icon"
    :disabled="disabled"
    :clearable="clearable"
    :no-result-text="noResultText"
    :error="displayError"
    @update:model-value="onUpdate"
    @change="onUpdate"
    @search="emit('search', $event)"
  />
</template>
