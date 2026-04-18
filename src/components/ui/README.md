# UI Components

คู่มือการใช้งาน component กลางสำหรับ form elements

## 📦 Components ที่มี

### 1. BaseInput

Input field พื้นฐานพร้อม label, icon, และ error message

**Props:**

- `modelValue` - ค่าของ input (v-model)
- `type` - ประเภท input (text, email, password, number, tel, url, search)
- `label` - ข้อความ label
- `placeholder` - ข้อความ placeholder
- `error` - ข้อความ error
- `icon` - Lucide icon component สำหรับด้านซ้าย
- `iconRight` - Lucide icon component สำหรับด้านขวา
- `disabled` - ปิดการใช้งาน
- `required` - บังคับกรอก
- `readonly` - อ่านอย่างเดียว

**Events:**

- `@update:modelValue` - เมื่อค่าเปลี่ยน
- `@iconRightClick` - เมื่อคลิก icon ด้านขวา
- `@blur` - เมื่อ blur
- `@focus` - เมื่อ focus

**ตัวอย่าง:**

```vue
<script setup>
import { BaseInput } from "@/components/ui";
import { Mail, Eye, EyeOff } from "lucide-vue-next";

const email = ref("");
const password = ref("");
const showPassword = ref(false);
</script>

<template>
  <!-- Input with icon -->
  <BaseInput
    v-model="email"
    type="email"
    label="อีเมล"
    placeholder="your@email.com"
    :icon="Mail"
    required
  />

  <!-- Password with toggle -->
  <BaseInput
    v-model="password"
    :type="showPassword ? 'text' : 'password'"
    label="รหัสผ่าน"
    :icon-right="showPassword ? EyeOff : Eye"
    @icon-right-click="showPassword = !showPassword"
    required
  />

  <!-- With error -->
  <BaseInput
    v-model="email"
    type="email"
    label="อีเมล"
    error="อีเมลไม่ถูกต้อง"
  />
</template>
```

---

### 2. BaseSelect

Select dropdown พร้อม label และ error message

**Props:**

- `modelValue` - ค่าที่เลือก (v-model)
- `options` - Array ของ `{ value, label, disabled? }`
- `label` - ข้อความ label
- `placeholder` - ข้อความ placeholder
- `error` - ข้อความ error
- `icon` - Lucide icon component
- `disabled` - ปิดการใช้งาน
- `required` - บังคับเลือก

**Events:**

- `@update:modelValue` - เมื่อค่าเปลี่ยน
- `@change` - เมื่อเปลี่ยนค่า

**ตัวอย่าง:**

```vue
<script setup>
import { BaseSelect } from "@/components/ui";
import { User } from "lucide-vue-next";

const role = ref("");
const roleOptions = [
  { value: "admin", label: "ผู้ดูแลระบบ" },
  { value: "user", label: "ผู้ใช้ทั่วไป", disabled: true },
];
</script>

<template>
  <BaseSelect
    v-model="role"
    label="บทบาท"
    placeholder="เลือกบทบาท"
    :options="roleOptions"
    :icon="User"
    required
  />
</template>
```

---

### 3. BaseCheckbox

Checkbox พร้อม label, description และ error message

**Props:**

- `modelValue` - สถานะ checked (v-model)
- `label` - ข้อความ label
- `description` - คำอธิบายเพิ่มเติม
- `error` - ข้อความ error
- `disabled` - ปิดการใช้งาน
- `required` - บังคับเลือก

**Events:**

- `@update:modelValue` - เมื่อค่าเปลี่ยน
- `@change` - เมื่อเปลี่ยนค่า

**Slots:**

- `default` - สำหรับใส่ content แทน label

**ตัวอย่าง:**

```vue
<script setup>
import { BaseCheckbox } from "@/components/ui";

const agreed = ref(false);
const newsletter = ref(false);
</script>

<template>
  <!-- With label -->
  <BaseCheckbox
    v-model="agreed"
    label="ยอมรับข้อกำหนดและเงื่อนไข"
    description="กรุณาอ่านและยอมรับก่อนดำเนินการต่อ"
    required
  />

  <!-- With slot -->
  <BaseCheckbox v-model="newsletter">
    <span class="text-sm">
      รับข่าวสารและโปรโมชั่น
      <a href="#" class="text-primary-600">เงื่อนไข</a>
    </span>
  </BaseCheckbox>
</template>
```

---

### 4. BaseTextarea

Textarea พร้อม label, error message และ character counter

**Props:**

- `modelValue` - ค่าของ textarea (v-model)
- `label` - ข้อความ label
- `placeholder` - ข้อความ placeholder
- `error` - ข้อความ error
- `rows` - จำนวนแถว (default: 4)
- `maxlength` - จำนวนตัวอักษรสูงสุด
- `disabled` - ปิดการใช้งาน
- `required` - บังคับกรอก
- `readonly` - อ่านอย่างเดียว

**Events:**

- `@update:modelValue` - เมื่อค่าเปลี่ยน
- `@blur` - เมื่อ blur
- `@focus` - เมื่อ focus

**ตัวอย่าง:**

```vue
<script setup>
import { BaseTextarea } from "@/components/ui";

const message = ref("");
const reason = ref("");
</script>

<template>
  <!-- Basic -->
  <BaseTextarea
    v-model="message"
    label="ข้อความ"
    placeholder="กรอกข้อความ..."
    :rows="5"
  />

  <!-- With maxlength -->
  <BaseTextarea
    v-model="reason"
    label="เหตุผล"
    placeholder="ระบุเหตุผล..."
    :maxlength="500"
    required
  />
</template>
```

---

## 🎨 Styling

Components ทั้งหมดใช้ Tailwind CSS classes ที่กำหนดไว้ใน `src/style.css`:

- `.input` - สำหรับ input, select, textarea
- `.label` - สำหรับ label
- `.error-msg` - สำหรับข้อความ error
- `.badge` - สำหรับ badge

---

## 📝 Best Practices

1. **ใช้ v-model** สำหรับ two-way binding
2. **ใช้ :error prop** แทนการแสดง error message แยก
3. **ใช้ icon** จาก lucide-vue-next เพื่อความสวยงาม
4. **ใช้ required** เมื่อต้องการบังคับกรอก
5. **ใช้ placeholder** เพื่อแนะนำผู้ใช้

---

## 🔄 Migration Guide

### Before (ใช้ input ธรรมดา)

```vue
<div>
  <label class="label">อีเมล</label>
  <div class="relative">
    <Mail class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary-400" />
    <input v-model="email" type="email" placeholder="your@email.com" required class="input pl-9" />
  </div>
  <p v-if="emailError" class="error-msg">{{ emailError }}</p>
</div>
```

### After (ใช้ BaseInput)

```vue
<BaseInput
  v-model="email"
  type="email"
  label="อีเมล"
  placeholder="your@email.com"
  :icon="Mail"
  :error="emailError"
  required
/>
```

---

## 📦 Export

Components ทั้งหมด export จาก `@/components/ui`:

```vue
<script setup>
import {
  BaseInput,
  BaseSelect,
  BaseCheckbox,
  BaseTextarea,
} from "@/components/ui";
</script>
```
