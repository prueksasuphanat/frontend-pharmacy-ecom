<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { BaseInput, BaseModal } from "@/components/ui";
import {
  Plus,
  Trash2,
  Check,
  Pencil,
  MapPin,
  Loader2,
} from "lucide-vue-next";
import { useAddressStore } from "@/stores/customer/address.store";
import { AddressForm } from "@/components/address";
import type { AddressBody, Address } from "@/types";

const addressStore = useAddressStore();
const addresses = computed(() => addressStore.addresses);

const showModal = ref(false);
const isEditMode = ref(false);
const editingId = ref<number | null>(null);

const nextDefaultLabel = computed(() => {
  const nums = addresses.value
    .map((a) => a.label?.match(/^ที่อยู่จัดส่ง (\d+)$/)?.at(1))
    .filter(Boolean)
    .map(Number);
  return `ที่อยู่จัดส่ง ${nums.length ? Math.max(...nums) + 1 : 1}`;
});

const emptyFormErrors = {
  recipient: "",
  phone: "",
  address: "",
  province: "",
  district: "",
  subDistrict: "",
};
const formErrors = reactive({ ...emptyFormErrors });

function validateForm(): boolean {
  formErrors.recipient = form.recipient.trim() ? "" : "กรุณากรอกชื่อผู้รับ";
  const phoneTrimmed = form.phone.trim();
  const phoneOk = /^[0-9\-+\s()]{9,15}$/.test(phoneTrimmed);
  formErrors.phone = !phoneTrimmed
    ? "กรุณากรอกเบอร์โทรศัพท์"
    : !phoneOk ? "รูปแบบเบอร์โทรไม่ถูกต้อง" : "";
  formErrors.address = form.address.trim() ? "" : "กรุณากรอกที่อยู่";
  formErrors.province = form.province ? "" : "กรุณาเลือกจังหวัด";
  formErrors.district = form.district ? "" : "กรุณาเลือกอำเภอ/เขต";
  formErrors.subDistrict = form.postal_code ? "" : "กรุณาเลือกตำบล/แขวง";
  return !Object.values(formErrors).some(Boolean);
}

const emptyForm: AddressBody = {
  label: "",
  recipient: "",
  phone: "",
  address: "",
  sub_district: "",
  district: "",
  province: "",
  postal_code: "",
  is_default: false,
};
const form = reactive<AddressBody>({ ...emptyForm });

const addressFormValue = computed({
  get: () => ({
    address: form.address,
    subDistrict: form.sub_district || "",
    district: form.district || "",
    province: form.province,
    postalCode: form.postal_code,
  }),
  set: (val) => {
    form.address = val.address;
    form.sub_district = val.subDistrict;
    form.district = val.district;
    form.province = val.province;
    form.postal_code = val.postalCode;
  },
});

onMounted(() => {
  addressStore.fetchAddresses();
});

watch(() => form.recipient, () => { formErrors.recipient = ""; });
watch(() => form.phone, () => { formErrors.phone = ""; });
watch(() => form.address, () => { formErrors.address = ""; });
watch(() => form.province, () => { formErrors.province = ""; });
watch(() => form.district, () => { formErrors.district = ""; });
watch(() => form.sub_district, () => { formErrors.subDistrict = ""; });
watch(() => form.postal_code, () => { formErrors.subDistrict = ""; });

function openAddModal() {
  Object.assign(form, { ...emptyForm, label: nextDefaultLabel.value });
  Object.assign(formErrors, { ...emptyFormErrors });
  isEditMode.value = false;
  editingId.value = null;
  showModal.value = true;
}

function openEditModal(addr: Address) {
  Object.assign(form, {
    label: addr.label || "",
    recipient: addr.recipient,
    phone: addr.phone,
    address: addr.address,
    sub_district: addr.sub_district || "",
    district: addr.district || "",
    province: addr.province,
    postal_code: addr.postal_code,
    is_default: addr.is_default,
  });
  isEditMode.value = true;
  editingId.value = addr.id;
  Object.assign(formErrors, { ...emptyFormErrors });
  showModal.value = true;
}

async function saveAddress() {
  if (!validateForm()) return;
  let success = false;
  if (isEditMode.value && editingId.value) {
    success = await addressStore.updateAddress(editingId.value, form);
  } else {
    success = await addressStore.createAddress(form);
  }

  if (success) {
    showModal.value = false;
  }
}

async function setDefault(id: number) {
  await addressStore.setAsDefault(id);
}

async function deleteAddress(id: number) {
  if (!confirm("ต้องการลบที่อยู่นี้หรือไม่?")) return;
  await addressStore.deleteAddress(id);
}

</script>

<template>
  <div>
    <div class="card">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-lg font-bold text-secondary-900">ที่อยู่จัดส่ง</h2>
          <p class="text-sm text-secondary-500 mt-0.5">
            จัดการที่อยู่สำหรับจัดส่งสินค้า
          </p>
        </div>
        <button @click="openAddModal" class="btn-primary text-sm gap-1.5">
          <Plus class="w-4 h-4" /> เพิ่มที่อยู่
        </button>
      </div>

      <div v-if="addresses.length === 0" class="text-center py-12">
        <div
          class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <MapPin class="w-8 h-8 text-secondary-400" />
        </div>
        <p class="text-secondary-600 font-medium mb-1">ยังไม่มีที่อยู่จัดส่ง</p>
        <p class="text-sm text-secondary-400 mb-4">
          เพิ่มที่อยู่เพื่อใช้ในการสั่งซื้อสินค้า
        </p>
        <button @click="openAddModal" class="btn-outline text-sm gap-1.5">
          <Plus class="w-4 h-4" /> เพิ่มที่อยู่แรก
        </button>
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="addr in addresses"
          :key="addr.id"
          :class="[
            'relative rounded-xl border p-4 transition-all',
            addr.is_default
              ? 'border-primary-300 bg-primary-50/30'
              : 'border-secondary-200 hover:border-secondary-300',
          ]"
        >
          <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm text-secondary-900">{{
                  addr.label || 'ที่อยู่จัดส่ง'
                }}</span>
                <span v-if="addr.is_default" class="badge badge-teal text-xs"
                  >ค่าเริ่มต้น</span
                >
              </div>
              <p class="text-sm text-secondary-700">
                {{ addr.recipient }} · {{ addr.phone }}
              </p>
              <p class="text-sm text-secondary-500 mt-0.5">
                {{ addr.address }}
                {{ addr.district }}, {{ addr.province }} {{ addr.postal_code }}
              </p>
              <div class="flex items-center gap-2 mt-3">
                <button
                  @click="openEditModal(addr)"
                  class="btn-ghost text-xs py-1.5 px-3 gap-1"
                >
                  <Pencil class="w-3 h-3" /> แก้ไข
                </button>
                <button
                  v-if="!addr.is_default"
                  @click="setDefault(addr.id)"
                  class="btn-ghost text-xs py-1.5 px-3 gap-1 text-primary-600"
                >
                  <Check class="w-3 h-3" /> ตั้งเป็นค่าเริ่มต้น
                </button>
                <button
                  v-if="!addr.is_default"
                  @click="deleteAddress(addr.id)"
                  class="btn-ghost text-xs py-1.5 px-3 gap-1 text-danger"
                >
                  <Trash2 class="w-3 h-3" /> ลบ
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="showModal"
      :title="isEditMode ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'"
      size="lg"
      @close="showModal = false"
    >
      <form @submit.prevent="saveAddress" class="space-y-4">
        <BaseInput
          v-model="form.label"
          label="ชื่อที่อยู่"
          placeholder="เช่น บ้าน ที่ทำงาน"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.recipient"
            label="ชื่อผู้รับ"
            placeholder="ชื่อ-นามสกุล ผู้รับสินค้า"
            required
            :error="formErrors.recipient"
          />
          <BaseInput
            v-model="form.phone"
            type="tel"
            label="เบอร์โทรศัพท์"
            placeholder="0xx-xxx-xxxx"
            required
            :error="formErrors.phone"
          />
        </div>

        <AddressForm
          v-model="addressFormValue"
          :errors="{
            address: formErrors.address,
            province: formErrors.province,
            district: formErrors.district,
            subDistrict: formErrors.subDistrict,
          }"
        />
      </form>
      <template #footer>
        <button @click="showModal = false" class="btn-ghost">ยกเลิก</button>
        <button
          @click="saveAddress"
          :disabled="addressStore.isLoading"
          class="btn-primary gap-2 ml-auto"
        >
          <Loader2 v-if="addressStore.isLoading" class="w-4 h-4 animate-spin" />
          {{
            addressStore.isLoading
              ? "กำลังบันทึก..."
              : isEditMode
                ? "บันทึกการแก้ไข"
                : "เพิ่มที่อยู่"
          }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
