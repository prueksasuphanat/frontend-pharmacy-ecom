import { defineRule, configure } from "vee-validate";
import { required, email, min, confirmed } from "@vee-validate/rules";

defineRule("required", required);
defineRule("email", email);
defineRule("min", min);
defineRule("confirmed", confirmed);

defineRule("password", (value: string) => {
  if (!value || !value.length) {
    return true;
  }
  if (value.length < 8) {
    return "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร";
  }

  return true;
});

configure({
  generateMessage: (context) => {
    const messages: Record<string, string> = {
      required: "กรุณากรอกข้อมูล",
      email: "รูปแบบอีเมลไม่ถูกต้อง",
      min: `ต้องมีอย่างน้อย ${(context.rule?.params as any)?.[0]} ตัวอักษร`,
      confirmed: "รหัสผ่านไม่ตรงกัน",
    };

    return messages[context.rule?.name || ""] || "ข้อมูลไม่ถูกต้อง";
  },
  validateOnBlur: true,
  validateOnChange: true,
  validateOnInput: false,
  validateOnModelUpdate: true,
});

export const fieldNames: Record<string, string> = {
  email: "อีเมล",
  password: "รหัสผ่าน",
  password_confirmation: "ยืนยันรหัสผ่าน",
  agreed: "ข้อกำหนดและเงื่อนไข",
};
