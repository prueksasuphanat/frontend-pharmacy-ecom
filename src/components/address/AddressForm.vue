<script setup lang="ts">
/**
 * AddressForm — Reusable cascade address form
 * จังหวัด → อำเภอ → ตำบล → รหัสไปรษณีย์ (auto-fill)
 *
 * ใช้ province.store ที่ lazy-load JSON ครบ 77 จังหวัด
 * emit ค่าออกเป็น string ชื่อ ตรงกับ backend schema
 */
import { ref, computed, watch, onMounted } from "vue";
import { useProvinceStore } from "@/stores/province.store";
import { BaseInput, BaseAutocomplete } from "@/components/ui";
import { Loader2 } from "lucide-vue-next";

// ==========================================
// Props & Emits
// ==========================================
interface AddressFormValue {
  address: string; // บ้านเลขที่ ซอย ถนน
  subDistrict: string; // ตำบล/แขวง (ชื่อ) — UI only ไม่ส่ง backend
  district: string; // อำเภอ/เขต (ชื่อ)
  province: string; // จังหวัด (ชื่อ)
  postalCode: string; // รหัสไปรษณีย์
}

const props = defineProps<{
  modelValue: AddressFormValue;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: AddressFormValue];
}>();

// ==========================================
// Store
// ==========================================
const provinceStore = useProvinceStore();

onMounted(async () => {
  // idempotent — เรียกซ้ำได้ปลอดภัย โหลดแค่ครั้งเดียว
  await provinceStore.load();
  // sync กลับถ้ามีค่าเริ่มต้น (edit mode)
  syncFromModelValue();
});

// ==========================================
// Internal state — เก็บ id ที่เลือก (สำหรับ cascade filter)
// ==========================================
const selectedProvinceId = ref<number | null>(null);
const selectedDistrictId = ref<number | null>(null);
const selectedSubDistrictId = ref<number | null>(null);

// ==========================================
// Computed options
// ==========================================
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

// ==========================================
// Sync กลับจาก modelValue → id (สำหรับ edit mode)
// ==========================================
function syncFromModelValue() {
  if (!provinceStore.isLoaded) return;

  // หา province id จากชื่อ
  if (props.modelValue.province) {
    const prov = provinceStore.provinces.find(
      (p) => p.nameTh === props.modelValue.province,
    );
    if (prov) {
      selectedProvinceId.value = prov.id;

      // หา district id จากชื่อ
      if (props.modelValue.district) {
        const dist = provinceStore.districts.find(
          (d) =>
            d.provinceId === prov.id && d.nameTh === props.modelValue.district,
        );
        if (dist) {
          selectedDistrictId.value = dist.id;

          // หา subDistrict id จากชื่อ
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

// sync เมื่อ store โหลดเสร็จ (กรณี component mount ก่อน store load)
watch(
  () => provinceStore.isLoaded,
  (loaded) => {
    if (loaded) syncFromModelValue();
  },
);

// ==========================================
// Cascade handlers
// ==========================================
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

// ==========================================
// Local address field (บ้านเลขที่ ซอย ถนน)
// ==========================================
const localAddress = computed({
  get: () => props.modelValue.address,
  set: (val: string) =>
    emit("update:modelValue", { ...props.modelValue, address: val }),
});

// postalCode แก้ได้เองด้วย (override auto-fill)
const localPostalCode = computed({
  get: () => props.modelValue.postalCode,
  set: (val: string) =>
    emit("update:modelValue", { ...props.modelValue, postalCode: val }),
});
</script>

<template>
  <div class="space-y-3">
    <!-- Loading state -->
    <div
      v-if="provinceStore.isLoading"
      class="flex items-center gap-2 text-secondary-400 text-sm py-2"
    >
      <Loader2 class="w-4 h-4 animate-spin" />
      <span>กำลังโหลดข้อมูลที่อยู่...</span>
    </div>

    <template v-else>
      <!-- บ้านเลขที่ ซอย ถนน -->
      <BaseInput
        v-model="localAddress"
        label="ที่อยู่ *"
        placeholder="บ้านเลขที่ ซอย ถนน"
      />

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <!-- จังหวัด -->
        <BaseAutocomplete
          v-model="selectedProvinceId"
          :options="provinceStore.provinceOptions"
          label="จังหวัด *"
          placeholder="เลือกจังหวัด"
          @update:model-value="onProvinceChange"
        />

        <!-- อำเภอ/เขต -->
        <BaseAutocomplete
          v-model="selectedDistrictId"
          :options="districtOptions"
          label="อำเภอ/เขต *"
          placeholder="เลือกอำเภอ/เขต"
          :disabled="!selectedProvinceId"
          @update:model-value="onDistrictChange"
        />

        <!-- ตำบล/แขวง -->
        <BaseAutocomplete
          v-model="selectedSubDistrictId"
          :options="subDistrictOptions"
          label="ตำบล/แขวง *"
          placeholder="เลือกตำบล/แขวง"
          :disabled="!selectedDistrictId"
          @update:model-value="onSubDistrictChange"
        />

        <!-- รหัสไปรษณีย์ — auto-fill จากตำบล แต่แก้ได้เอง -->
        <BaseInput
          v-model="localPostalCode"
          label="รหัสไปรษณีย์ *"
          placeholder="auto-fill เมื่อเลือกตำบล"
        />
      </div>
    </template>
  </div>
</template>
