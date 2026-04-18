# useToast Composable

Composable สำหรับแสดง toast notifications ด้วย vue-toastification

## 📦 Import

```typescript
import { useToast } from "@/composables";
```

## 🎯 Methods

### success(message, options?)

แสดง toast สีเขียว สำหรับการดำเนินการสำเร็จ

```typescript
const toast = useToast();

toast.success("บันทึกสำเร็จ!");
toast.success("บันทึกสำเร็จ!", {
  timeout: 5000,
});
```

---

### error(message, options?)

แสดง toast สีแดง สำหรับข้อผิดพลาด

```typescript
toast.error("เกิดข้อผิดพลาด");
toast.error("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
```

---

### warning(message, options?)

แสดง toast สีเหลือง สำหรับคำเตือน

```typescript
toast.warning("คำเตือน");
toast.warning("กรุณาตรวจสอบข้อมูลอีกครั้ง");
```

---

### info(message, options?)

แสดง toast สีน้ำเงิน สำหรับข้อมูล

```typescript
toast.info("ข้อมูล");
toast.info("มีการอัปเดตใหม่");
```

---

### show(message, options?)

แสดง toast แบบ default

```typescript
toast.show("ข้อความทั่วไป");
```

---

### clear()

ปิด toast ทั้งหมด

```typescript
toast.clear();
```

---

## 📝 ตัวอย่างการใช้งาน

### Form Submission

```vue
<script setup lang="ts">
import { useToast } from "@/composables";

const toast = useToast();

async function onSubmit(values: any) {
  try {
    await api.submit(values);
    toast.success("บันทึกสำเร็จ!");
  } catch (error: any) {
    toast.error(error.message || "เกิดข้อผิดพลาด");
  }
}
</script>
```

### API Call with Loading State

```vue
<script setup lang="ts">
import { ref } from "vue";
import { useToast } from "@/composables";

const toast = useToast();
const isLoading = ref(false);

async function fetchData() {
  isLoading.value = true;

  try {
    const data = await api.fetch();
    toast.success("โหลดข้อมูลสำเร็จ!");
    return data;
  } catch (error) {
    toast.error("ไม่สามารถโหลดข้อมูลได้");
  } finally {
    isLoading.value = false;
  }
}
</script>
```

### Delete with Confirmation

```vue
<script setup lang="ts">
import { useToast } from "@/composables";

const toast = useToast();

async function deleteItem(id: string) {
  try {
    await api.delete(id);
    toast.success("ลบสำเร็จ!");
  } catch (error: any) {
    toast.error(error.message || "ไม่สามารถลบได้");
  }
}
</script>
```

### Copy to Clipboard

```vue
<script setup lang="ts">
import { useToast } from "@/composables";

const toast = useToast();

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("คัดลอกแล้ว!");
}
</script>
```

---

## 💡 Best Practices

### 1. ให้ข้อความที่ชัดเจนและกระชับ

```typescript
// ❌ Bad - ข้อความยาวเกินไป
toast.success("บันทึกข้อมูลผู้ใช้ John Doe สำเร็จแล้ว และส่งอีเมลยืนยันไปแล้ว");

// ✅ Good - ข้อความสั้นและชัดเจน
toast.success("บันทึกสำเร็จ!");
```

### 2. ให้ข้อมูลที่เป็นประโยชน์ใน error

```typescript
// ❌ Bad - ไม่ช่วยอะไร
toast.error("เกิดข้อผิดพลาด");

// ✅ Good - บอกสาเหตุหรือวิธีแก้
toast.error("ไม่สามารถบันทึกได้ กรุณาตรวจสอบการเชื่อมต่ออินเทอร์เน็ต");
```

### 3. ใช้ warning สำหรับการแจ้งเตือน

```typescript
// เมื่อข้อมูลไม่สมบูรณ์
toast.warning("กรุณากรอกข้อมูลให้ครบถ้วน");

// เมื่อใกล้ถึงขั้นตอนสำคัญ
toast.warning("การดำเนินการนี้ไม่สามารถย้อนกลับได้");
```

---

## 🎨 Advanced Usage

### Custom Timeout

```typescript
toast.success("บันทึกสำเร็จ!", {
  timeout: 2000, // แสดง 2 วินาที
});
```

### Disable Auto Close

```typescript
toast.error("เกิดข้อผิดพลาดร้ายแรง", {
  timeout: false, // ไม่ปิดอัตโนมัติ
});
```

### Custom Options

```typescript
toast.success("บันทึกสำเร็จ!", {
  timeout: 5000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  hideProgressBar: false,
});
```

---

## 🎯 Common Use Cases

### Authentication

```typescript
// Login success
toast.success(`ยินดีต้อนรับ ${user.name}`);

// Login error
toast.error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");

// Logout
toast.info("ออกจากระบบแล้ว");
```

### CRUD Operations

```typescript
// Create
toast.success("เพิ่มรายการสำเร็จ!");

// Update
toast.success("อัปเดตสำเร็จ!");

// Delete
toast.success("ลบรายการสำเร็จ!");
```

### File Upload

```typescript
try {
  await api.uploadFile(file);
  toast.success(`อัปโหลด ${file.name} สำเร็จ!`);
} catch (error) {
  toast.error(`ไม่สามารถอัปโหลด ${file.name} ได้`);
}
```

### Network Errors

```typescript
try {
  await api.call();
} catch (error) {
  if (error.code === "NETWORK_ERROR") {
    toast.error("ไม่สามารถเชื่อมต่อได้ กรุณาตรวจสอบอินเทอร์เน็ต");
  } else if (error.code === "TIMEOUT") {
    toast.error("หมดเวลาการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
  } else {
    toast.error(error.message || "เกิดข้อผิดพลาด");
  }
}
```

---

## 📚 Type Definitions

```typescript
interface ToastOptions {
  timeout?: number | false;
  closeOnClick?: boolean;
  pauseOnFocusLoss?: boolean;
  pauseOnHover?: boolean;
  draggable?: boolean;
  showCloseButtonOnHover?: boolean;
  hideProgressBar?: boolean;
  icon?: boolean | string;
}
```

---

## 🔗 Related

- [Vue-Toastification Documentation](https://vue-toastification.maronato.dev/)
- [Composables Index](./index.ts)
