<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { Plus, Edit, Trash2, ChevronRight } from "lucide-vue-next";
import { BaseInput, BaseModal, BaseAutocomplete } from "@/components/ui";
import type {
  ProductUnit,
  Unit,
  CreateProductUnitPayload,
  UpdateProductUnitPayload,
} from "@/types";
import { unitsApi } from "@/api";
import { useToast } from "@/composables";

const props = defineProps<{
  productId: number;
  productName?: string;
  initialUnits?: Unit[];
  baseUnitId?: number | null;
  originalBaseUnitId?: number | null;
  pendingBaseUnit?: Unit | null;
}>();

const emit = defineEmits<{
  (e: "updated"): void;
  (e: "save-product-first"): void;
}>();

const toast = useToast();

const productUnits = ref<ProductUnit[]>([]);
const allUnits = ref<Unit[]>([]);
const isLoading = ref(false);

const addModalOpen = ref(false);
const editModalOpen = ref(false);
const deleteModalOpen = ref(false);
const modalLoading = ref(false);
const selectedUnit = ref<ProductUnit | null>(null);

const addForm = ref<{
  unit_id: number | null;
  base_unit_id: number | null;
  base_unit_qty: number | null;
  default_price: number;
}>({
  unit_id: null,
  base_unit_id: null,
  base_unit_qty: null,
  default_price: 0,
});

const editForm = ref<{
  base_unit_id: number | null;
  base_unit_qty: number | null;
  default_price: number;
}>({
  base_unit_id: null,
  base_unit_qty: null,
  default_price: 0,
});

const multiplierPreview = computed(() => {
  if (!addForm.value.base_unit_id || !addForm.value.base_unit_qty) return 1;
  const parentUnit = productUnits.value.find(
    (pu) => pu.unit_id === addForm.value.base_unit_id,
  );
  if (!parentUnit) return addForm.value.base_unit_qty;
  return addForm.value.base_unit_qty * parentUnit.multiplier_to_base;
});

const editMultiplierPreview = computed(() => {
  if (!editForm.value.base_unit_id || !editForm.value.base_unit_qty) return 1;
  const parentUnit = productUnits.value.find(
    (pu) =>
      pu.unit_id === editForm.value.base_unit_id &&
      pu.id !== selectedUnit.value?.id,
  );
  if (!parentUnit) return editForm.value.base_unit_qty;
  return editForm.value.base_unit_qty * parentUnit.multiplier_to_base;
});

const addedUnitIds = computed(() => productUnits.value.map((pu) => pu.unit_id));
const availableUnitOptions = computed(() =>
  allUnits.value
    .filter((u) => {
      if (!u.is_active) return false;
      if (addedUnitIds.value.includes(u.id)) return false;

      if (
        props.pendingBaseUnit &&
        u.id === props.pendingBaseUnit.id &&
        !addedUnitIds.value.includes(u.id)
      )
        return false;
      return true;
    })
    .map((u) => ({ value: u.id, label: u.name })),
);

const showPendingBaseUnit = computed(() => {
  if (!props.pendingBaseUnit) return false;
  return !productUnits.value.some(
    (pu) => pu.unit_id === props.pendingBaseUnit!.id,
  );
});

const baseUnitOptions = computed(() => {
  const fromDB = productUnits.value
    .filter((pu) => pu.id !== selectedUnit.value?.id)
    .map((pu) => ({ value: pu.unit_id, label: pu.unit.name }));

  if (
    props.pendingBaseUnit &&
    !fromDB.some((o) => o.value === props.pendingBaseUnit!.id)
  ) {
    fromDB.unshift({
      value: props.pendingBaseUnit.id,
      label: props.pendingBaseUnit.name,
    });
  }

  return fromDB;
});

const visibleUnits = computed(() => {
  const baseChanged = props.baseUnitId !== props.originalBaseUnitId;
  if (baseChanged) return [];
  return productUnits.value;
});

function isBaseUnit(unit: ProductUnit): boolean {
  return props.baseUnitId != null && unit.unit_id === props.baseUnitId;
}

async function fetchData() {
  isLoading.value = true;
  try {
    const promises: [Promise<any>, Promise<any>?] = [
      unitsApi.getProductUnits(props.productId),
    ];

    if (!props.initialUnits || props.initialUnits.length === 0) {
      promises.push(unitsApi.getUnits({ limit: 1000, is_active: true }));
    }
    const [unitsRes, allUnitsRes] = await Promise.all(promises);
    productUnits.value = unitsRes.data.units;
    if (allUnitsRes) {
      allUnits.value = allUnitsRes.data;
    } else if (props.initialUnits) {
      allUnits.value = props.initialUnits;
    }
  } catch (err: any) {
    toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูล");
  } finally {
    isLoading.value = false;
  }
}

const addFormErrors = ref<{
  base_unit_id: string;
  base_unit_qty: string;
}>({
  base_unit_id: "",
  base_unit_qty: "",
});

function validateAddForm(): boolean {
  addFormErrors.value = { base_unit_id: "", base_unit_qty: "" };
  let valid = true;

  if (!addForm.value.base_unit_id) {
    addFormErrors.value.base_unit_id = "กรุณาเลือกหน่วยฐาน";
    valid = false;
  }
  if (!addForm.value.base_unit_qty || addForm.value.base_unit_qty <= 0) {
    addFormErrors.value.base_unit_qty = "กรุณากรอกจำนวนที่เทียบ";
    valid = false;
  }

  return valid;
}

function openAddModal() {
  addForm.value = {
    unit_id: null,
    base_unit_id: null,
    base_unit_qty: null,
    default_price: 0,
  };
  addFormErrors.value = { base_unit_id: "", base_unit_qty: "" };
  addModalOpen.value = true;
}

function closeAddModal() {
  addModalOpen.value = false;
}

async function saveProductUnit() {
  if (!addForm.value.unit_id) return;
  if (!validateAddForm()) return;
  modalLoading.value = true;
  try {
    const baseIsPending =
      addForm.value.base_unit_id != null &&
      props.pendingBaseUnit?.id === addForm.value.base_unit_id;

    if (baseIsPending) {
      emit("save-product-first");

      await new Promise((resolve) => setTimeout(resolve, 800));
      await fetchData();
    }

    const payload: CreateProductUnitPayload = {
      unit_id: addForm.value.unit_id,
      default_price: addForm.value.default_price,
      ...(addForm.value.base_unit_id && {
        base_unit_id: addForm.value.base_unit_id,
      }),
      ...(addForm.value.base_unit_qty && {
        base_unit_qty: addForm.value.base_unit_qty,
      }),
    };
    await unitsApi.createProductUnit(props.productId, payload);
    toast.success("เพิ่มหน่วยขายสำเร็จ");
    await fetchData();
    emit("updated");
    closeAddModal();
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "เกิดข้อผิดพลาดในการเพิ่มหน่วยขาย",
    );
  } finally {
    modalLoading.value = false;
  }
}

function openEditModal(unit: ProductUnit) {
  selectedUnit.value = unit;
  editForm.value = {
    base_unit_id: unit.base_unit_id,
    base_unit_qty: unit.base_unit_qty,
    default_price: Number(unit.default_price),
  };
  editModalOpen.value = true;
}

function closeEditModal() {
  editModalOpen.value = false;
  selectedUnit.value = null;
}

async function updateProductUnit() {
  if (!selectedUnit.value) return;
  modalLoading.value = true;
  try {
    const payload: UpdateProductUnitPayload = {
      base_unit_id: editForm.value.base_unit_id,
      base_unit_qty: editForm.value.base_unit_qty,
      default_price: editForm.value.default_price,
    };
    await unitsApi.updateProductUnit(
      props.productId,
      selectedUnit.value.id,
      payload,
    );
    toast.success("อัปเดตหน่วยขายสำเร็จ");
    await fetchData();
    emit("updated");
    closeEditModal();
  } catch (err: any) {
    toast.error(
      err.response?.data?.message || "เกิดข้อผิดพลาดในการอัปเดตหน่วยขาย",
    );
  } finally {
    modalLoading.value = false;
  }
}

function openDeleteModal(unit: ProductUnit) {
  selectedUnit.value = unit;
  deleteModalOpen.value = true;
}

const deletingSpecialPriceCount = computed(() => {
  return selectedUnit.value?._count?.special_prices ?? 0;
});

function closeDeleteModal() {
  deleteModalOpen.value = false;
  selectedUnit.value = null;
}

async function confirmDeleteProductUnit() {
  if (!selectedUnit.value) return;
  modalLoading.value = true;
  try {
    await unitsApi.deleteProductUnit(props.productId, selectedUnit.value.id);
    toast.success("ลบหน่วยขายสำเร็จ");
    await fetchData();
    emit("updated");
    closeDeleteModal();
  } catch (err: any) {
    toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการลบหน่วยขาย");
  } finally {
    modalLoading.value = false;
  }
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-base font-semibold text-secondary-900">หน่วยขาย</h3>
      <button class="btn-primary text-xs gap-1" @click="openAddModal">
        <Plus class="w-3.5 h-3.5" /> เพิ่มหน่วย
      </button>
    </div>

    <div v-if="isLoading" class="text-center py-8 text-secondary-400 text-sm">
      กำลังโหลด...
    </div>

    <div
      v-else-if="visibleUnits.length === 0 && !showPendingBaseUnit"
      class="text-center py-8 text-secondary-400 text-sm border border-dashed border-secondary-200 rounded-lg"
    >
      ยังไม่มีหน่วยขาย กดเพิ่มหน่วยเพื่อเริ่มต้น
    </div>

    <div
      v-if="visibleUnits.length > 0 || showPendingBaseUnit"
      class="space-y-2"
    >
      <div
        v-if="showPendingBaseUnit && pendingBaseUnit"
        class="flex items-center justify-between p-3 bg-primary-50 rounded-lg border border-primary-200 border-dashed"
      >
        <div class="flex items-center gap-3">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-secondary-900">
                {{ pendingBaseUnit.name }}
              </p>
              <span
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700"
              >
                หน่วยฐาน
              </span>
            </div>
            <p class="text-xs text-secondary-400 mt-0.5">(×1 หน่วยฐาน)</p>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs text-secondary-400">ราคากลาง</p>
            <p class="text-sm font-semibold text-secondary-900">฿0.00</p>
          </div>
          <div class="flex items-center gap-1">
            <div
              class="p-1.5 text-secondary-300"
              title="บันทึกสินค้าก่อนแก้ไขราคา"
            >
              <Edit class="w-4 h-4" />
            </div>
            <div
              class="p-1.5 text-secondary-300 cursor-not-allowed"
              title="หน่วยฐานไม่สามารถลบได้"
            >
              <Trash2 class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
      <div
        v-for="unit in visibleUnits"
        :key="unit.id"
        class="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border border-secondary-100"
        :class="isBaseUnit(unit) ? 'border-primary-200 bg-primary-50' : ''"
      >
        <div class="flex items-center gap-3">
          <div>
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium text-secondary-900">
                {{ unit.unit.name }}
              </p>
              <span
                v-if="isBaseUnit(unit)"
                class="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-700"
              >
                หน่วยฐาน
              </span>
            </div>
            <div class="flex items-center gap-2 mt-0.5">
              <span v-if="unit.base_unit" class="text-xs text-secondary-500">
                1 {{ unit.unit.name }} = {{ unit.base_unit_qty }}
                {{ unit.base_unit.name }}
              </span>
              <span class="text-xs text-secondary-400">
                (×{{ unit.multiplier_to_base }} หน่วยฐาน)
              </span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4">
          <div class="text-right">
            <p class="text-xs text-secondary-400">ราคากลาง</p>
            <p class="text-sm font-semibold text-secondary-900">
              ฿{{
                Number(unit.default_price).toLocaleString("th-TH", {
                  minimumFractionDigits: 2,
                })
              }}
            </p>
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="openEditModal(unit)"
              class="p-1.5 text-primary-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="แก้ไข"
            >
              <Edit class="w-4 h-4" />
            </button>
            <button
              v-if="!isBaseUnit(unit)"
              @click="openDeleteModal(unit)"
              class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="ลบ"
            >
              <Trash2 class="w-4 h-4" />
            </button>
            <div
              v-else
              class="p-1.5 text-secondary-300 cursor-not-allowed"
              title="หน่วยฐานไม่สามารถลบได้"
            >
              <Trash2 class="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <BaseModal
      v-if="addModalOpen"
      title="เพิ่มหน่วยขาย"
      size="sm"
      @close="closeAddModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <div>
          <label class="label">หน่วย <span class="text-red-500">*</span></label>
          <BaseAutocomplete
            v-model="addForm.unit_id"
            :options="availableUnitOptions"
            placeholder="เลือกหน่วย"
          />
        </div>

        <div>
          <label class="label"
            >หน่วยฐาน <span class="text-red-500">*</span></label
          >
          <BaseAutocomplete
            v-model="addForm.base_unit_id"
            :options="baseUnitOptions"
            placeholder="เลือกหน่วยฐาน"
            clearable
          />
          <p v-if="addFormErrors.base_unit_id" class="error-msg mt-1.5">
            {{ addFormErrors.base_unit_id }}
          </p>
        </div>

        <BaseInput
          v-model.number="addForm.base_unit_qty"
          label="จำนวนที่เทียบ"
          type="number"
          placeholder="เช่น 12"
          required
          :error="addFormErrors.base_unit_qty"
        />

        <BaseInput
          v-model.number="addForm.default_price"
          label="ราคากลาง (บาท)"
          type="number"
          placeholder="0.00"
        />
      </div>
      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeAddModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-primary text-sm"
          @click="saveProductUnit"
          :disabled="modalLoading || !addForm.unit_id"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-if="editModalOpen && selectedUnit"
      :title="`แก้ไขหน่วย: ${selectedUnit.unit.name}`"
      size="sm"
      @close="closeEditModal"
    >
      <div class="flex flex-col gap-4 py-2">
        <template v-if="!isBaseUnit(selectedUnit)">
          <div>
            <label class="label">หน่วยฐาน</label>
            <BaseAutocomplete
              v-model="editForm.base_unit_id"
              :options="baseUnitOptions"
              placeholder="เลือกหน่วยฐาน (ถ้ามี)"
              clearable
            />
          </div>

          <BaseInput
            v-model.number="editForm.base_unit_qty"
            label="จำนวนที่เทียบ"
            type="number"
            placeholder="เช่น 12"
          />
        </template>

        <BaseInput
          v-model.number="editForm.default_price"
          label="ราคากลาง (บาท)"
          type="number"
          placeholder="0.00"
        />
      </div>
      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeEditModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-primary text-sm"
          @click="updateProductUnit"
          :disabled="modalLoading"
        >
          {{ modalLoading ? "กำลังบันทึก..." : "บันทึก" }}
        </button>
      </template>
    </BaseModal>

    <BaseModal
      v-if="deleteModalOpen && selectedUnit"
      title="ยืนยันการลบ"
      size="sm"
      @close="closeDeleteModal"
    >
      <div class="text-center py-4">
        <div
          class="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4"
        >
          <Trash2 class="w-6 h-6 text-red-600" />
        </div>
        <p class="text-secondary-900 font-medium mb-2">
          ลบหน่วยขาย "{{ selectedUnit.unit.name }}" ?
        </p>
        <template v-if="deletingSpecialPriceCount > 0">
          <p class="text-sm text-red-600 mt-3">
            ⚠️ หน่วยนี้มีราคาพิเศษของลูกค้า
            <span class="font-semibold"
              >{{ deletingSpecialPriceCount }} ราย</span
            >
            ที่จะถูกลบออกด้วย
          </p>
          <p class="text-xs text-secondary-400 mt-1">
            ประวัติการเปลี่ยนแปลงราคายังคงอยู่
          </p>
        </template>
        <p v-else class="text-xs text-secondary-400 mt-3">
          การดำเนินการนี้ไม่สามารถย้อนกลับได้
        </p>
      </div>
      <template #footer>
        <button
          class="btn-secondary text-sm"
          @click="closeDeleteModal"
          :disabled="modalLoading"
        >
          ยกเลิก
        </button>
        <button
          class="btn-danger text-sm"
          @click="confirmDeleteProductUnit"
          :disabled="modalLoading"
        >
          {{ modalLoading ? "กำลังลบ..." : "ลบ" }}
        </button>
      </template>
    </BaseModal>
  </div>
</template>
