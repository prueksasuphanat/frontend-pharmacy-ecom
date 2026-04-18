# VeeValidate Components

Components ที่ integrate กับ VeeValidate สำหรับ form validation

## 🎯 ความแตกต่างระหว่าง Base และ V Components

| Feature          | Base Components | V Components            |
| ---------------- | --------------- | ----------------------- |
| Validation       | Manual          | Automatic (VeeValidate) |
| Error Display    | Manual prop     | Auto from validation    |
| Error Timing     | Immediate       | On blur/change          |
| Form Integration | v-model         | VeeValidate form        |
| Use Case         | Simple forms    | Complex validation      |

---

## 📦 Components

### VInput

Input component with VeeValidate integration

**Props:**

- `name` (required) - Field name สำหรับ validation
- `label` - ข้อความ label
- `type` - ประเภท input
- `placeholder` - ข้อความ placeholder
- `icon` - Lucide icon ด้านซ้าย
- `iconRight` - Lucide icon ด้านขวา
- `disabled` - ปิดการใช้งาน
- `readonly` - อ่านอย่างเดียว
- `modelValue` - ค่าเริ่มต้น (optional)

**Events:**

- `@update:modelValue` - เมื่อค่าเปลี่ยน
- `@iconRightClick` - เมื่อคลิก icon ขวา

**ตัวอย่าง:**

```vue
<VInput
  name="email"
  type="email"
  label="อีเมล"
  placeholder="your@email.com"
  :icon="Mail"
/>
```

---

### VCheckbox

Checkbox component with VeeValidate integration

**Props:**

- `name` (required) - Field name สำหรับ validation
- `label` - ข้อความ label
- `description` - คำอธิบายเพิ่มเติม
- `disabled` - ปิดการใช้งาน
- `modelValue` - ค่าเริ่มต้น (optional)

**Slots:**

- `default` - สำหรับใส่ content แทน label

**ตัวอย่าง:**

```vue
<VCheckbox name="agreed">
  ยอมรับข้อกำหนดและเงื่อนไข
</VCheckbox>
```

---

## 🚀 Quick Start

### 1. Setup Form

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { VInput, VCheckbox } from "@/components/ui";
import "@/utils/validation";

const { handleSubmit, values } = useForm({
  validationSchema: {
    email: "required|email",
    password: "required|password",
    agreed: (value: boolean) => value || "กรุณายอมรับข้อกำหนด",
  },
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Valid form data:", values);
});
</script>
```

### 2. Use in Template

```vue
<template>
  <form @submit="onSubmit">
    <VInput name="email" type="email" label="อีเมล" />

    <VInput name="password" type="password" label="รหัสผ่าน" />

    <VCheckbox name="agreed"> ยอมรับข้อกำหนด </VCheckbox>

    <button type="submit">Submit</button>
  </form>
</template>
```

---

## 📋 Validation Rules

### String Format

```typescript
{
  email: 'required|email',
  password: 'required|min:8',
  phone: 'required|phone',
}
```

### Function Format

```typescript
{
  email: (value: string) => {
    if (!value) return 'กรุณากรอกอีเมล';
    if (!value.includes('@')) return 'รูปแบบไม่ถูกต้อง';
    return true;
  },
}
```

### Confirmed Field (Password Confirmation)

```typescript
{
  password: 'required|password',
  password_confirmation: 'required|confirmed:@password',
}
```

---

## 🎨 Error Display Behavior

### เมื่อไหร่ที่ Error จะแสดง?

1. **On Blur** - เมื่อ user คลิกออกจาก field
2. **On Change** - หลังจาก blur แล้ว ถ้ามีการแก้ไข
3. **On Submit** - เมื่อกด submit และ validation ไม่ผ่าน

### Error จะไม่แสดง:

- ขณะที่กำลังพิมพ์ครั้งแรก (ก่อน blur)
- เมื่อ field ยังไม่ถูก touched

---

## 💡 Best Practices

### 1. ใช้ name ที่มีความหมาย

```vue
<!-- ❌ Bad -->
<VInput name="field1" />

<!-- ✅ Good -->
<VInput name="email" />
```

### 2. กำหนด validation ที่เหมาะสม

```vue
<!-- ❌ Too strict -->
<VInput name="name" />
<!-- validation: 'required|min:2|max:50|alpha' -->

<!-- ✅ Just right -->
<VInput name="name" />
<!-- validation: 'required' -->
```

### 3. ใช้ placeholder ที่ช่วยแนะนำ

```vue
<!-- ✅ Good -->
<VInput name="password" placeholder="อย่างน้อย 8 ตัวอักษร และมีตัวเลข" />
```

### 4. Group related fields

```vue
<div class="space-y-4">
  <VInput name="password" type="password" label="รหัสผ่าน" />
  <VInput name="password_confirmation" type="password" label="ยืนยันรหัสผ่าน" />
</div>
```

---

## 🔧 Advanced Usage

### Access Form State

```vue
<script setup lang="ts">
const { handleSubmit, values, errors, meta } = useForm({
  validationSchema: {
    /* ... */
  },
});

// values - ค่าทั้งหมดใน form
// errors - error messages ทั้งหมด
// meta.valid - form valid หรือไม่
// meta.dirty - form มีการเปลี่ยนแปลงหรือไม่
</script>
```

### Disable Submit Button

```vue
<button type="submit" :disabled="!meta.valid || isLoading">
  Submit
</button>
```

### Reset Form

```vue
<script setup lang="ts">
const { handleSubmit, resetForm } = useForm({
  validationSchema: {
    /* ... */
  },
});

function onCancel() {
  resetForm();
}
</script>
```

---

## 🎯 Real-world Examples

### Login Form

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { VInput } from "@/components/ui";
import "@/utils/validation";

const { handleSubmit } = useForm({
  validationSchema: {
    email: "required|email",
    password: "required",
  },
});

const onSubmit = handleSubmit(async (values) => {
  await loginAPI(values.email, values.password);
});
</script>

<template>
  <form @submit="onSubmit" class="space-y-4">
    <VInput name="email" type="email" label="อีเมล" />
    <VInput name="password" type="password" label="รหัสผ่าน" />
    <button type="submit" class="btn-primary">เข้าสู่ระบบ</button>
  </form>
</template>
```

### Register Form

ดูตัวอย่างเต็มที่ `src/views/public/RegisterView.vue`

---

## 🐛 Troubleshooting

### Error ไม่แสดง

- ✅ ตรวจสอบว่า import `@/utils/validation` แล้ว
- ✅ ตรวจสอบว่า `name` prop ตรงกับ validation schema
- ✅ ตรวจสอบว่า field ถูก blur แล้ว

### Validation ไม่ทำงาน

- ✅ ตรวจสอบว่าใช้ `@submit` ไม่ใช่ `@submit.prevent`
- ✅ ตรวจสอบว่า validation rule ถูกต้อง
- ✅ ตรวจสอบ console สำหรับ error messages

### Form ไม่ submit

- ✅ ตรวจสอบว่าใช้ `handleSubmit` wrapper
- ✅ ตรวจสอบว่า validation ผ่านหมดแล้ว
- ✅ ตรวจสอบว่าไม่มี JavaScript errors

---

## 📚 Resources

- [VeeValidate Documentation](https://vee-validate.logaretm.com/v4/)
- [Validation Rules](https://vee-validate.logaretm.com/v4/guide/global-validators)
- [Custom Rules Guide](./validation.md)
