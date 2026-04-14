// ============================================================
// MOCK DATA — inventory.ts
// TODO: Replace with real API calls
// ============================================================

export interface ProductLot {
  id: string
  product_id: string
  product_name: string
  product_sku: string
  lot_number: string
  quantity: number
  expiry_date: string
  cost_price: number
  received_at: string
}

export const MOCK_LOTS: ProductLot[] = [
  { id: 'lot-001', product_id: 'prod-001', product_name: 'พาราเซตามอล 500 mg',  product_sku: 'PARA-500-001', lot_number: 'A2025-01', quantity: 300, expiry_date: '2027-06-30', cost_price: 15,  received_at: '2026-01-10T08:00:00Z' },
  { id: 'lot-002', product_id: 'prod-001', product_name: 'พาราเซตามอล 500 mg',  product_sku: 'PARA-500-001', lot_number: 'A2025-02', quantity: 200, expiry_date: '2027-12-31', cost_price: 14,  received_at: '2026-03-01T08:00:00Z' },
  { id: 'lot-003', product_id: 'prod-002', product_name: 'อะม็อกซีซิลลิน 500 mg', product_sku: 'AMOX-500-002', lot_number: 'B2025-01', quantity: 200, expiry_date: '2026-08-31', cost_price: 80,  received_at: '2026-01-12T08:00:00Z' },
  { id: 'lot-004', product_id: 'prod-004', product_name: 'ไอบูโพรเฟน 400 mg',   product_sku: 'IBU-400-004',  lot_number: 'C2025-01', quantity: 8,   expiry_date: '2028-03-31', cost_price: 28,  received_at: '2026-01-18T08:00:00Z' },
  { id: 'lot-005', product_id: 'prod-005', product_name: 'มอร์ฟีน ซัลเฟต 10 mg', product_sku: 'MOR-10-005',  lot_number: 'D2025-01', quantity: 50,  expiry_date: '2026-05-31', cost_price: 220, received_at: '2026-01-20T08:00:00Z' },
  { id: 'lot-006', product_id: 'prod-007', product_name: 'ลอราทาดีน 10 mg',     product_sku: 'LOR-10-007',   lot_number: 'E2025-01', quantity: 0,   expiry_date: '2027-09-30', cost_price: 55,  received_at: '2026-01-25T08:00:00Z' },
  { id: 'lot-007', product_id: 'prod-012', product_name: 'แอสไพริน 81 mg',       product_sku: 'ASP-81-012',   lot_number: 'B2025-03', quantity: 15,  expiry_date: '2026-06-15', cost_price: 42,  received_at: '2026-02-12T08:00:00Z' },
  { id: 'lot-008', product_id: 'prod-008', product_name: 'โอเมพราโซล 20 mg',    product_sku: 'OME-20-008',   lot_number: 'F2025-01', quantity: 120, expiry_date: '2028-01-31', cost_price: 140, received_at: '2026-01-28T08:00:00Z' },
  { id: 'lot-009', product_id: 'prod-009', product_name: 'เมทฟอร์มิน 500 mg',   product_sku: 'MET-500-009',  lot_number: 'G2025-01', quantity: 80,  expiry_date: '2027-11-30', cost_price: 60,  received_at: '2026-02-01T08:00:00Z' },
]

export const MOCK_PRICING_RULES = [
  { id: 'pr-001', role_id: 'role-wholesale', role_label: 'ขายส่ง',           discount_type: 'percentage', discount_value: 28 },
  { id: 'pr-002', role_id: 'role-clinic',    role_label: 'คลินิก/โรงพยาบาล', discount_type: 'percentage', discount_value: 20 },
  { id: 'pr-003', role_id: 'role-retail',    role_label: 'ลูกค้าทั่วไป',     discount_type: 'percentage', discount_value: 0  },
]
