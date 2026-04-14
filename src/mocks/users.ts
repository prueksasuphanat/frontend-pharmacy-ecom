// ============================================================
// MOCK DATA — users.ts, roles.ts, notifications.ts
// TODO: Replace with real API calls
// ============================================================

export interface Role {
  id: string
  name: string
  label: string
  description: string
  is_admin: boolean
  user_count: number
}

export interface User {
  id: string
  email: string
  full_name?: string
  role_id: string
  role_name: string
  role_label: string
  is_email_verified: boolean
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string
  is_read: boolean
  created_at: string
}

export interface AuditLog {
  id: string
  admin_email: string
  action: string
  target_type: string
  target_id: string
  role_affected: string
  old_value: Record<string, unknown>
  new_value: Record<string, unknown>
  changed_at: string
}

// Mock Roles
export const MOCK_ROLES: Role[] = [
  { id: 'role-admin',     name: 'admin',     label: 'ผู้ดูแลระบบ',       description: 'เภสัชกร / เจ้าของร้าน',    is_admin: true,  user_count: 2  },
  { id: 'role-wholesale', name: 'wholesale', label: 'ขายส่ง',           description: 'ร้านขายส่งยา',             is_admin: false, user_count: 8  },
  { id: 'role-clinic',    name: 'clinic',    label: 'คลินิก/โรงพยาบาล', description: 'คลินิก / โรงพยาบาลเล็ก', is_admin: false, user_count: 15 },
  { id: 'role-retail',    name: 'retail',    label: 'ลูกค้าทั่วไป',     description: 'ลูกค้าทั่วไป (default)',   is_admin: false, user_count: 142 },
]

// Mock Users
export const MOCK_USERS: User[] = [
  { id: 'user-admin-001',     email: 'admin@pharma.com',         full_name: 'ภ.ก. สมศักดิ์ รักษาดี',  role_id: 'role-admin',     role_name: 'admin',     role_label: 'ผู้ดูแลระบบ',       is_email_verified: true,  is_active: true,  created_at: '2026-01-01T00:00:00Z' },
  { id: 'user-retail-001',    email: 'somchai@example.com',      full_name: 'นาย สมชาย ใจดี',          role_id: 'role-retail',    role_name: 'retail',    role_label: 'ลูกค้าทั่วไป',     is_email_verified: true,  is_active: true,  created_at: '2026-01-15T00:00:00Z' },
  { id: 'user-retail-002',    email: 'malee@example.com',        full_name: 'นาง มาลี สดใส',            role_id: 'role-retail',    role_name: 'retail',    role_label: 'ลูกค้าทั่วไป',     is_email_verified: true,  is_active: true,  created_at: '2026-01-20T00:00:00Z' },
  { id: 'user-wholesale-001', email: 'wholesale@medshop.com',    full_name: 'ร้านขายยา เมดช็อป',       role_id: 'role-wholesale', role_name: 'wholesale', role_label: 'ขายส่ง',           is_email_verified: true,  is_active: true,  created_at: '2026-02-01T00:00:00Z' },
  { id: 'user-clinic-001',    email: 'clinic@bkkhospital.com',   full_name: 'คลินิกแพทย์สมใจ',         role_id: 'role-clinic',    role_name: 'clinic',    role_label: 'คลินิก/โรงพยาบาล', is_email_verified: true,  is_active: true,  created_at: '2026-02-10T00:00:00Z' },
  { id: 'user-retail-003',    email: 'inactive@example.com',     full_name: 'นาย ไม่ใช้งาน ทดสอบ',     role_id: 'role-retail',    role_name: 'retail',    role_label: 'ลูกค้าทั่วไป',     is_email_verified: false, is_active: false, created_at: '2026-03-01T00:00:00Z' },
]

// Mock Notifications
export const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 'notif-001', type: 'order_confirmed',       title: 'คำสั่งซื้อได้รับการยืนยัน',           message: 'คำสั่งซื้อ #ORD-2026-00002 ได้รับการยืนยันแล้ว',           link: '/orders/ORD-2026-00002', is_read: false, created_at: '2026-04-13T14:00:00Z' },
  { id: 'notif-002', type: 'prescription_approved', title: 'ใบสั่งแพทย์ได้รับการอนุมัติ',         message: 'ใบสั่งแพทย์ของคุณได้รับการอนุมัติแล้ว',                   link: '/orders/ORD-2026-00002', is_read: false, created_at: '2026-04-13T13:30:00Z' },
  { id: 'notif-003', type: 'order_shipped',          title: 'คำสั่งซื้อจัดส่งแล้ว',               message: 'คำสั่งซื้อ #ORD-2026-00003 จัดส่งแล้ว โดย Kerry Express', link: '/orders/ORD-2026-00003', is_read: true,  created_at: '2026-04-13T08:00:00Z' },
  { id: 'notif-004', type: 'order_completed',        title: 'คำสั่งซื้อสำเร็จ',                   message: 'คำสั่งซื้อ #ORD-2026-00004 สำเร็จเรียบร้อยแล้ว',          link: '/orders/ORD-2026-00004', is_read: true,  created_at: '2026-04-04T14:00:00Z' },
  { id: 'notif-005', type: 'order_cancelled',        title: 'คำสั่งซื้อถูกยกเลิก',               message: 'คำสั่งซื้อ #ORD-2026-00005 ถูกยกเลิกแล้ว',               link: '/orders/ORD-2026-00005', is_read: true,  created_at: '2026-04-10T15:00:00Z' },
]

// Mock Admin Notifications
export const MOCK_ADMIN_NOTIFICATIONS: Notification[] = [
  { id: 'an-001', type: 'new_order',             title: 'คำสั่งซื้อใหม่',                  message: 'มีคำสั่งซื้อใหม่ #ORD-2026-00001',                         link: '/admin/orders/ORD-2026-00001', is_read: false, created_at: '2026-04-14T10:00:00Z' },
  { id: 'an-002', type: 'prescription_pending',  title: 'ใบสั่งแพทย์รอรีวิว',             message: 'มีใบสั่งแพทย์รอรีวิว (order #ORD-2026-00001)',             link: '/admin/orders/ORD-2026-00001', is_read: false, created_at: '2026-04-14T10:05:00Z' },
  { id: 'an-003', type: 'low_stock',             title: 'สินค้าใกล้หมด',                   message: 'ลอราทาดีน 10 mg เหลือสต็อกต่ำกว่าจุดสั่งซื้อ',             link: '/admin/inventory',            is_read: false, created_at: '2026-04-14T08:00:00Z' },
  { id: 'an-004', type: 'expiry_alert',          title: 'ยาใกล้หมดอายุ',                   message: 'แอสไพริน 81 mg lot B2025-03 จะหมดอายุใน 60 วัน',           link: '/admin/inventory',            is_read: true,  created_at: '2026-04-13T06:00:00Z' },
]

// Mock Audit Logs
export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'al-001', admin_email: 'admin@pharma.com', action: 'UPDATE_PRICE_OVERRIDE', target_type: 'product_prices', target_id: 'prod-001', role_affected: 'wholesale', old_value: { override_price: 20 }, new_value: { override_price: 18 }, changed_at: '2026-04-14T09:00:00Z' },
  { id: 'al-002', admin_email: 'admin@pharma.com', action: 'UPDATE_USER_ROLE',      target_type: 'users',          target_id: 'user-retail-002', role_affected: '',  old_value: { role: 'retail' }, new_value: { role: 'clinic' }, changed_at: '2026-04-13T15:00:00Z' },
  { id: 'al-003', admin_email: 'admin@pharma.com', action: 'CREATE_PRODUCT',        target_type: 'products',       target_id: 'prod-012', role_affected: '',         old_value: {},                 new_value: { name: 'แอสไพริน 81 mg', sku: 'ASP-81-012' }, changed_at: '2026-04-12T10:00:00Z' },
  { id: 'al-004', admin_email: 'admin@pharma.com', action: 'ORDER_STATUS_CHANGED',  target_type: 'orders',         target_id: 'ORD-2026-00002', role_affected: '',   old_value: { status: 'pending' }, new_value: { status: 'confirmed' }, changed_at: '2026-04-13T14:00:00Z' },
  { id: 'al-005', admin_email: 'admin@pharma.com', action: 'PRESCRIPTION_REVIEWED', target_type: 'prescriptions',  target_id: 'ORD-2026-00002', role_affected: '',   old_value: { status: 'pending' }, new_value: { status: 'approved' }, changed_at: '2026-04-13T13:30:00Z' },
  { id: 'al-006', admin_email: 'admin@pharma.com', action: 'UPDATE_GLOBAL_RULE',    target_type: 'pricing_rules',  target_id: 'role-wholesale', role_affected: 'wholesale', old_value: { discount_type: 'percentage', discount_value: 25 }, new_value: { discount_type: 'percentage', discount_value: 28 }, changed_at: '2026-04-10T11:00:00Z' },
]
