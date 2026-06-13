<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useProvinceStore } from "@/stores/province.store";
import { BaseInput, BaseAutocomplete } from "@/components/ui";
import { Loader2 } from "lucide-vue-next";

interface AddressFormValue {
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

interface AddressFormErrors {
  address?: string;
  province?: string;
  district?: string;
  subDistrict?: string;
}

const props = defineProps<{
  modelValue: AddressFormValue;
  errors?: AddressFormErrors;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AddressFormValue];
}>();

const provinceStore = useProvinceStore();

onMounted(async () => {
  await provinceStore.load();

  syncFromModelValue();
});

const selectedProvinceId = ref<number | null>(null);
const selectedDistrictId = ref<number | null>(null);
const selectedSubDistrictId = ref<number | null>(null);

const districtOptions = computed(() =>
  selectedProvinceId.value
    ? provinceStore.getDistrictOptions(selectedProvinceId.value)
    : [],
);

const subDistrictOptions = computed(() =>
  selectedDistrictId.value
    ? provinceStore.getSubDistrictOptions(selectedDistrictId.value)
    : [],
);

function syncFromModelValue() {
  if (!provinceStore.isLoaded) return;

  if (props.modelValue.province) {
    const prov = provinceStore.provinces.find(
      (p) => p.nameTh === props.modelValue.province,
    );
    if (prov) {
      selectedProvinceId.value = prov.id;

      if (props.modelValue.district) {
        const dist = provinceStore.districts.find(
          (d) =>
            d.provinceId === prov.id && d.nameTh === props.modelValue.district,
        );
        if (dist) {
          selectedDistrictId.value = dist.id;

          if (props.modelValue.subDistrict) {
            const sub = provinceStore.subDistricts.find(
              (s) =>
                s.districtId === dist.id &&
                s.nameTh === props.modelValue.subDistrict,
            );
            if (sub) selectedSubDistrictId.value = sub.id;
          }
        }
      }
    }
  }
}

watch(
  () => provinceStore.isLoaded,
  (loaded) => {
    if (loaded) syncFromModelValue();
  },
);

function onProvinceChange(provinceId: number | string | null) {
  if (!provinceId) return;
  const id = Number(provinceId);
  selectedProvinceId.value = id;
  selectedDistrictId.value = null;
  selectedSubDistrictId.value = null;

  const name = provinceStore.getProvinceName(id);
  emit("update:modelValue", {
    ...props.modelValue,
    province: name,
    district: "",
    subDistrict: "",
    postalCode: "",
  });
}

function onDistrictChange(districtId: number | string | null) {
  if (!districtId) return;
  const id = Number(districtId);
  selectedDistrictId.value = id;
  selectedSubDistrictId.value = null;

  const name = provinceStore.getDistrictName(id);
  emit("update:modelValue", {
    ...props.modelValue,
    district: name,
    subDistrict: "",
    postalCode: "",
  });
}

function onSubDistrictChange(subDistrictId: number | string | null) {
  if (!subDistrictId) return;
  const id = Number(subDistrictId);
  selectedSubDistrictId.value = id;

  const name = provinceStore.getSubDistrictName(id);
  const zip = provinceStore.getZipCode(id);
  emit("update:modelValue", {
    ...props.modelValue,
    subDistrict: name,
    postalCode: zip ? String(zip) : "",
  });
}

const localAddress = computed({
  get: () => props.modelValue.address,
  set: (val: string) =>
    emit("update:modelValue", { ...props.modelValue, address: val }),
});

const localPostalCode = computed({
  get: () => props.modelValue.postalCode,
  set: (val: string) =>
    emit("update:modelValue", {
      ...props.modelValue,
      postalCode: String(val ?? "").replace(/\D/g, "").slice(0, 5),
    }),
});
</script>

<template>
  <div class="space-y-3">
    <div
      v-if="provinceStore.isLoading"
      class="flex items-center gap-2 text-secondary-400 text-sm py-2"
    >
      <Loader2 class="w-4 h-4 animate-spin" />
      <span>กำลังโหลดข้อมูลที่อยู่...</span>
    </div>

    <template v-else>
      <BaseInput
        v-model="localAddress"
        label="ที่อยู่"
        placeholder="บ้านเลขที่ ซอย ถนน"
        required
        :error="errors?.address"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <BaseAutocomplete
          v-model="selectedProvinceId"
          :options="provinceStore.provinceOptions"
          label="จังหวัด"
          placeholder="เลือกจังหวัด"
          required
          :error="errors?.province"
          @update:model-value="onProvinceChange"
        />

        <BaseAutocomplete
          v-model="selectedDistrictId"
          :options="districtOptions"
          label="อำเภอ/เขต"
          placeholder="เลือกอำเภอ/เขต"
          required
          :disabled="!selectedProvinceId"
          :error="errors?.district"
          @update:model-value="onDistrictChange"
        />

        <BaseAutocomplete
          v-model="selectedSubDistrictId"
          :options="subDistrictOptions"
          label="ตำบล/แขวง"
          placeholder="เลือกตำบล/แขวง"
          required
          :disabled="!selectedDistrictId"
          :error="errors?.subDistrict"
          @update:model-value="onSubDistrictChange"
        />

        <BaseInput
          v-model="localPostalCode"
          label="รหัสไปรษณีย์"
          placeholder="รหัสไปรษณีย์"
          required
        />
      </div>
    </template>
  </div>
</template>
