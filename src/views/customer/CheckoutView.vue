<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import Navbar from "@/components/layout/Navbar.vue";
import { useCartStore } from "@/stores/cart.store";
import { useAuthStore } from "@/stores/auth.store";
import {
  CheckCircle,
  MapPin,
  FileText,
  CreditCard,
  Upload,
} from "lucide-vue-next";
import { BaseInput, BaseTextarea } from "@/components/ui";

const router = useRouter();
const cart = useCartStore();
const auth = useAuthStore();

const step = ref(1);
const isProcessing = ref(false);

// Mock address
const selectedAddress = ref({
  recipient: auth.currentUser?.full_name || "ผู้ใช้งาน",
  phone: "081-234-5678",
  address: "123 ถ.พหลโยธิน จตุจักร",
  province: "กรุงเทพมหานคร",
  postal_code: "10900",
});

// Prescription
const prescriptionFile = ref<File | null>(null);

function fmt(n: number) {
  return n.toLocaleString("th-TH", { minimumFractionDigits: 2 });
}

const steps = [
  { label: "ที่อยู่", icon: MapPin },
  { label: "ใบสั่งยา", icon: FileText },
  { label: "สรุป", icon: CheckCircle },
  { label: "ชำระเงิน", icon: CreditCard },
];

// Skip prescription step if not needed
const needPrescription = computed(() => cart.hasPrescriptionItem);
const effectiveStep = computed(() => {
  if (!needPrescription.value && step.value >= 2) return step.value + 1;
  return step.value;
});

async function placeOrder() {
  isProcessing.value = true;
  // TODO: POST /orders with cart items, address, prescription
  await new Promise((r) => setTimeout(r, 2000)); // simulate payment
  cart.clearCart();
  router.push("/checkout/success");
}

function handleFileUpload(e: Event) {
  const input = e.target as HTMLInputElement;
  prescriptionFile.value = input.files?.[0] || null;
  // TODO: POST /orders/:id/prescription to upload file to S3
}
</script>

<template>
  <div>
    <Navbar />
    <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="page-title mb-6">ชำระเงิน</h1>

      <!-- Stepper -->
      <div class="flex items-center mb-8">
        <template
          v-for="(s, i) in steps.filter((_, i) => needPrescription || i !== 1)"
          :key="i"
        >
          <div :class="['flex flex-col items-center', i > 0 && 'flex-1']">
            <div
              v-if="i > 0"
              :class="[
                'h-0.5 w-full mb-3',
                step > i ? 'bg-primary-600' : 'bg-secondary-200',
              ]"
            />
            <div
              :class="[
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold mt-0 shrink-0',
                step > i + 1
                  ? 'bg-primary-600 text-white'
                  : step === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-200 text-secondary-500',
              ]"
            >
              {{ i + 1 }}
            </div>
            <span class="text-xs mt-1 text-secondary-500">{{ s.label }}</span>
          </div>
          <div
            v-if="
              i < steps.filter((_, i) => needPrescription || i !== 1).length - 1
            "
            :class="[
              'flex-1 h-0.5 mx-2 mt-0 -translate-y-3',
              step > i + 1 ? 'bg-primary-600' : 'bg-secondary-200',
            ]"
          />
        </template>
      </div>

      <!-- Step 1: Address -->
      <div v-if="step === 1" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <MapPin class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">ที่อยู่จัดส่ง</h2>
          </div>
          <div
            class="bg-primary-50 border border-primary-100 rounded-xl p-4 mb-4"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-semibold text-secondary-900">
                  {{ selectedAddress.recipient }}
                </p>
                <p class="text-sm text-secondary-500 mt-1">
                  {{ selectedAddress.phone }}
                </p>
                <p class="text-sm text-secondary-500">
                  {{ selectedAddress.address }}, {{ selectedAddress.province }}
                  {{ selectedAddress.postal_code }}
                </p>
              </div>
              <span class="badge badge-teal text-xs">ค่าเริ่มต้น</span>
            </div>
          </div>
          <!-- TODO: load from GET /addresses and render address picker -->
          <button class="btn-secondary text-sm w-full">
            + เพิ่ม / เลือกที่อยู่อื่น
          </button>
        </div>
        <div class="flex justify-end">
          <button @click="step = needPrescription ? 2 : 3" class="btn-primary">
            ถัดไป →
          </button>
        </div>
      </div>

      <!-- Step 2: Prescription upload (conditional) -->
      <div v-if="step === 2 && needPrescription" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <FileText class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">อัปโหลดใบสั่งแพทย์</h2>
          </div>
          <p class="text-sm text-secondary-500 mb-4">
            มีสินค้าในตะกร้าที่ต้องใช้ใบสั่งแพทย์ กรุณาอัปโหลดไฟล์
          </p>
          <label
            :class="[
              'flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-xl cursor-pointer transition-colors',
              prescriptionFile
                ? 'border-primary-400 bg-primary-50'
                : 'border-secondary-200 hover:border-primary-300 hover:bg-secondary-50',
            ]"
          >
            <Upload class="w-8 h-8 text-secondary-300 mb-2" />
            <p class="text-sm text-secondary-500">
              {{
                prescriptionFile ? prescriptionFile.name : "คลิกเพื่ออัปโหลด"
              }}
            </p>
            <p class="text-xs text-secondary-400 mt-1">
              PDF, JPG, PNG สูงสุด 10MB
            </p>
            <input
              type="file"
              accept="image/*,.pdf"
              class="hidden"
              @change="handleFileUpload"
            />
            <!-- TODO: upload to S3 via POST /orders/:id/prescription -->
          </label>
        </div>
        <div class="flex justify-between">
          <button @click="step = 1" class="btn-secondary">← ย้อนกลับ</button>
          <button
            @click="step = 3"
            :disabled="!prescriptionFile"
            class="btn-primary"
          >
            ถัดไป →
          </button>
        </div>
      </div>

      <!-- Step 3: Summary -->
      <div v-if="step === 3" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <CheckCircle class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">สรุปคำสั่งซื้อ</h2>
          </div>
          <div class="divide-y divide-secondary-50">
            <div
              v-for="item in cart.items"
              :key="item.product_id"
              class="flex gap-3 py-3"
            >
              <img
                :src="item.product_image"
                :alt="item.product_name"
                class="w-12 h-12 rounded-lg object-cover"
              />
              <div class="flex-1">
                <p class="text-sm font-medium">{{ item.product_name }}</p>
                <p class="text-xs text-secondary-400">
                  x{{ item.quantity }} {{ item.unit }}
                </p>
              </div>
              <p class="text-sm font-semibold">
                ฿{{ fmt(item.unit_price * item.quantity) }}
              </p>
            </div>
          </div>
          <div class="border-t pt-3 space-y-1.5 text-sm">
            <div class="flex justify-between text-secondary-600">
              <span>ที่อยู่จัดส่ง</span
              ><span class="text-right max-w-xs"
                >{{ selectedAddress.address }},
                {{ selectedAddress.province }}</span
              >
            </div>
            <div class="flex justify-between text-secondary-600">
              <span>ค่าจัดส่ง</span
              ><span
                :class="
                  cart.shippingFee === 0 ? 'text-success font-medium' : ''
                "
                >{{
                  cart.shippingFee === 0 ? "ฟรี" : "฿" + fmt(cart.shippingFee)
                }}</span
              >
            </div>
            <div class="flex justify-between font-bold text-base border-t pt-2">
              <span>รวมทั้งหมด</span
              ><span class="text-primary-700">฿{{ fmt(cart.total) }}</span>
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <button
            @click="step = needPrescription ? 2 : 1"
            class="btn-secondary"
          >
            ← ย้อนกลับ
          </button>
          <button @click="step = 4" class="btn-primary">ถัดไป →</button>
        </div>
      </div>

      <!-- Step 4: Payment (Mockup) -->
      <div v-if="step === 4" class="space-y-4">
        <div class="card">
          <div class="flex items-center gap-2 mb-4">
            <CreditCard class="w-5 h-5 text-primary-600" />
            <h2 class="font-bold text-secondary-900">ชำระเงิน (Mockup)</h2>
          </div>
          <div
            class="bg-gradient-to-br from-secondary-800 to-secondary-900 rounded-2xl p-5 text-white mb-5"
          >
            <div class="flex justify-between mb-8">
              <div class="space-y-0.5">
                <p class="text-xs text-secondary-400">CARD NUMBER</p>
                <p class="font-mono tracking-wider">4242 4242 4242 4242</p>
              </div>
              <span class="text-xl font-bold text-primary-400">VISA</span>
            </div>
            <div class="flex justify-between">
              <div>
                <p class="text-xs text-secondary-400">CARD HOLDER</p>
                <p class="font-medium">
                  {{ auth.currentUser?.email?.split("@")[0]?.toUpperCase() }}
                </p>
              </div>
              <div>
                <p class="text-xs text-secondary-400">EXPIRES</p>
                <p class="font-medium">12/28</p>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <BaseInput
              type="text"
              label="หมายเลขบัตร"
              model-value="4242 4242 4242 4242"
              class="font-mono"
              readonly
            />
            <BaseInput
              type="text"
              label="วันหมดอายุ"
              model-value="12/28"
              readonly
            />
            <BaseInput
              type="text"
              label="ชื่อบนบัตร"
              model-value="MOCK USER"
              readonly
            />
            <BaseInput type="text" label="CVV" model-value="123" readonly />
          </div>
          <div class="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl">
            <p class="text-xs text-amber-700">
              ⚠️ นี่คือ mockup เท่านั้น — ไม่มีการชำระเงินจริง
            </p>
          </div>
        </div>
        <div class="card">
          <div class="flex justify-between font-bold text-lg">
            <span>ยอดที่ต้องชำระ</span>
            <span class="text-primary-700">฿{{ fmt(cart.total) }}</span>
          </div>
        </div>
        <div class="flex justify-between">
          <button @click="step = 3" class="btn-secondary">← ย้อนกลับ</button>
          <button
            @click="placeOrder"
            :disabled="isProcessing"
            class="btn-primary gap-2"
          >
            <span
              v-if="isProcessing"
              class="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
            />
            {{ isProcessing ? "กำลังดำเนินการ..." : "✓ ยืนยันการชำระเงิน" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
