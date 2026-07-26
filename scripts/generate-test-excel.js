import XLSX from "xlsx";
import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "public/download");
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// 20 test items matching actual database product codes and user codes
const testRows = [
  { product_code: "P-1", product_name: "BLACKMORES LUTEIN-VIS 60'S", user_code: "C-24-1", user_name: "จิรธนัฐ เดชบริบูรณ์", price: 25.00 },
  { product_code: "P-2", product_name: "ยาถ่าย123 10'S.", user_code: "C-24-1", user_name: "จิรธนัฐ เดชบริบูรณ์", price: 35.00 },
  { product_code: "P-3", product_name: "3M NEXCARE COLD HOT MINI", user_code: "C-24-1", user_name: "จิรธนัฐ เดชบริบูรณ์", price: 48.00 },
  { product_code: "P-4", product_name: "3M NEXCARE COLD HOT PACK (10x25CM.)", user_code: "C-24-2", user_name: "ณิชานันท์ ยะปาน", price: 60.00 },
  { product_code: "P-5", product_name: "ENAF-150 3ML", user_code: "C-24-2", user_name: "ณิชานันท์ ยะปาน", price: 75.00 },
  { product_code: "P-6", product_name: "MICROPORE 1/2นิ้วx10หลา (น้ำตาล)", user_code: "C-24-2", user_name: "ณิชานันท์ ยะปาน", price: 85.00 },
  { product_code: "P-7", product_name: "SALMOL SYRUP 60ML.", user_code: "C-24-3", user_name: "ภัทรพล ไชยยงค์", price: 95.00 },
  { product_code: "P-8", product_name: "3M NEXCARE MICROPORE 1/2นิ้วx5.5หลา", user_code: "C-24-3", user_name: "ภัทรพล ไชยยงค์", price: 110.00 },
  { product_code: "P-9", product_name: "3M NEXCARE MICROPORE 1นิ้วx5.5หลา", user_code: "C-24-3", user_name: "ภัทรพล ไชยยงค์", price: 120.00 },
  { product_code: "P-10", product_name: "ขั้นบันได ที่พักเท้า (AB0920)", user_code: "C-24-4", user_name: "หมอพีท นิพิฐพนธ์ บุญต่อ", price: 135.00 },
  { product_code: "P-11", product_name: "3M NEXCARE พลาสเตอร์ปิดตา", user_code: "C-24-4", user_name: "หมอพีท นิพิฐพนธ์ บุญต่อ", price: 150.00 },
  { product_code: "P-12", product_name: "3M NEXCARE SOFT CLOTH", user_code: "C-24-4", user_name: "หมอพีท นิพิฐพนธ์ บุญต่อ", price: 165.00 },
  { product_code: "P-13", product_name: "STERI-STRIP 3M 0.5x4นิ้ว", user_code: "00000", user_name: "ศุภณัฐ ปัญญาคม", price: 180.00 },
  { product_code: "P-14", product_name: "3M NEXCARE TRANSPORE 1/2นิ้วx5หลา", user_code: "00000", user_name: "ศุภณัฐ ปัญญาคม", price: 195.00 },
  { product_code: "P-15", product_name: "3M NEXCARE TRANSPORE 1นิ้วx5หลา", user_code: "00000", user_name: "ศุภณัฐ ปัญญาคม", price: 210.00 },
  
  // 3 Low cost items (price < cost_price)
  { product_code: "P-16", product_name: "TACINOL LOTION 60ML.", user_code: "C-24-1", user_name: "จิรธนัฐ เดชบริบูรณ์", price: 10.00 },
  { product_code: "P-17", product_name: "3M NEXCARE แผ่นซับสิว", user_code: "C-24-2", user_name: "ณิชานันท์ ยะปาน", price: 15.00 },
  { product_code: "P-18", product_name: "PRED-OPH E/D.4ML.", user_code: "C-24-3", user_name: "ภัทรพล ไชยยงค์", price: 20.00 },

  // 2 Error items (unmatched product / user)
  { product_code: "P-9999", product_name: "สินค้าทดสอบกรณีไม่พบรหัส", user_code: "C-24-1", user_name: "จิรธนัฐ เดชบริบูรณ์", price: 100.00 },
  { product_code: "P-19", product_name: "3M NEXCARE พลาสเตอร์ผ้า 10ชิ้น", user_code: "C-99999", user_name: "ลูกค้าทดสอบไม่มีในระบบ", price: 150.00 }
];

const worksheet = XLSX.utils.json_to_sheet(testRows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "ราคาเสนอขาย");

XLSX.writeFile(workbook, path.join(dir, "ราคาเสนอขาย_รวม.xlsx"));
XLSX.writeFile(workbook, path.join(dir, "test_price_import_20.xlsx"));
console.log("Successfully generated test excel files with 20 rows!");
