<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { Navbar, Footer } from "@/components/layout";
import { BaseInput, BaseSelect, BaseTextarea } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { RouterLink, useRoute } from "vue-router";
import dayjs from "dayjs";
import {
  User,
  Package,
  MapPin,
  Lock,
  Heart,
  ChevronRight,
  Camera,
  Save,
  Loader2,
  CheckCircle,
  Mail,
  Phone,
  Calendar,
  UserCircle,
} from "lucide-vue-next";

const auth = useAuthStore();
const route = useRoute();

// ── Sidebar menu ──────────────────────────────────────────
const menuItems = [
  { to: "/profile/information", label: "ข้อมูลส่วนตัว", icon: User },
  { to: "/profile/orders", label: "คำสั่งซื้อของฉัน", icon: Package },
  { to: "/profile/address", label: "ที่อยู่จัดส่ง", icon: MapPin },
  { to: "/profile/security", label: "เปลี่ยนรหัสผ่าน", icon: Lock },
  { to: "/profile/wishlist", label: "สินค้าที่บันทึกไว้", icon: Heart },
];

// ── Form state ────────────────────────────────────────────
const isEditing = ref(false);
const isSaving = ref(false);
const saveSuccess = ref(false);

const titleOptions = [
  { value: "นาย", label: "นาย" },
  { value: "นาง", label: "นาง" },
  { value: "นางสาว", label: "นางสาว" },
  { value: "เด็กชาย", label: "เด็กชาย" },
  { value: "เด็กหญิง", label: "เด็กหญิง" },
];

const genderOptions = [
  { value: "MALE", label: "ชาย" },
  { value: "FEMALE", label: "หญิง" },
  { value: "OTHER", label: "อื่นๆ" },
];

// Mock profile data (ใช้ข้อมูลจาก auth store ถ้ามี หรือ mock)
const form = reactive({
  title: auth.currentUser?.title || "นาย",
  first_name: auth.currentUser?.first_name || "สมชาย",
  last_name: auth.currentUser?.last_name || "ใจดี",
  email: auth.currentUser?.email || "somchai@example.com",
  phone: auth.currentUser?.phone || "081-234-5678",
  birthdate: auth.currentUser?.birthdate
    ? dayjs(auth.currentUser.birthdate).format("YYYY-MM-DD")
    : "1990-01-15",
  sex: auth.currentUser?.sex || "MALE",
  address:
    auth.currentUser?.address ||
    "123/45 ถ.พหลโยธิน แขวงจตุจักร เขตจตุจักร กรุงเทพมหานคร 10900",
});

// Keep original values for cancel
const originalForm = { ...form };

const fullName = computed(() => {
  return `${form.title || ""}${form.first_name} ${form.last_name}`.trim();
});

const profileImageUrl = computed(() => {
  return auth.currentUser?.profile_image?.url || null;
});

const memberSince = computed(() => {
  const date = auth.currentUser?.created_at || "2026-01-15T00:00:00Z";
  return dayjs(date).format("D MMMM YYYY");
});

// ── Actions ───────────────────────────────────────────────
function startEditing() {
  isEditing.value = true;
  saveSuccess.value = false;
}

function cancelEditing() {
  // Reset form to original values
  Object.assign(form, originalForm);
  isEditing.value = false;
}

async function saveProfile() {
  isSaving.value = true;
  saveSuccess.value = false;

  // TODO: PATCH /api/v1/profile — ยิง API จริง
  // await apiClient.patch('/profile', form)
  await new Promise((r) => setTimeout(r, 800));

  // Update original values
  Object.assign(originalForm, form);
  isSaving.value = false;
  isEditing.value = false;
  saveSuccess.value = true;

  // Auto-hide success message
  setTimeout(() => {
    saveSuccess.value = false;
  }, 3000);
}

function handleAvatarClick() {
  // TODO: POST /api/v1/profile/avatar — อัปโหลดรูปโปรไฟล์
  alert("TODO: เปิด dialog อัปโหลดรูปโปรไฟล์");
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />

    <div class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
      <!-- Page title -->
      <h1 class="page-title mb-6">บัญชีของฉัน</h1>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- ── Sidebar ── -->
        <aside class="w-full lg:w-64 shrink-0">
          <!-- Profile card -->
          <div class="card mb-4 text-center">
            <!-- Avatar -->
            <div class="relative w-20 h-20 mx-auto mb-3">
              <div
                class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center overflow-hidden"
              >
                <img
                  v-if="profileImageUrl"
                  :src="profileImageUrl"
                  alt="รูปโปรไฟล์"
                  class="w-full h-full object-cover"
                />
                <User v-else class="w-10 h-10 text-primary-600" />
              </div>
              <button
                @click="handleAvatarClick"
                class="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                title="เปลี่ยนรูปโปรไฟล์"
              >
                <Camera class="w-3.5 h-3.5" />
              </button>
            </div>
            <p class="font-bold text-secondary-900 text-sm">
              {{ fullName || "ผู้ใช้งาน" }}
            </p>
            <p class="text-xs text-secondary-500 mt-0.5">{{ form.email }}</p>
            <span class="badge badge-teal mt-2 text-xs">
              {{
                auth.currentUser?.role === "ADMIN"
                  ? "ผู้ดูแลระบบ"
                  : auth.currentUser?.role === "PHARMACIST"
                    ? "เภสัชกร"
                    : "ลูกค้า"
              }}
            </span>
          </div>

          <!-- Navigation -->
          <nav class="card p-2 space-y-0.5">
            <RouterLink
              v-for="item in menuItems"
              :key="item.to"
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-colors',
                route.path === item.to
                  ? 'bg-primary-50 text-primary-700 font-medium'
                  : 'text-secondary-600 hover:bg-secondary-50',
              ]"
            >
              <component :is="item.icon" class="w-4 h-4" />
              <span class="flex-1">{{ item.label }}</span>
              <ChevronRight class="w-3.5 h-3.5 opacity-40" />
            </RouterLink>
          </nav>
        </aside>

        <!-- ── Main content ── -->
        <main class="flex-1 min-w-0">
          <!-- Success toast -->
          <Transition name="slide-up">
            <div
              v-if="saveSuccess"
              class="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
            >
              <CheckCircle class="w-4 h-4 shrink-0" />
              บันทึกข้อมูลเรียบร้อยแล้ว
            </div>
          </Transition>

          <div class="card">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <div>
                <h2 class="text-lg font-bold text-secondary-900">
                  ข้อมูลส่วนตัว
                </h2>
                <p class="text-sm text-secondary-500 mt-0.5">
                  จัดการข้อมูลส่วนตัวของคุณ
                </p>
              </div>
              <button
                v-if="!isEditing"
                @click="startEditing"
                class="btn-outline text-sm"
              >
                แก้ไขข้อมูล
              </button>
            </div>

            <!-- ── View mode ── -->
            <div v-if="!isEditing" class="space-y-5">
              <!-- Row: ชื่อ-นามสกุล -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-secondary-400 mb-1">คำนำหน้า</p>
                  <p class="text-sm text-secondary-900 font-medium">
                    {{ form.title || "-" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-secondary-400 mb-1">เพศ</p>
                  <p class="text-sm text-secondary-900 font-medium">
                    {{
                      form.sex === "MALE"
                        ? "ชาย"
                        : form.sex === "FEMALE"
                          ? "หญิง"
                          : form.sex === "OTHER"
                            ? "อื่นๆ"
                            : "-"
                    }}
                  </p>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-secondary-400 mb-1">ชื่อ</p>
                  <p class="text-sm text-secondary-900 font-medium">
                    {{ form.first_name || "-" }}
                  </p>
                </div>
                <div>
                  <p class="text-xs text-secondary-400 mb-1">นามสกุล</p>
                  <p class="text-sm text-secondary-900 font-medium">
                    {{ form.last_name || "-" }}
                  </p>
                </div>
              </div>

              <div class="border-t border-secondary-100 pt-5"></div>

              <!-- Row: ข้อมูลติดต่อ -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-start gap-2.5">
                  <Mail class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                  <div>
                    <p class="text-xs text-secondary-400 mb-1">อีเมล</p>
                    <p class="text-sm text-secondary-900 font-medium">
                      {{ form.email || "-" }}
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <Phone class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                  <div>
                    <p class="text-xs text-secondary-400 mb-1">เบอร์โทรศัพท์</p>
                    <p class="text-sm text-secondary-900 font-medium">
                      {{ form.phone || "-" }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex items-start gap-2.5">
                  <Calendar
                    class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p class="text-xs text-secondary-400 mb-1">วันเกิด</p>
                    <p class="text-sm text-secondary-900 font-medium">
                      {{
                        form.birthdate
                          ? dayjs(form.birthdate).format("D MMMM YYYY")
                          : "-"
                      }}
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-2.5">
                  <UserCircle
                    class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0"
                  />
                  <div>
                    <p class="text-xs text-secondary-400 mb-1">สมาชิกตั้งแต่</p>
                    <p class="text-sm text-secondary-900 font-medium">
                      {{ memberSince }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="border-t border-secondary-100 pt-5"></div>

              <!-- Row: ที่อยู่ -->
              <div class="flex items-start gap-2.5">
                <MapPin class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
                <div>
                  <p class="text-xs text-secondary-400 mb-1">ที่อยู่</p>
                  <p
                    class="text-sm text-secondary-900 font-medium leading-relaxed"
                  >
                    {{ form.address || "-" }}
                  </p>
                </div>
              </div>
            </div>

            <!-- ── Edit mode ── -->
            <form v-else @submit.prevent="saveProfile" class="space-y-5">
              <!-- Row: คำนำหน้า + เพศ -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseSelect
                  v-model="form.title"
                  :options="titleOptions"
                  label="คำนำหน้า"
                  placeholder="เลือกคำนำหน้า"
                />
                <BaseSelect
                  v-model="form.sex"
                  :options="genderOptions"
                  label="เพศ"
                  placeholder="เลือกเพศ"
                />
              </div>

              <!-- Row: ชื่อ + นามสกุล -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="form.first_name"
                  label="ชื่อ"
                  placeholder="กรอกชื่อ"
                  required
                />
                <BaseInput
                  v-model="form.last_name"
                  label="นามสกุล"
                  placeholder="กรอกนามสกุล"
                  required
                />
              </div>

              <div class="border-t border-secondary-100 pt-5"></div>

              <!-- Row: อีเมล + เบอร์โทร -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="form.email"
                  type="email"
                  label="อีเมล"
                  placeholder="example@email.com"
                  :icon="Mail"
                  readonly
                  disabled
                />
                <BaseInput
                  v-model="form.phone"
                  type="tel"
                  label="เบอร์โทรศัพท์"
                  placeholder="0xx-xxx-xxxx"
                  :icon="Phone"
                />
              </div>

              <!-- Row: วันเกิด -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <BaseInput
                  v-model="form.birthdate"
                  type="date"
                  label="วันเกิด"
                  :icon="Calendar"
                />
                <div></div>
              </div>

              <div class="border-t border-secondary-100 pt-5"></div>

              <!-- Row: ที่อยู่ -->
              <BaseTextarea
                v-model="form.address"
                label="ที่อยู่"
                placeholder="กรอกที่อยู่"
                :rows="3"
                :maxlength="500"
              />

              <!-- Actions -->
              <div class="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  :disabled="isSaving"
                  class="btn-primary gap-2"
                >
                  <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
                  <Save v-else class="w-4 h-4" />
                  {{ isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
                </button>
                <button type="button" @click="cancelEditing" class="btn-ghost">
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>

          <!-- Info note -->
          <p class="text-xs text-secondary-400 mt-4 text-center">
            <!-- TODO: เชื่อม PATCH /api/v1/profile -->
            หากต้องการเปลี่ยนอีเมล กรุณาติดต่อเจ้าหน้าที่
          </p>
        </main>
      </div>
    </div>

    <Footer />
  </div>
</template>
