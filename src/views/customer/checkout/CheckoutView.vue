<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import { useCartStore } from "@/stores/customer/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import { useOrderStore } from "@/stores/customer/order.store";
import { useAddressStore } from "@/stores/customer/address.store";
import { CheckCircle, MapPin, ArrowRight, ArrowLeft } from "lucide-vue-next";
import { BaseInput, BaseTextarea, BaseSelect } from "@/components/ui";

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

// T-05: ลด steps จาก 3 เหลือ 2 — ตัด step ชำระเงิน (mock) ออก
// flow ของร้านคือ ส่งของก่อน → ลูกค้าชำระเงินโดยตรงกับเจ้าของร้าน
const step = ref(1);

const steps = [
  { label: "ที่อยู่", icon: MapPin },
  { label: "ยืนยันคำสั่งซื้อ", icon: CheckCircle },
];

// Address form
const address = ref({
  recipient: auth.currentUser
    ? `${auth.currentUser.first_name || ""} ${auth.currentUser.last_name || ""}`.trim()
    : "",
  phone: auth.currentUser?.phone ?? "",
  address: "",
  district: "",
  province: "",
  postal_code: "",
});

function setAddressFromStore(addr: any) {
  address.value = {
    recipient: addr.recipient,
    phone: addr.phone,
    address: addr.address,
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
    address.value.province.trim(),
);

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

// ==========================================
// Place order — เรียกตรงจาก Step 2
// ==========================================
async function placeOrder() {
  try {
    const order = await orderStore.createOrder({
      shipping_address: { ...address.value },
      note: note.value || undefined,
    });
    router.push(`/orders/${order.id}/success`);
  } catch {
    // error แสดงผ่าน orderStore.error
  }
}
</script>

<template>
  <div>
    <Navbar />
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="page-title mb-6">สั่งซื้อสินค้า</h1>

      <!-- Stepper -->
      <div class="flex items-center mb-8">
        <template v-for="(s, i) in steps" :key="i">
          <div :class="['flex flex-col items-center', i > 0 && 'flex-1']">
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
                step > i + 1
                  ? 'bg-primary-600 text-white'
                  : step === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-500',
              ]"
            >
              <component
                :is="step > i + 1 ? CheckCircle : s.icon"
                class="w-4 h-4"
              />
            </div>
            <span class="text-xs mt-1 text-secondary-500">{{ s.label }}</span>
          </div>
          <div
            v-if="i < steps.length - 1"
            :class="[
              'flex-1 h-0.5 mx-2 -translate-y-3',
              step > i + 1 ? 'bg-primary-600' : 'bg-secondary-200',
            ]"
          />
        </template>
      </div>

      <!-- Step 1: Address -->
      <div v-if="step === 1" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-5">
            <MapPin class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">ที่อยู่จัดส่ง</h2>
          </div>

          <div v-if="addressStore.addresses.length > 0" class="mb-6">
            <BaseSelect
              v-model="selectedAddressId"
              label="เลือกที่อยู่จากสมุดที่อยู่"
              :options="addressOptions"
              @change="
                (val: any) => {
                  if (val === 'new') {
                    address.recipient = auth.currentUser
                      ? `${auth.currentUser.first_name || ''} ${auth.currentUser.last_name || ''}`.trim()
                      : '';
                    address.phone = auth.currentUser?.phone ?? '';
                    address.address = '';
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

          <div
            v-if="selectedAddressId === 'new'"
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-secondary-100 pt-5 mt-2"
          >
            <BaseInput
              v-model="address.recipient"
              label="ชื่อผู้รับ *"
              placeholder="ชื่อ-นามสกุล"
            />
            <BaseInput
              v-model="address.phone"
              label="เบอร์โทรศัพท์ *"
              placeholder="08x-xxx-xxxx"
              type="tel"
            />
            <BaseInput
              v-model="address.address"
              label="ที่อยู่ *"
              placeholder="บ้านเลขที่ ถนน แขวง/ตำบล"
              class="sm:col-span-2"
            />
            <BaseInput
              v-model="address.district"
              label="เขต/อำเภอ"
              placeholder="เขต/อำเภอ"
            />
            <BaseInput
              v-model="address.province"
              label="จังหวัด *"
              placeholder="จังหวัด"
            />
            <BaseInput
              v-model="address.postal_code"
              label="รหัสไปรษณีย์"
              placeholder="10xxx"
            />
          </div>

          <div
            v-else
            class="bg-secondary-50 p-4 rounded-xl border border-secondary-200 mt-2"
          >
            <p class="font-medium text-secondary-900 mb-1">
              {{ address.recipient }} · {{ address.phone }}
            </p>
            <p class="text-sm text-secondary-600">
              {{ address.address }} {{ address.district }}
              {{ address.province }} {{ address.postal_code }}
            </p>
          </div>

          <div class="mt-4">
            <BaseTextarea
              v-model="note"
              label="หมายเหตุ (ถ้ามี)"
              placeholder="เช่น แจ้งก่อนส่ง, ชั้น 3 ไม่มีลิฟต์"
              :rows="2"
            />
          </div>
        </div>
        <div class="flex justify-end">
          <button
            @click="step = 2"
            :disabled="!isAddressValid"
            class="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            ถัดไป <ArrowRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Order Summary + Confirm -->
      <div v-if="step === 2" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <CheckCircle class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">สรุปคำสั่งซื้อ</h2>
          </div>

          <!-- Items -->
          <div class="divide-y divide-secondary-50">
            <div
              v-for="item in cart.items"
              :key="item.id"
              class="flex gap-3 py-3"
            >
              <img
                v-if="item.product.image_url"
                :src="item.product.image_url"
                :alt="item.product.name"
                class="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div
                v-else
                class="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-100 to-teal-100 flex items-center justify-center text-xs text-primary-500 font-semibold p-1 leading-snug text-center shrink-0"
              >
                {{ item.product.name }}
              </div>
              <div class="flex-1">
                <p class="text-sm font-medium text-secondary-900">
                  {{ item.product.name }}
                </p>
                <p class="text-xs text-secondary-400">
                  x{{ item.quantity }} {{ item.unit.name }}
                </p>
                <p
                  v-if="item.is_special_price"
                  class="text-xs text-primary-600 font-medium"
                >
                  ★ ราคาพิเศษ
                </p>
              </div>
              <p class="text-sm font-semibold text-secondary-900">
                ฿{{ fmt(item.subtotal) }}
              </p>
            </div>
          </div>

          <!-- Pricing -->
          <div class="border-t pt-3 mt-1 space-y-1.5 text-sm">
            <div class="flex justify-between text-secondary-600">
              <span>ยอดสินค้า</span><span>฿{{ fmt(cart.subtotal) }}</span>
            </div>
            <div class="flex justify-between text-secondary-600">
              <span>ค่าจัดส่ง</span>
              <span
                :class="
                  cart.shippingFee === 0 ? 'text-success font-medium' : ''
                "
              >
                {{
                  cart.shippingFee === 0 ? "ฟรี" : `฿${fmt(cart.shippingFee)}`
                }}
              </span>
            </div>
            <div class="flex justify-between font-bold text-base border-t pt-2">
              <span>รวมทั้งหมด</span>
              <span class="text-primary-700">฿{{ fmt(cart.total) }}</span>
            </div>
          </div>

          <!-- Address recap -->
          <div
            class="mt-4 p-3 bg-secondary-50 rounded-xl text-sm text-secondary-600"
          >
            <p class="font-medium text-secondary-800 mb-0.5">📍 จัดส่งไปที่:</p>
            <p>{{ address.recipient }} · {{ address.phone }}</p>
            <p>
              {{ address.address }}, {{ address.province }}
              {{ address.postal_code }}
            </p>
            <p v-if="note" class="mt-1 text-secondary-400 italic">
              หมายเหตุ: {{ note }}
            </p>
          </div>

          <!-- Payment info -->
          <div class="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
            <p class="text-sm text-blue-700">
              💳 ชำระเงินโดยตรงกับทางร้านหลังได้รับสินค้า
            </p>
          </div>
        </div>

        <!-- Error -->
        <div
          v-if="orderStore.error"
          class="p-3 bg-red-50 border border-red-200 rounded-xl"
        >
          <p class="text-sm text-red-700">❌ {{ orderStore.error }}</p>
        </div>

        <div class="flex justify-between">
          <button
            @click="step = 1"
            class="btn-secondary flex items-center gap-2"
          >
            <ArrowLeft class="w-4 h-4" /> ย้อนกลับ
          </button>
          <button
            @click="placeOrder"
            :disabled="orderStore.isLoading"
            class="btn-primary flex items-center gap-2 min-w-[180px] justify-center"
          >
            <span
              v-if="orderStore.isLoading"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            {{
              orderStore.isLoading ? "กำลังดำเนินการ..." : "✓ ยืนยันคำสั่งซื้อ"
            }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
