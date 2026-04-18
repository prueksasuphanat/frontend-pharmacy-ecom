# VeeValidate Integration Guide

คู่มือการใช้งาน VeeValidate ในโปรเจค

## 📦 Components ที่รองรับ VeeValidate

### VInput

Input component ที่ integrate กับ VeeValidate

### VCheckbox

Checkbox component ที่ integrate กับ VeeValidate

---

## 🎯 Validation Rules ที่มี

### Built-in Rules

- `required` - บังคับกรอก
- `email` - ตรวจสอบรูปแบบอีเมล
- `min` - ความยาวขั้นต่ำ
- `confirmed` - ตรวจสอบว่าตรงกับ field อื่น

### Custom Rules

- `password` - ตรวจสอบรหัสผ่าน (อย่างน้อย 8 ตัวอักษร และมีตัวเลข)

---

## 📝 วิธีใช้งาน

### 1. Import และ Setup Form

```vue
<script setup lang="ts">
import { useForm } from "vee-validate";
import { VInput, VCheckbox } from "@/components/ui";
import "@/utils/validation"; // import validation rules

const { handleSubmit, values } = useForm({
  validationSchema: {
    email: "required|email",
    password: "required|password",
    password_confirmation: "required|confirmed:@password",
    agreed: (value: boolean) => {
      if (!value) return "กรุณายอมรับข้อกำหนด";
      return true;
    },
  },
});

const onSubmit = handleSubmit(async (values) => {
  console.log("Form values:", values);
  // ทำงานเมื่อ form valid
});
</script>
```

### 2. ใช้ VInput และ VCheckbox

```vue
<template>
  <form @submit="onSubmit">
    <!-- Email field -->
    <VInput
      name="email"
      type="email"
      label="อีเมล"
      placeholder="your@email.com"
    />

    <!-- Password field -->
    <VInput
      name="password"
      type="password"
      label="รหัสผ่าน"
      placeholder="อย่างน้อย 8 ตัวอักษร"
    />

    <!-- Confirm password -->
    <VInput
      name="password_confirmation"
      type="password"
      label="ยืนยันรหัสผ่าน"
    />

    <!-- Checkbox -->
    <VCheckbox name="agreed"> ยอมรับข้อกำหนด </VCheckbox>

    <button type="submit">Submit</button>
  </form>
</template>
```

---

## 🔧 Validation Schema Formats

### 1. String Format (แนะนำสำหรับ rules ง่ายๆ)

```typescript
{
  email: 'required|email',
  password: 'required|min:8',
}
```

### 2. Function Format (สำหรับ custom validation)

```typescript
{
  email: (value: string) => {
    if (!value) return 'กรุณากรอกอีเมล';
    if (!value.includes('@')) return 'รูปแบบอีเมลไม่ถูกต้อง';
    return true;
  },
}
```

### 3. Object Format (สำหรับ validation ซับซ้อน)

```typescript
{
  password: {
    required: true,
    min: 8,
    regex: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
  },
}
```

---

## 🎨 Validation Timing

ตั้งค่าใน `src/utils/validation.ts`:

```typescript
configure({
  validateOnBlur: true, // validate เมื่อ blur (แนะนำ)
  validateOnChange: true, // validate เมื่อมีการเปลี่ยนแปลง
  validateOnInput: false, // ไม่ validate ทุกครั้งที่พิมพ์
  validateOnModelUpdate: true,
});
```

---

## 📋 ตัวอย่างการใช้งานจริง

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
  await login(values.email, values.password);
});
</script>

<template>
  <form @submit="onSubmit">
    <VInput name="email" type="email" label="อีเมล" />
    <VInput name="password" type="password" label="รหัสผ่าน" />
    <button type="submit">เข้าสู่ระบบ</button>
  </form>
</template>
```

### Register Form (ตัวอย่างเต็ม)

ดูได้ที่ `src/views/public/RegisterView.vue`

---

## 🌐 Error Messages เป็นภาษาไทย

Error messages ถูกกำหนดใน `src/utils/validation.ts`:

```typescript
const messages: Record<string, string> = {
  required: `กรุณากรอก${context.field}`,
  email: "รูปแบบอีเมลไม่ถูกต้อง",
  min: `${context.field}ต้องมีอย่างน้อย ${context.rule?.params?.[0]} ตัวอักษร`,
  confirmed: "รหัสผ่านไม่ตรงกัน",
};
```

---

## 🔨 สร้าง Custom Validation Rule

```typescript
// ใน src/utils/validation.ts
defineRule("phone", (value: string) => {
  if (!value || !value.length) {
    return true; // ให้ required จัดการ
  }

  // ตรวจสอบเบอร์โทรไทย
  const phoneRegex = /^0[0-9]{9}$/;
  if (!phoneRegex.test(value)) {
    return "รูปแบบเบอร์โทรไม่ถูกต้อง";
  }

  return true;
});
```

จากนั้นใช้งาน:

```typescript
{
  phone: 'required|phone',
}
```

---

## 🎯 Advanced: Field-level Validation

ถ้าต้องการควบคุม validation แบบละเอียด:

```vue
<script setup lang="ts">
import { useField } from "vee-validate";

const { value, errorMessage, meta } = useField("email", "required|email");

// meta.touched - field ถูก blur แล้ว
// meta.dirty - field มีการเปลี่ยนแปลง
// meta.valid - field ผ่าน validation
</script>
```

---

## ⚠️ สิ่งที่ต้องระวัง

1. **ต้อง import validation rules** ก่อนใช้งาน:

   ```typescript
   import "@/utils/validation";
   ```

2. **name prop เป็น required** สำหรับ VInput และ VCheckbox

3. **ใช้ @submit แทน @submit.prevent** เพราะ VeeValidate จัดการ prevent default ให้แล้ว

4. **Error จะแสดงหลัง blur** ไม่ใช่ทันทีที่พิมพ์ (UX ดีกว่า)

---

## 🚀 Next Steps

1. สร้าง VSelect, VTextarea ที่รองรับ VeeValidate
2. เพิ่ม validation rules เพิ่มเติม (phone, url, etc.)
3. สร้าง composable สำหรับ async validation (ตรวจสอบอีเมลซ้ำจาก API)
4. เพิ่ม field-level error styling
