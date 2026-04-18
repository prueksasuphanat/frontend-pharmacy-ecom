// ============================================================
// MOCK DATA — products.ts (30 products)
// TODO: Replace all exports with real API calls
// ============================================================

export type DrugType = 'otc' | 'prescription' | 'controlled' | 'supplement' | 'cosmetic'

export interface Product {
  id: string
  name: string
  generic_name: string
  brand_name: string
  description: string
  image_url: string
  sku: string
  stock: number
  base_price: number
  unit: string
  dosage_form: string
  strength: string
  registration_no: string
  manufacturer: string
  reorder_level: number
  drug_type: DrugType
  drug_type_label: string
  is_deleted: boolean
  created_at: string
}

export interface PriceByRole {
  retail: number
  wholesale: number
  clinic: number
}

// Generate 30 products
const productTemplates = [
  { name: 'พาราเซตามอล 500 mg', generic: 'Paracetamol', brand: 'Sara', type: 'otc', price: 25, color: 'e0f7f4/0d9488' },
  { name: 'อะม็อกซีซิลลิน 500 mg', generic: 'Amoxicillin', brand: 'Amoxil', type: 'prescription', price: 120, color: 'fef3c7/d97706' },
  { name: 'วิตามิน C 1000 mg', generic: 'Ascorbic Acid', brand: 'Celin', type: 'supplement', price: 180, color: 'fce7f3/db2777' },
  { name: 'ไอบูโพรเฟน 400 mg', generic: 'Ibuprofen', brand: 'Brufen', type: 'otc', price: 45, color: 'dbeafe/1d4ed8' },
  { name: 'มอร์ฟีน ซัลเฟต 10 mg', generic: 'Morphine Sulfate', brand: 'Morphine BP', type: 'controlled', price: 350, color: 'fee2e2/dc2626' },
  { name: 'ครีมซันสกรีน SPF50+', generic: 'Sunscreen Cream', brand: 'Eucerin', type: 'cosmetic', price: 420, color: 'f3e8ff/7c3aed' },
  { name: 'ลอราทาดีน 10 mg', generic: 'Loratadine', brand: 'Clarityn', type: 'otc', price: 85, color: 'ecfdf5/059669' },
  { name: 'โอเมพราโซล 20 mg', generic: 'Omeprazole', brand: 'Losec', type: 'prescription', price: 210, color: 'fff7ed/ea580c' },
  { name: 'เมทฟอร์มิน 500 mg', generic: 'Metformin HCl', brand: 'Glucophage', type: 'prescription', price: 95, color: 'e0f2fe/0284c7' },
  { name: 'โอเมก้า-3 1000 mg', generic: 'Fish Oil', brand: 'Nature Made', type: 'supplement', price: 290, color: 'f0fdf4/16a34a' },
  { name: 'โลชั่นบำรุงผิว', generic: 'Moisturizing Lotion', brand: 'Cetaphil', type: 'cosmetic', price: 380, color: 'fdf4ff/a21caf' },
  { name: 'แอสไพริน 81 mg', generic: 'Aspirin', brand: 'Aspirin Protect', type: 'otc', price: 65, color: 'fff1f2/e11d48' },
  { name: 'ซีทิริซีน 10 mg', generic: 'Cetirizine', brand: 'Zyrtec', type: 'otc', price: 78, color: 'fef9c3/ca8a04' },
  { name: 'แคลเซียม + วิตามินดี', generic: 'Calcium + Vitamin D3', brand: 'Calcimex', type: 'supplement', price: 195, color: 'e0e7ff/4338ca' },
  { name: 'ยาหยอดตา Refresh', generic: 'Artificial Tears', brand: 'Systane', type: 'otc', price: 145, color: 'dbeafe/2563eb' },
  { name: 'ยาแก้ไอน้ำเชื่อม', generic: 'Guaifenesin Syrup', brand: 'Mucosolvan', type: 'otc', price: 125, color: 'fce7f3/be185d' },
  { name: 'ครีมทาแผล', generic: 'Povidone Iodine', brand: 'Betadine', type: 'otc', price: 89, color: 'fed7aa/ea580c' },
  { name: 'วิตามินบีรวม', generic: 'B-Complex', brand: 'Neurobion', type: 'supplement', price: 165, color: 'dcfce7/16a34a' },
  { name: 'ยาอมแก้เจ็บคอ', generic: 'Benzocaine Lozenges', brand: 'Strepsils', type: 'otc', price: 55, color: 'fef3c7/f59e0b' },
  { name: 'ยาทาปวดเมื่อย', generic: 'Diclofenac Gel', brand: 'Voltaren', type: 'otc', price: 235, color: 'e0f2fe/0369a1' },
  { name: 'ซิโปรฟล็อกซาซิน 500 mg', generic: 'Ciprofloxacin', brand: 'Ciprobay', type: 'prescription', price: 180, color: 'fef3c7/d97706' },
  { name: 'โคเอนไซม์ คิวเท็น', generic: 'Coenzyme Q10', brand: 'Blackmores', type: 'supplement', price: 450, color: 'fce7f3/db2777' },
  { name: 'ยาพ่นจมูก', generic: 'Nasal Spray', brand: 'Otrivin', type: 'otc', price: 95, color: 'dbeafe/1d4ed8' },
  { name: 'ครีมทาผิวหน้า', generic: 'Facial Cream', brand: 'La Roche-Posay', type: 'cosmetic', price: 520, color: 'f3e8ff/7c3aed' },
  { name: 'ยาลดความดัน', generic: 'Amlodipine', brand: 'Norvasc', type: 'prescription', price: 150, color: 'fff7ed/ea580c' },
  { name: 'โปรไบโอติก', generic: 'Probiotics', brand: 'Culturelle', type: 'supplement', price: 380, color: 'f0fdf4/16a34a' },
  { name: 'ยาแก้ท้องเสีย', generic: 'Loperamide', brand: 'Imodium', type: 'otc', price: 75, color: 'ecfdf5/059669' },
  { name: 'เซรั่มบำรุงผิว', generic: 'Vitamin C Serum', brand: 'Vichy', type: 'cosmetic', price: 680, color: 'fdf4ff/a21caf' },
  { name: 'ยาลดกรดไหลย้อน', generic: 'Esomeprazole', brand: 'Nexium', type: 'prescription', price: 240, color: 'e0f2fe/0284c7' },
  { name: 'คอลลาเจน', generic: 'Collagen Peptides', brand: 'Neocell', type: 'supplement', price: 590, color: 'fff1f2/e11d48' },
]

export const MOCK_PRODUCTS: Product[] = productTemplates.map((t, i) => {
  const num = String(i + 1).padStart(3, '0')
  const stocks = [500, 200, 300, 8, 50, 150, 0, 120, 80, 200, 75, 15, 95, 140, 60, 85, 110, 175, 130, 90, 180, 220, 70, 160, 100, 250, 65, 190, 145, 210]
  return {
    id: `prod-${num}`,
    name: t.name,
    generic_name: t.generic,
    brand_name: t.brand,
    description: `ยาและผลิตภัณฑ์เพื่อสุขภาพคุณภาพสูง ${t.name}`,
    image_url: `https://placehold.co/400x400/${t.color}?text=${encodeURIComponent(t.generic)}`,
    sku: `SKU-${num}`,
    stock: stocks[i],
    base_price: t.price,
    unit: 'กล่อง',
    dosage_form: 'เม็ด',
    strength: '500 mg',
    registration_no: `1A ${i + 1}/52`,
    manufacturer: 'Pharmaceutical Co., Ltd.',
    reorder_level: 20,
    drug_type: t.type as DrugType,
    drug_type_label: t.type === 'otc' ? 'ยาสามัญประจำบ้าน' : 
                     t.type === 'prescription' ? 'ยาต้องใช้ใบสั่งแพทย์' :
                     t.type === 'controlled' ? 'ยาควบคุมพิเศษ' :
                     t.type === 'supplement' ? 'ผลิตภัณฑ์เสริมอาหาร' : 'เวชสำอาง',
    is_deleted: false,
    created_at: `2026-01-${String(10 + i).padStart(2, '0')}T08:00:00Z`,
  }
})

// Mock pricing by role
export const MOCK_PRICES: Record<string, Record<string, number>> = {}
MOCK_PRODUCTS.forEach(p => {
  MOCK_PRICES[p.id] = {
    retail: p.base_price,
    wholesale: Math.round(p.base_price * 0.72),
    clinic: Math.round(p.base_price * 0.85),
  }
})
