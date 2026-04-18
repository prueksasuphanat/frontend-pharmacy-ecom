import { defineRule, configure } from "vee-validate";
import { required, email, min, confirmed } from "@vee-validate/rules";

// กำหนด validation rules
defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("confirmed", confirmed);

// Custom rule สำหรับรหัสผ่าน
defineRule("password", (value: string) => {
  if (!value || !value.length) {
    return true; // ให้ required จัดการ
  }
  if (value.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }
  // ตรวจสอบว่ามีตัวเลขอย่างน้อย 1 ตัว
  if (!/\d/.test(value)) {
    return "รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว";
  }
  return true;
});

// กำหนด error messages เป็นภาษาไทย (ไม่แสดงชื่อ field)
configure({
  generateMessage: (context) => {
    const messages: Record<string, string> = {
      required: "กรุณากรอกข้อมูล",
      email: "รูปแบบอีเมลไม่ถูกต้อง",
      min: `ต้องมีอย่างน้อย ${context.rule?.params?.[0]} ตัวอักษร`,
      confirmed: "รหัสผ่านไม่ตรงกัน",
    };

    return messages[context.rule?.name || ""] || "ข้อมูลไม่ถูกต้อง";
  },
  validateOnBlur: true, // validate เมื่อ blur
  validateOnChange: true, // validate เมื่อมีการเปลี่ยนแปลง
  validateOnInput: false, // ไม่ validate ทุกครั้งที่พิมพ์
  validateOnModelUpdate: true,
});

// Field names เป็นภาษาไทย
export const fieldNames: Record<string, string> = {
  email: "อีเมล",
  password: "รหัสผ่าน",
  password_confirmation: "ยืนยันรหัสผ่าน",
  agreed: "ข้อกำหนดและเงื่อนไข",
};
