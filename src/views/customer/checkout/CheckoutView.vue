<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import { useCartStore } from "@/stores/customer/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useOrderStore } from "@/stores/customer/order.store";
import { useAddressStore } from "@/stores/customer/address.store";
import {
  CheckCircle,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  ShoppingBag,
  Truck,
  AlertCircle,
  FileText,
} from "lucide-vue-next";
import {
  BaseInput,
  BaseTextarea,
  BaseSelect,
  BaseAutocomplete,
} from "@/components/ui";
import { formatPrice } from "@/utils/format";
import { AddressForm } from "@/components/address";

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();
const orderStore = useOrderStore();
const addressStore = useAddressStore();

const selectedAddressId = ref<number | "new">("new");

onMounted(async () => {
  await cart.fetchCart();
  await addressStore.fetchAddresses();

  if (addressStore.addresses.length > 0) {
    const defaultAddr =
      addressStore.addresses.find((a) => a.is_default) ||
      addressStore.addresses[0];
    if (defaultAddr) {
      selectedAddressId.value = defaultAddr.id;
      setAddressFromStore(defaultAddr);
    }
  }
});

const step = ref(1);

const steps = [
  { label: "ที่อยู่จัดส่ง", icon: MapPin },
  { label: "ยืนยันคำสั่งซื้อ", icon: CheckCircle },
];

const step1CardRef = ref<HTMLElement | null>(null);
const step1Height = ref<number | null>(null);

const step2CardStyle = computed(() => {
  if (step1Height.value) {
    return { minHeight: `${step1Height.value}px` };
  }
  return {};
});

const goToStep2 = () => {
  if (step1CardRef.value) {
    step1Height.value = step1CardRef.value.offsetHeight;
  }
  step.value = 2;
};

const goToStep1 = () => {
  step1Height.value = null;
  step.value = 1;
};

const address = ref({
  recipient: auth.currentUser
    ? `${auth.currentUser.first_name || ""} ${auth.currentUser.last_name || ""}`.trim()
    : "",
  phone: auth.currentUser?.phone ?? "",
  address: "",
  subDistrict: "",
  district: "",
  province: "",
  postal_code: "",
});

const addressFormValue = computed({
  get: () => ({
    address: address.value.address,
    subDistrict: address.value.subDistrict,
    district: address.value.district,
    province: address.value.province,
    postalCode: address.value.postal_code,
  }),
  set: (val: {
    address: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
  }) => {
    address.value.address = val.address;
    address.value.subDistrict = val.subDistrict;
    address.value.district = val.district;
    address.value.province = val.province;
    address.value.postal_code = val.postalCode;
  },
});

function setAddressFromStore(addr: any) {
  address.value = {
    recipient: addr.recipient,
    phone: addr.phone,
    address: addr.address,
    subDistrict: "",
    district: addr.district || "",
    province: addr.province,
    postal_code: addr.postal_code,
  };
}

const addressOptions = computed(() => {
  const opts = addressStore.addresses.map((a) => ({
    value: a.id,
    label: `${a.label || "ที่อยู่"} - ${a.recipient} (${a.province})`,
  }));
  return [...opts, { value: "new", label: "+ พิมพ์ที่อยู่ใหม่" }];
});

const note = ref("");

const isAddressValid = computed(
  () =>
    address.value.recipient.trim() &&
    address.value.phone.trim() &&
    address.value.address.trim() &&
    address.value.province.trim() &&
    address.value.district.trim() &&
    address.value.postal_code.trim(),
);

function fmt(n: number) {
  return formatPrice(n);
}

async function placeOrder() {
  try {
    const order = await orderStore.createOrder({
      shipping_address: { ...address.value },
      note: note.value || undefined,
    });
    router.push(`/orders/${order.id}/success`);
  } catch {}
}
</script>

<template>
  <div class="min-h-screen bg-secondary-50/50 pb-16">
    <Navbar />

    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <!-- Header -->
      <div class="mb-10 text-center sm:text-left">
        <h1 class="text-2xl font-bold tracking-tight text-secondary-900">
          สั่งซื้อสินค้า
        </h1>
        <p class="mt-2 text-sm text-secondary-500">
          กรุณากรอกข้อมูลที่อยู่จัดส่งและตรวจสอบรายการสั่งซื้อของคุณ
        </p>
      </div>

      <!-- Premium Stepper -->
      <div class="max-w-md mx-auto mb-12 relative">
        <!-- Background Line -->
        <div
          class="absolute left-16 right-16 top-5 -translate-y-1/2 h-0.5 bg-secondary-200"
        />
        <!-- Active Progress Line -->
        <div
          class="absolute left-16 top-5 -translate-y-1/2 h-0.5 bg-primary-600 transition-all duration-500 ease-in-out"
          :style="{ width: step === 1 ? '0%' : 'calc(100% - 8rem)' }"
        />

        <div class="relative flex items-center justify-between w-full">
          <!-- Steps -->
          <div
            v-for="(s, i) in steps"
            :key="i"
            class="relative z-10 flex flex-col items-center w-32"
          >
            <div
              :class="[
                'w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 shadow-sm cursor-default',
                step > i + 1
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : step === i + 1
                    ? 'bg-white border-primary-600 text-primary-600 ring-4 ring-primary-50'
                    : 'bg-white border-secondary-200 text-secondary-400',
              ]"
            >
              <Check v-if="step > i + 1" class="w-5 h-5 stroke-[3]" />
              <component v-else :is="s.icon" class="w-5 h-5" />
            </div>
            <span
              :class="[
                'text-xs font-semibold mt-2.5 transition-colors duration-300 px-2 py-0.5 rounded-full text-center whitespace-nowrap',
                step === i + 1
                  ? 'text-primary-700 bg-primary-50'
                  : 'text-secondary-500 bg-transparent',
              ]"
            >
              {{ s.label }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Layout Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        <!-- Left Column: Forms / Checkout Steps (Takes 2 columns on lg) -->
        <div class="lg:col-span-2 flex flex-col h-full space-y-6">
          <!-- Step 1: Shipping Address -->
          <div v-if="step === 1" class="flex flex-col flex-1 h-full">
            <div
              ref="step1CardRef"
              class="card p-6 sm:p-8 border border-secondary-100 shadow-sm bg-white rounded-2xl flex flex-col justify-between flex-1 min-h-[480px] h-full"
            >
              <div class="flex-1 space-y-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"
                  >
                    <MapPin class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-secondary-900">
                      ที่อยู่จัดส่ง
                    </h2>
                    <p class="text-xs text-secondary-400">
                      กรุณาระบุที่อยู่ปลายทางสำหรับจัดส่งสินค้า
                    </p>
                  </div>
                </div>

                <!-- Saved Addresses Select -->
                <div v-if="addressStore.addresses.length > 0" class="mb-6">
                  <BaseAutocomplete
                    v-model="selectedAddressId"
                    label="เลือกที่อยู่จากสมุดที่อยู่"
                    placeholder="ค้นหาหรือเลือกที่อยู่จัดส่ง..."
                    :options="addressOptions"
                    :icon="MapPin"
                    @change="
                      (val: any) => {
                        if (val === 'new') {
                          address.recipient = auth.currentUser
                            ? `${auth.currentUser.first_name || ''} ${auth.currentUser.last_name || ''}`.trim()
                            : '';
                          address.phone = auth.currentUser?.phone ?? '';
                          address.address = '';
                          address.subDistrict = '';
                          address.district = '';
                          address.province = '';
                          address.postal_code = '';
                        } else {
                          const addr = addressStore.addresses.find(
                            (a) => a.id === val,
                          );
                          if (addr) setAddressFromStore(addr);
                        }
                      }
                    "
                  />
                </div>

                <!-- Address Fields / Form -->
                <div
                  v-if="selectedAddressId === 'new'"
                  class="border-t border-secondary-100 pt-6 mt-4"
                >
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <BaseInput
                      v-model="address.recipient"
                      label="ชื่อผู้รับ *"
                      placeholder="ชื่อ-นามสกุล"
                      required
                    />
                    <BaseInput
                      v-model="address.phone"
                      label="เบอร์โทรศัพท์ *"
                      placeholder="08x-xxx-xxxx"
                      type="tel"
                      required
                    />
                  </div>

                  <AddressForm v-model="addressFormValue" />
                </div>

                <!-- Selected Address Preview Card -->
                <div
                  v-else
                  class="bg-primary-50/40 p-5 rounded-2xl border border-primary-100/70 mt-4 transition-all duration-300 hover:shadow-sm"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="p-2.5 bg-primary-100/80 rounded-xl text-primary-700 mt-0.5 shrink-0"
                    >
                      <MapPin class="w-4 h-4" />
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-secondary-900 mb-1">
                        {{ address.recipient }}
                      </p>
                      <p class="text-sm text-secondary-700 leading-relaxed">
                        {{ address.address }} {{ address.district }}
                        {{ address.province }} {{ address.postal_code }}
                      </p>
                      <p
                        class="text-sm text-secondary-700 mt-2.5 flex items-center gap-1.5"
                      >
                        <span class="text-secondary-400">เบอร์โทรศัพท์:</span>
                        {{ address.phone }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Note / Instructions -->
                <div class="mt-6">
                  <div class="flex items-center gap-2 mb-2">
                    <FileText class="w-4 h-4 text-secondary-400" />
                    <label
                      for="order-note"
                      class="text-sm font-medium text-secondary-600"
                      >หมายเหตุ (ถ้ามี)</label
                    >
                  </div>
                  <BaseTextarea
                    id="order-note"
                    v-model="note"
                    placeholder="เช่น แจ้งก่อนส่ง, ชั้น 3 ไม่มีลิฟต์"
                    :rows="2"
                  />
                </div>
              </div>

              <!-- Actions Step 1 -->
              <div class="mt-8 pt-6 flex justify-end">
                <button
                  @click="goToStep2"
                  :disabled="!isAddressValid"
                  class="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl disabled:opacity-50 transition-all duration-200"
                >
                  ขั้นตอนถัดไป <ArrowRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <!-- Step 2: Review and Place Order -->
          <div v-if="step === 2" class="flex flex-col flex-1 h-full">
            <!-- Address Verification Card -->
            <div
              :style="step2CardStyle"
              class="card p-6 sm:p-8 border border-secondary-100 shadow-sm bg-white rounded-2xl flex flex-col justify-between flex-1 min-h-[480px] h-full"
            >
              <div class="flex-1 space-y-6">
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600"
                  >
                    <MapPin class="w-5 h-5" />
                  </div>
                  <div>
                    <h2 class="text-base font-semibold text-secondary-900">
                      ตรวจสอบที่อยู่จัดส่ง
                    </h2>
                    <p class="text-xs text-secondary-400">
                      กรุณาตรวจสอบรายละเอียดที่อยู่ให้ถูกต้อง
                    </p>
                  </div>
                </div>

                <div
                  class="bg-secondary-50 p-5 rounded-2xl border border-secondary-200/50"
                >
                  <p class="text-sm font-semibold text-secondary-900 mb-1.5">
                    {{ address.recipient }}
                  </p>
                  <p class="text-sm text-secondary-700 leading-relaxed">
                    {{ address.address }}, {{ address.province }}
                    {{ address.postal_code }}
                  </p>
                  <p class="text-sm text-secondary-700 mt-2.5">
                    <span class="text-secondary-400">เบอร์โทรศัพท์:</span>
                    {{ address.phone }}
                  </p>
                  <div
                    v-if="note"
                    class="mt-3 pt-3 border-t border-secondary-200/50 flex gap-2 text-sm text-secondary-600 italic"
                  >
                    <span class="font-semibold text-secondary-500 shrink-0"
                      >หมายเหตุ:</span
                    >
                    <span>{{ note }}</span>
                  </div>
                </div>

                <!-- Error Banner -->
                <div
                  v-if="orderStore.error"
                  class="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 items-start"
                >
                  <AlertCircle class="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p class="text-sm font-bold text-red-900">
                      เกิดข้อผิดพลาดในการสั่งซื้อ
                    </p>
                    <p class="text-sm text-red-700 mt-0.5">
                      {{ orderStore.error }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Actions Step 2 -->
              <div
                class="mt-8 pt-6 border-t border-secondary-100 flex justify-between items-center"
              >
                <button
                  @click="goToStep1"
                  class="btn-secondary flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 active:scale-95"
                >
                  <ArrowLeft class="w-4 h-4" /> ย้อนกลับ
                </button>

                <button
                  @click="placeOrder"
                  :disabled="orderStore.isLoading"
                  class="btn-primary flex items-center gap-2 min-w-[200px] justify-center px-6 py-3 rounded-xl shadow-md transition-all duration-200 active:scale-95"
                >
                  <span
                    v-if="orderStore.isLoading"
                    class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1"
                  />
                  <Check v-else class="w-4 h-4 stroke-[3]" />
                  {{
                    orderStore.isLoading
                      ? "กำลังดำเนินการ..."
                      : "ยืนยันการสั่งซื้อ"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Sticky Order Summary (Visible on both steps) -->
        <div class="lg:col-span-1 lg:sticky lg:top-10 h-full">
          <div
            class="card p-6 border border-secondary-100 shadow-md bg-white rounded-2xl flex flex-col justify-between h-full min-h-[480px]"
          >
            <div class="flex-1">
              <div
                class="flex items-center gap-2 mb-5 pb-4 border-b border-secondary-100"
              >
                <ShoppingBag class="w-5 h-5 text-primary-600" />
                <h2 class="text-base font-semibold text-secondary-900">
                  รายการสั่งซื้อ
                </h2>
                <span
                  class="ml-auto bg-primary-50 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full"
                >
                  {{ cart.items.length }} รายการ
                </span>
              </div>

              <!-- Scrollable Cart Items List -->
              <div
                class="divide-y divide-secondary-100 max-h-[320px] overflow-y-auto pr-1 select-none"
              >
                <div
                  v-for="item in cart.items"
                  :key="item.id"
                  class="flex gap-4 py-3.5 first:pt-0 last:pb-0 group"
                >
                  <!-- Thumbnail Image -->
                  <img
                    v-if="item.product.image_url"
                    :src="item.product.image_url"
                    :alt="item.product.name"
                    class="w-14 h-14 rounded-xl object-cover shrink-0 border border-secondary-100 bg-secondary-50"
                  />
                  <!-- Gradient Placeholder -->
                  <div
                    v-else
                    class="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-teal-50 flex items-center justify-center text-xs text-primary-600 font-bold p-2 leading-tight text-center shrink-0 border border-primary-200/50"
                  >
                    {{ item.product.name.slice(0, 15) }}...
                  </div>

                  <div class="flex-1 min-w-0">
                    <h3
                      class="text-sm font-medium text-secondary-800 truncate group-hover:text-primary-700 transition-colors duration-150"
                    >
                      {{ item.product.name }}
                    </h3>
                    <p class="text-xs text-secondary-400 mt-0.5">
                      x{{ item.quantity }} {{ item.unit.name }}
                    </p>
                  </div>

                  <div class="text-right shrink-0">
                    <p class="text-sm font-bold text-secondary-900">
                      ฿{{ fmt(item.subtotal) }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Price Calculations -->
              <div
                class="border-t border-secondary-100 pt-4 mt-4 space-y-3 text-sm"
              >
                <div class="flex justify-between text-secondary-500">
                  <span>ยอดรวมสินค้า</span>
                  <span class="font-medium text-secondary-800"
                    >฿{{ fmt(cart.subtotal) }}</span
                  >
                </div>

                <!-- Total Sum -->
                <div
                  class="flex justify-between border-t border-dashed border-secondary-200 pt-4 mt-2"
                >
                  <span class="text-sm font-semibold text-secondary-800"
                    >ยอดชำระสุทธิ</span
                  >
                  <span class="text-base font-bold text-primary-700"
                    >฿{{ fmt(cart.total) }}</span
                  >
                </div>
              </div>
            </div>

            <!-- Trust Badge -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
