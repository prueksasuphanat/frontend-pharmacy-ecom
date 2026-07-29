import { defineStore } from "pinia";
import { ref } from "vue";
import { apiClient } from "@/api/client";
import * as XLSX from "xlsx";
import { useToast } from "vue-toastification";

export interface CustomerOption {
  id: number;
  code?: string;
  name?: string;
  pmc_name?: string;
  pmc_customer_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export interface ProductOption {
  id: number;
  code?: string;
  name: string;
}

export interface UserPricingSummaryItem {
  id: number;
  code?: string;
  name?: string;
  pmc_name?: string;
  pmc_customer_id?: string;
  full_name: string;
  email?: string;
  phone?: string;
  is_active: boolean;
  special_prices_count: number;
  is_price_set: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPricingDetailItem {
  id: number | string;
  user_id: number;
  pmc_customer_id: string;
  customer_name: string;
  product_id: number;
  product_code: string;
  product_name: string;
  unit_name: string;
  default_price: number | string;
  special_price: number | string;
  price_diff: number | string;
  discount_percentage: number | string;
  is_custom_price: boolean;
  status_label: string;
  updated_at: string;
}

export const useUserPricingReportStore = defineStore("userPricingReport", () => {
  const toast = useToast();

  const isLoading = ref(false);
  const isExporting = ref(false);

  const customerOptions = ref<CustomerOption[]>([]);
  const selectedUserIds = ref<number[]>([]);

  const productOptions = ref<ProductOption[]>([]);
  const selectedProductIds = ref<number[]>([]);

  const statusFilter = ref<"ALL" | "SET" | "UNSET">("ALL"); // สถานะระดับ User
  const itemStatusFilter = ref<"ALL" | "SET" | "UNSET">("SET"); // สถานะระดับ สินค้า (SET = ตั้งราคาแล้ว, UNSET = ยังไม่ได้ตั้งราคา, ALL = ทั้งหมด)
  const searchQuery = ref("");

  const detailItems = ref<UserPricingDetailItem[]>([]);

  const pagination = ref({
    page: 1,
    limit: 20,
    totalItems: 0,
    totalPages: 1,
  });

  const stats = ref({
    totalCustomers: 0,
    totalUnset: 0,
    totalSet: 0,
  });

  /**
   * ดึงรายการตัวเลือกลูกค้าทั้งหมดสำหรับ Multi-select
   */
  async function fetchCustomerOptions() {
    try {
      const response = await apiClient.get("/admin/reports/user-pricing/options");
      if (response.data?.success) {
        customerOptions.value = response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch customer options", error);
    }
  }

  /**
   * ดึงรายการตัวเลือกสินค้าทั้งหมดสำหรับ Multi-select
   */
  async function fetchProductOptions() {
    try {
      const response = await apiClient.get("/admin/reports/user-pricing/products-options");
      if (response.data?.success) {
        productOptions.value = response.data.data;
      }
    } catch (error) {
      console.error("Failed to fetch product options", error);
    }
  }

  /**
   * ดึงข้อมูลหน้ารายงาน
   */
  async function fetchReport(page = 1) {
    isLoading.value = true;
    try {
      pagination.value.page = page;

      const params: Record<string, any> = {
        page: pagination.value.page,
        limit: pagination.value.limit,
        status: statusFilter.value,
        item_status: itemStatusFilter.value,
        search: searchQuery.value.trim(),
      };

      if (selectedUserIds.value.length > 0) {
        params.user_ids = selectedUserIds.value.join(",");
      }

      if (selectedProductIds.value.length > 0) {
        params.product_ids = selectedProductIds.value.join(",");
      }

      // ดึงรายการราคาสินค้าแจงรายละเอียด
      const response = await apiClient.get("/admin/reports/user-pricing/details", { params });
      if (response.data?.success) {
        detailItems.value = response.data.data;
        pagination.value = response.data.pagination;
      }

      // ดึง stat สรุปภาพรวม
      const statRes = await apiClient.get("/admin/reports/user-pricing", { params: { limit: 1, status: statusFilter.value, user_ids: params.user_ids } });
      if (statRes.data?.stats) {
        stats.value = statRes.data.stats;
      }
    } catch (error: any) {
      console.error("Failed to fetch user pricing report", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการดึงข้อมูลรายงาน");
    } finally {
      isLoading.value = false;
    }
  }

  /**
   * Export ข้อมูลเป็น Excel (.xlsx) โดยตั้ง Sheet "รายละเอียดราคาสินค้า" เป็น Sheet แรก!
   */
  async function exportExcel() {
    isExporting.value = true;
    try {
      const params: Record<string, any> = {
        status: statusFilter.value,
        item_status: itemStatusFilter.value,
        search: searchQuery.value.trim(),
      };

      if (selectedUserIds.value.length > 0) {
        params.user_ids = selectedUserIds.value.join(",");
      }

      if (selectedProductIds.value.length > 0) {
        params.product_ids = selectedProductIds.value.join(",");
      }

      const response = await apiClient.get("/admin/reports/user-pricing/export", { params });

      if (!response.data?.success) {
        throw new Error("เกิดข้อผิดพลาดในการเตรียมข้อมูล Export");
      }

      const { details } = response.data;

      const detailSheetData = details.map((row: any, idx: number) => ({
        "ลำดับ": idx + 1,
        "User ID": row.user_id,
        "รหัสลูกค้า (PMC)": row.pmc_customer_id,
        "ชื่อลูกค้า / ชื่อร้าน": row.customer_name,
        "รหัสสินค้า": row.product_code,
        "ชื่อสินค้า": row.product_name,
        "หน่วยขาย": row.unit_name,
        "ราคาที่ตั้งไว้ (บาท)": row.special_price,
        "สถานะรายการ": row.status_label || "-",
        "วันที่อัปเดตล่าสุด": row.updated_at && row.updated_at !== "-" ? new Date(row.updated_at).toLocaleString("th-TH") : "-",
      }));

      // Create workbook with XLSX
      const wb = XLSX.utils.book_new();

      const wsDetail = XLSX.utils.json_to_sheet(detailSheetData);
      XLSX.utils.book_append_sheet(wb, wsDetail, "รายงานราคาสินค้า");

      // Generate filename with date
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `รายงานราคาสินค้าสำหรับผู้ใช้งาน_${dateStr}.xlsx`);

      toast.success("ส่งออกไฟล์ Excel เรียบร้อยแล้ว");
    } catch (error: any) {
      console.error("Failed to export Excel", error);
      toast.error(error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งออกไฟล์ Excel");
    } finally {
      isExporting.value = false;
    }
  }

  function resetFilters() {
    selectedUserIds.value = [];
    selectedProductIds.value = [];
    statusFilter.value = "ALL";
    itemStatusFilter.value = "SET";
    searchQuery.value = "";
    fetchReport(1);
  }

  return {
    isLoading,
    isExporting,
    customerOptions,
    selectedUserIds,
    productOptions,
    selectedProductIds,
    statusFilter,
    itemStatusFilter,
    searchQuery,
    detailItems,
    pagination,
    stats,
    fetchCustomerOptions,
    fetchProductOptions,
    fetchReport,
    exportExcel,
    resetFilters,
  };
});
