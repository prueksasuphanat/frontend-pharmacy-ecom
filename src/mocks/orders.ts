// ============================================================
// MOCK DATA — orders.ts
// TODO: Replace with real API calls
// ============================================================

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled'
export type PrescriptionStatus = 'not_required' | 'pending' | 'approved' | 'rejected'

export interface OrderItem {
  id: string
  product_id: string
  product_name: string
  product_image: string
  sku: string
  quantity: number
  unit_price: number
  role_id: string
}

export interface Order {
  id: string
  user_id: string
  user_email: string
  status: OrderStatus
  prescription_status: PrescriptionStatus
  shipping_address: {
    recipient: string
    phone: string
    address: string
    district: string
    province: string
    postal_code: string
  }
  shipping_fee: number
  total_amount: number
  note: string
  cancelled_reason: string
  items: OrderItem[]
  status_logs: { from: string; to: string; changed_at: string; note: string }[]
  created_at: string
  updated_at: string
}

export const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2026-00001',
    user_id: 'user-retail-001',
    user_email: 'somchai@example.com',
    status: 'pending',
    prescription_status: 'pending',
    shipping_address: {
      recipient: 'นาย สมชาย ใจดี',
      phone: '081-234-5678',
      address: '123/45 ถ.พหลโยธิน',
      district: 'จตุจักร',
      province: 'กรุงเทพมหานคร',
      postal_code: '10900',
    },
    shipping_fee: 50,
    total_amount: 420,
    note: '',
    cancelled_reason: '',
    items: [
      { id: 'oi-001', product_id: 'prod-002', product_name: 'อะม็อกซีซิลลิน 500 mg', product_image: 'https://placehold.co/80x80/fef3c7/d97706?text=Amox', sku: 'AMOX-500-002', quantity: 3, unit_price: 120, role_id: 'retail' },
      { id: 'oi-002', product_id: 'prod-001', product_name: 'พาราเซตามอล 500 mg', product_image: 'https://placehold.co/80x80/e0f7f4/0d9488?text=Para', sku: 'PARA-500-001', quantity: 2, unit_price: 25, role_id: 'retail' },
    ],
    status_logs: [
      { from: '', to: 'pending', changed_at: '2026-04-14T10:00:00Z', note: 'สร้างคำสั่งซื้อ' },
    ],
    created_at: '2026-04-14T10:00:00Z',
    updated_at: '2026-04-14T10:00:00Z',
  },
  {
    id: 'ORD-2026-00002',
    user_id: 'user-clinic-001',
    user_email: 'clinic@bkkhospital.com',
    status: 'confirmed',
    prescription_status: 'approved',
    shipping_address: {
      recipient: 'คลินิกแพทย์สมใจ',
      phone: '02-345-6789',
      address: '456 ถ.สีลม',
      district: 'บางรัก',
      province: 'กรุงเทพมหานคร',
      postal_code: '10500',
    },
    shipping_fee: 0,
    total_amount: 3500,
    note: 'ต้องการรับก่อนเที่ยง',
    cancelled_reason: '',
    items: [
      { id: 'oi-003', product_id: 'prod-009', product_name: 'เมทฟอร์มิน 500 mg', product_image: 'https://placehold.co/80x80/e0f2fe/0284c7?text=Met', sku: 'MET-500-009', quantity: 20, unit_price: 80, role_id: 'clinic' },
      { id: 'oi-004', product_id: 'prod-008', product_name: 'โอเมพราโซล 20 mg', product_image: 'https://placehold.co/80x80/fff7ed/ea580c?text=Ome', sku: 'OME-20-008', quantity: 10, unit_price: 175, role_id: 'clinic' },
    ],
    status_logs: [
      { from: '', to: 'pending', changed_at: '2026-04-13T09:00:00Z', note: 'สร้างคำสั่งซื้อ' },
      { from: 'pending', to: 'confirmed', changed_at: '2026-04-13T14:00:00Z', note: 'ยืนยันคำสั่งซื้อแล้ว' },
    ],
    created_at: '2026-04-13T09:00:00Z',
    updated_at: '2026-04-13T14:00:00Z',
  },
  {
    id: 'ORD-2026-00003',
    user_id: 'user-wholesale-001',
    user_email: 'wholesale@medshop.com',
    status: 'shipped',
    prescription_status: 'not_required',
    shipping_address: {
      recipient: 'ร้านขายยา เมดช็อป',
      phone: '02-456-7890',
      address: '789 ถ.รัชดาภิเษก',
      district: 'ห้วยขวาง',
      province: 'กรุงเทพมหานคร',
      postal_code: '10310',
    },
    shipping_fee: 0,
    total_amount: 12400,
    note: '',
    cancelled_reason: '',
    items: [
      { id: 'oi-005', product_id: 'prod-001', product_name: 'พาราเซตามอล 500 mg', product_image: 'https://placehold.co/80x80/e0f7f4/0d9488?text=Para', sku: 'PARA-500-001', quantity: 200, unit_price: 18, role_id: 'wholesale' },
      { id: 'oi-006', product_id: 'prod-003', product_name: 'วิตามิน C 1000 mg', product_image: 'https://placehold.co/80x80/fce7f3/db2777?text=VitC', sku: 'VITC-1000-003', quantity: 30, unit_price: 130, role_id: 'wholesale' },
    ],
    status_logs: [
      { from: '', to: 'pending', changed_at: '2026-04-12T08:00:00Z', note: 'สร้างคำสั่งซื้อ' },
      { from: 'pending', to: 'confirmed', changed_at: '2026-04-12T10:00:00Z', note: 'ยืนยัน' },
      { from: 'confirmed', to: 'shipped', changed_at: '2026-04-13T08:00:00Z', note: 'จัดส่งโดย Kerry Express' },
    ],
    created_at: '2026-04-12T08:00:00Z',
    updated_at: '2026-04-13T08:00:00Z',
  },
  {
    id: 'ORD-2026-00004',
    user_id: 'user-retail-001',
    user_email: 'somchai@example.com',
    status: 'completed',
    prescription_status: 'not_required',
    shipping_address: {
      recipient: 'นาย สมชาย ใจดี',
      phone: '081-234-5678',
      address: '123/45 ถ.พหลโยธิน',
      district: 'จตุจักร',
      province: 'กรุงเทพมหานคร',
      postal_code: '10900',
    },
    shipping_fee: 50,
    total_amount: 555,
    note: '',
    cancelled_reason: '',
    items: [
      { id: 'oi-007', product_id: 'prod-006', product_name: 'ครีมซันสกรีน SPF50+', product_image: 'https://placehold.co/80x80/f3e8ff/7c3aed?text=Sun', sku: 'SUN-50-006', quantity: 1, unit_price: 420, role_id: 'retail' },
      { id: 'oi-008', product_id: 'prod-001', product_name: 'พาราเซตามอล 500 mg', product_image: 'https://placehold.co/80x80/e0f7f4/0d9488?text=Para', sku: 'PARA-500-001', quantity: 3, unit_price: 25, role_id: 'retail' },
    ],
    status_logs: [
      { from: '', to: 'pending', changed_at: '2026-04-01T10:00:00Z', note: 'สร้างคำสั่งซื้อ' },
      { from: 'pending', to: 'confirmed', changed_at: '2026-04-01T12:00:00Z', note: '' },
      { from: 'confirmed', to: 'shipped', changed_at: '2026-04-02T09:00:00Z', note: '' },
      { from: 'shipped', to: 'completed', changed_at: '2026-04-04T14:00:00Z', note: 'ลูกค้ายืนยันรับสินค้า' },
    ],
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-04T14:00:00Z',
  },
  {
    id: 'ORD-2026-00005',
    user_id: 'user-retail-002',
    user_email: 'malee@example.com',
    status: 'cancelled',
    prescription_status: 'not_required',
    shipping_address: {
      recipient: 'นาง มาลี สดใส',
      phone: '091-234-5678',
      address: '99 หมู่ 5',
      district: 'บางกอกน้อย',
      province: 'กรุงเทพมหานคร',
      postal_code: '10700',
    },
    shipping_fee: 50,
    total_amount: 230,
    note: '',
    cancelled_reason: 'เปลี่ยนใจ ขอยกเลิก',
    items: [
      { id: 'oi-009', product_id: 'prod-010', product_name: 'โอเมก้า-3 1000 mg', product_image: 'https://placehold.co/80x80/f0fdf4/16a34a?text=Omg', sku: 'OMG-1000-010', quantity: 1, unit_price: 290, role_id: 'retail' },
    ],
    status_logs: [
      { from: '', to: 'pending', changed_at: '2026-04-10T11:00:00Z', note: 'สร้างคำสั่งซื้อ' },
      { from: 'pending', to: 'cancelled', changed_at: '2026-04-10T15:00:00Z', note: 'เปลี่ยนใจ ขอยกเลิก' },
    ],
    created_at: '2026-04-10T11:00:00Z',
    updated_at: '2026-04-10T15:00:00Z',
  },
]
