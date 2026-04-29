<script setup lang="ts">
import { ref, computed } from "vue";
import { useForm } from "vee-validate";
import { VInput, VTextarea } from "@/components/ui";
import { useAuthStore } from "@/stores/auth.store";
import { useToast } from "vue-toastification";
import dayjs, { formatDate } from "@/utils/dayjs";
import "@/utils/validation";
import {
  Camera,
  Save,
  Loader2,
  Mail,
  Phone,
  Calendar,
  UserCircle,
  MapPin,
  X,
  Pencil,
  User,
  AtSign,
} from "lucide-vue-next";

const auth = useAuthStore();
const toast = useToast();

const isEditing = ref(false);
const isSaving = ref(false);

const { handleSubmit, resetForm } = useForm({
  validationSchema: {
    username: (value: string) => {
      if (!value) return "กรุณากรอกชื่อผู้ใช้";
      if (value.length < 3) return "ชื่อผู้ใช้ต้องมีอย่างน้อย 3 ตัวอักษร";
      if (!/^[a-zA-Z0-9_.-]+$/.test(value))
        return "ใช้ได้เฉพาะตัวอักษร ตัวเลข _ . -";
      return true;
    },
    first_name: "required",
    last_name: "required",
    phone: (value: string) => {
      if (!value) return true;
      if (!/^[0-9\-+\s()]{9,15}$/.test(value))
        return "รูปแบบเบอร์โทรไม่ถูกต้อง";
      return true;
    },
  },
});

const user = computed(() => auth.currentUser);

const fullName = computed(() => {
  const u = user.value;
  if (!u) return "ผู้ใช้งาน";
  return (
    [u.title, u.first_name, u.last_name].filter(Boolean).join(" ") || u.username
  );
});

const memberSince = computed(() =>
  formatDate(user.value?.created_at, "D MMMM BBBB"),
);

const roleLabel = computed(() => {
  const map: Record<string, string> = {
    ADMIN: "ผู้ดูแลระบบ",
    PHARMACIST: "เภสัชกร",
    DEMO: "Demo",
    CUSTOMER: "ลูกค้า",
  };
  return map[user.value?.role ?? ""] ?? "ลูกค้า";
});

const profileInputRef = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);

const profileImageUrl = computed(
  () => avatarPreview.value ?? user.value?.profile_image?.url ?? null,
);

function onAvatarChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    toast.error("รูปโปรไฟล์ต้องมีขนาดไม่เกิน 5 MB");
    return;
  }
  avatarFile.value = file;
  avatarPreview.value = URL.createObjectURL(file);
}

function clearAvatar() {
  avatarFile.value = null;
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
  avatarPreview.value = null;
  if (profileInputRef.value) profileInputRef.value.value = "";
}

function startEditing() {
  const u = user.value;
  resetForm({
    values: {
      username: u?.username ?? "",
      first_name: u?.first_name ?? "",
      last_name: u?.last_name ?? "",
      phone: u?.phone ?? "",
      birthdate: u?.birthdate ? dayjs(u.birthdate).format("YYYY-MM-DD") : "",
      address: u?.address ?? "",
    },
  });
  isEditing.value = true;
}

function cancelEditing() {
  clearAvatar();
  isEditing.value = false;
}

const onSubmit = handleSubmit(
  async (formValues) => {
    isSaving.value = true;

    const payload = {
      username: formValues.username,
      first_name: formValues.first_name,
      last_name: formValues.last_name,
      phone: formValues.phone || undefined,
      birthdate: formValues.birthdate || null,
      address: formValues.address || null,
      avatar: avatarFile.value ?? undefined,
    };

    const result = await auth.updateProfile(payload);

    if (result.success) {
      await auth.fetchProfile();

      clearAvatar();

      isEditing.value = false;
      isSaving.value = false;
      toast.success("บันทึกข้อมูลเรียบร้อยแล้ว");
    } else {
      isSaving.value = false;
      toast.error(result.message);
    }
  },
  () => {
    toast.error("กรุณากรอกข้อมูลให้ถูกต้อง");
  },
);
</script>

<template>
  <div>
    <div class="card">
      <div class="flex items-start gap-4 mb-6">
        <div class="relative group shrink-0">
          <div
            class="w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-secondary-300 bg-secondary-50 flex items-center justify-center transition-colors group-hover:border-primary-400"
            :class="{
              'border-solid border-primary-400 bg-primary-50': profileImageUrl,
            }"
          >
            <img
              v-if="profileImageUrl"
              :src="profileImageUrl"
              alt="รูปโปรไฟล์"
              class="w-full h-full object-cover"
            />
            <User
              v-else
              class="w-7 h-7 text-secondary-300 group-hover:text-primary-400 transition-colors"
            />
          </div>

          <!-- Camera overlay on hover -->
          <div
            class="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
          >
            <Camera class="w-5 h-5 text-white" />
          </div>

          <!-- Clickable label -->
          <label
            class="absolute inset-0 rounded-full cursor-pointer"
            title="เปลี่ยนรูปโปรไฟล์"
          >
            <input
              ref="profileInputRef"
              type="file"
              accept="image/*"
              class="sr-only"
              @change="onAvatarChange"
            />
          </label>

          <!-- Remove preview button -->
          <button
            v-if="avatarPreview"
            type="button"
            class="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow transition-colors z-10"
            @click="clearAvatar"
          >
            <X class="w-3 h-3" />
          </button>
        </div>

        <!-- Name + info -->
        <div class="flex-1 min-w-0 pt-0.5">
          <div class="flex items-center gap-2 flex-wrap">
            <h2 class="text-lg font-bold text-secondary-900 leading-tight">
              {{ fullName }}
            </h2>
            <span class="badge badge-teal text-xs">{{ roleLabel }}</span>
          </div>
          <p class="text-sm text-secondary-500 mt-0.5 truncate">
            {{ user?.email }}
          </p>
          <p
            v-if="avatarPreview"
            class="text-xs text-primary-600 mt-1 truncate"
          >
            {{ avatarFile?.name }}
          </p>
        </div>

        <!-- Edit button -->
        <button
          v-if="!isEditing"
          @click="startEditing"
          class="btn-outline text-sm gap-1.5 shrink-0"
        >
          <Pencil class="w-3.5 h-3.5" /> แก้ไข
        </button>
      </div>

      <div v-if="!isEditing" class="space-y-4">
        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p class="text-xs text-secondary-400 mb-0.5">ชื่อผู้ใช้</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ user?.username || "-" }}
            </p>
          </div>
          <div />
        </div>

        <div class="border-t border-secondary-100" />

        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div>
            <p class="text-xs text-secondary-400 mb-0.5">ชื่อ</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ user?.first_name || "-" }}
            </p>
          </div>
          <div>
            <p class="text-xs text-secondary-400 mb-0.5">นามสกุล</p>
            <p class="text-sm font-medium text-secondary-900">
              {{ user?.last_name || "-" }}
            </p>
          </div>
        </div>

        <div class="border-t border-secondary-100" />

        <div class="grid grid-cols-2 gap-x-4 gap-y-4">
          <div class="flex items-start gap-2.5">
            <Mail class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
            <div class="min-w-0">
              <p class="text-xs text-secondary-400 mb-0.5">อีเมล</p>
              <p class="text-sm font-medium text-secondary-900 truncate">
                {{ user?.email || "-" }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <Phone class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-secondary-400 mb-0.5">เบอร์โทรศัพท์</p>
              <p class="text-sm font-medium text-secondary-900">
                {{ user?.phone || "-" }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <Calendar class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-secondary-400 mb-0.5">วันเกิด</p>
              <p class="text-sm font-medium text-secondary-900">
                {{ formatDate(user?.birthdate, "D MMMM BBBB") }}
              </p>
            </div>
          </div>
          <div class="flex items-start gap-2.5">
            <UserCircle class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
            <div>
              <p class="text-xs text-secondary-400 mb-0.5">สมาชิกตั้งแต่</p>
              <p class="text-sm font-medium text-secondary-900">
                {{ memberSince }}
              </p>
            </div>
          </div>
        </div>

        <div class="border-t border-secondary-100" />

        <div class="flex items-start gap-2.5">
          <MapPin class="w-4 h-4 text-secondary-400 mt-0.5 shrink-0" />
          <div>
            <p class="text-xs text-secondary-400 mb-0.5">ที่อยู่</p>
            <p class="text-sm font-medium text-secondary-900 leading-relaxed">
              {{ user?.address || "-" }}
            </p>
          </div>
        </div>
      </div>

      <form v-else @submit="onSubmit" novalidate class="space-y-5">
        <!-- username -->
        <VInput
          name="username"
          label="ชื่อผู้ใช้"
          placeholder="กรอกชื่อผู้ใช้"
          required
        />

        <div class="border-t border-secondary-100" />

        <!-- ชื่อ + นามสกุล -->
        <div class="grid grid-cols-2 gap-4">
          <VInput
            name="first_name"
            label="ชื่อ"
            placeholder="กรอกชื่อ"
            required
          />
          <VInput
            name="last_name"
            label="นามสกุล"
            placeholder="กรอกนามสกุล"
            required
          />
        </div>

        <div class="border-t border-secondary-100" />

        <!-- อีเมล + เบอร์โทร -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="label">อีเมล</label>
            <div class="relative">
              <Mail
                class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400"
              />
              <input
                :value="user?.email"
                type="email"
                disabled
                class="input pl-9 opacity-60 cursor-not-allowed"
              />
            </div>
          </div>
          <VInput
            name="phone"
            type="tel"
            label="เบอร์โทรศัพท์"
            placeholder="0xx-xxx-xxxx"
            :icon="Phone"
          />
        </div>

        <!-- วันเกิด -->
        <div class="grid grid-cols-2 gap-4">
          <VInput
            name="birthdate"
            type="date"
            label="วันเกิด"
            :icon="Calendar"
          />
          <div />
        </div>

        <div class="border-t border-secondary-100" />

        <VTextarea
          name="address"
          label="ที่อยู่"
          placeholder="กรอกที่อยู่"
          :rows="3"
          :maxlength="500"
        />

        <div class="flex items-center gap-3 pt-1">
          <button type="submit" :disabled="isSaving" class="btn-primary gap-2">
            <Loader2 v-if="isSaving" class="w-4 h-4 animate-spin" />
            <Save v-else class="w-4 h-4" />
            {{ isSaving ? "กำลังบันทึก..." : "บันทึกข้อมูล" }}
          </button>
          <button
            type="button"
            @click="cancelEditing"
            :disabled="isSaving"
            class="btn-ghost"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </div>

    <p class="text-xs text-secondary-400 mt-4 text-center">
      หากต้องการเปลี่ยนอีเมล กรุณาติดต่อเจ้าหน้าที่
    </p>
  </div>
</template>
