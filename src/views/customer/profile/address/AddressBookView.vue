<script setup lang="ts">
import { ref, reactive } from "vue";
import { BaseInput, BaseSelect, BaseModal } from "@/components/ui";
import {
  Plus,
  Trash2,
  Check,
  Pencil,
  Home,
  Building2,
  MapPin,
  Loader2,
} from "lucide-vue-next";

interface Address {
  id: number;
  label: string;
  recipient: string;
  phone: string;
  address: string;
  sub_district: string;
  district: string;
  province: string;
  postal_code: string;
  is_default: boolean;
}

// TODO: GET /api/v1/profile/addresses
const addresses = ref<Address[]>([
  {
    id: 1,
    label: "บ้าน",
    recipient: "สมชาย ใจดี",
    phone: "081-234-5678",
    address: "123/45 ถ.พหลโยธิน",
    sub_district: "จตุจักร",
    district: "จตุจักร",
    province: "กรุงเทพมหานคร",
    postal_code: "10900",
    is_default: true,
  },
  {
    id: 2,
    label: "ที่ทำงาน",
    recipient: "สมชาย ใจดี",
    phone: "02-345-6789",
    address: "456 อาคาร ABC ชั้น 12 ถ.สีลม",
    sub_district: "สีลม",
    district: "บางรัก",
    province: "กรุงเทพมหานคร",
    postal_code: "10500",
    is_default: false,
  },
]);

const showModal = ref(false);
const isEditMode = ref(false);
const isSaving = ref(false);
const editingId = ref<number | null>(null);

const labelOptions = [
  { value: "บ้าน", label: "🏠 บ้าน" },
  { value: "ที่ทำงาน", label: "🏢 ที่ทำงาน" },
  { value: "อื่นๆ", label: "📍 อื่นๆ" },
];

const provinceOptions = [
  { value: "กรุงเทพมหานคร", label: "กรุงเทพมหานคร" },
  { value: "นนทบุรี", label: "นนทบุรี" },
  { value: "ปทุมธานี", label: "ปทุมธานี" },
  { value: "สมุทรปราการ", label: "สมุทรปราการ" },
  { value: "เชียงใหม่", label: "เชียงใหม่" },
  { value: "ขอนแก่น", label: "ขอนแก่น" },
  { value: "สงขลา", label: "สงขลา" },
  { value: "ชลบุรี", label: "ชลบุรี" },
];

const emptyForm = {
  label: "บ้าน",
  recipient: "",
  phone: "",
  address: "",
  sub_district: "",
  district: "",
  province: "กรุงเทพมหานคร",
  postal_code: "",
  is_default: false,
};
const form = reactive({ ...emptyForm });

function openAddModal() {
  Object.assign(form, { ...emptyForm });
  isEditMode.value = false;
  editingId.value = null;
  showModal.value = true;
}

function openEditModal(addr: Address) {
  Object.assign(form, {
    label: addr.label,
    recipient: addr.recipient,
    phone: addr.phone,
    address: addr.address,
    sub_district: addr.sub_district,
    district: addr.district,
    province: addr.province,
    postal_code: addr.postal_code,
    is_default: addr.is_default,
  });
  isEditMode.value = true;
  editingId.value = addr.id;
  showModal.value = true;
}

async function saveAddress() {
  isSaving.value = true;
  // TODO: POST /api/v1/profile/addresses | PUT /api/v1/profile/addresses/:id
  await new Promise((r) => setTimeout(r, 600));
  if (isEditMode.value && editingId.value) {
    const idx = addresses.value.findIndex((a) => a.id === editingId.value);
    if (idx !== -1) addresses.value[idx] = { ...addresses.value[idx], ...form };
  } else {
    const newId = Math.max(...addresses.value.map((a) => a.id), 0) + 1;
    addresses.value.push({ id: newId, ...form });
  }
  isSaving.value = false;
  showModal.value = false;
}

async function setDefault(id: number) {
  // TODO: PATCH /api/v1/profile/addresses/:id/default
  addresses.value.forEach((a) => {
    a.is_default = a.id === id;
  });
}

async function deleteAddress(id: number) {
  if (!confirm("ต้องการลบที่อยู่นี้หรือไม่?")) return;
  // TODO: DELETE /api/v1/profile/addresses/:id
  addresses.value = addresses.value.filter((a) => a.id !== id);
}

function getLabelIcon(label: string) {
  if (label === "บ้าน") return Home;
  if (label === "ที่ทำงาน") return Building2;
  return MapPin;
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
          <div class="flex gap-3">
            <div
              :class="[
                'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                addr.is_default ? 'bg-primary-100' : 'bg-secondary-100',
              ]"
            >
              <component
                :is="getLabelIcon(addr.label)"
                :class="[
                  'w-5 h-5',
                  addr.is_default ? 'text-primary-600' : 'text-secondary-500',
                ]"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="font-semibold text-sm text-secondary-900">{{
                  addr.label
                }}</span>
                <span v-if="addr.is_default" class="badge badge-teal text-xs"
                  >ค่าเริ่มต้น</span
                >
              </div>
              <p class="text-sm text-secondary-700">
                {{ addr.recipient }} · {{ addr.phone }}
              </p>
              <p class="text-sm text-secondary-500 mt-0.5">
                {{ addr.address }}, {{ addr.sub_district }},
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
    </div>

    <BaseModal
      v-if="showModal"
      :title="isEditMode ? 'แก้ไขที่อยู่' : 'เพิ่มที่อยู่ใหม่'"
      size="lg"
      @close="showModal = false"
    >
      <form @submit.prevent="saveAddress" class="space-y-4">
        <BaseSelect
          v-model="form.label"
          :options="labelOptions"
          label="ประเภทที่อยู่"
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.recipient"
            label="ชื่อผู้รับ"
            placeholder="ชื่อ-นามสกุล ผู้รับสินค้า"
            required
          />
          <BaseInput
            v-model="form.phone"
            type="tel"
            label="เบอร์โทรศัพท์"
            placeholder="0xx-xxx-xxxx"
            required
          />
        </div>
        <BaseInput
          v-model="form.address"
          label="ที่อยู่"
          placeholder="บ้านเลขที่ ซอย ถนน"
          required
        />
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseInput
            v-model="form.sub_district"
            label="แขวง/ตำบล"
            placeholder="แขวง/ตำบล"
            required
          />
          <BaseInput
            v-model="form.district"
            label="เขต/อำเภอ"
            placeholder="เขต/อำเภอ"
            required
          />
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <BaseSelect
            v-model="form.province"
            :options="provinceOptions"
            label="จังหวัด"
            placeholder="เลือกจังหวัด"
            required
          />
          <BaseInput
            v-model="form.postal_code"
            label="รหัสไปรษณีย์"
            placeholder="xxxxx"
            required
          />
        </div>
      </form>
      <template #footer>
        <button @click="showModal = false" class="btn-ghost">ยกเลิก</button>
        <button
          @click="saveAddress"
          :disabled="isSaving"
          class="btn-primary gap-2 ml-auto"
        >
          <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
          {{
            isSaving
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
