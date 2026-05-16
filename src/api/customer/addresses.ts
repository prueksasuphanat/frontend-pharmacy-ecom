import { apiClient } from "@/api/client";

export interface Address {
  id: number;
  user_id: number;
  label: string | null;
  recipient: string;
  phone: string;
  address: string;
  district: string | null;
  province: string;
  postal_code: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AddressBody {
  label?: string;
  recipient: string;
  phone: string;
  address: string;
  district?: string;
  province: string;
  postal_code: string;
  is_default?: boolean;
}

export const addressesApi = {
  // ดึงที่อยู่ทั้งหมด
  getAddresses: async () => {
    const res = await apiClient.get<{ success: boolean; data: Address[] }>("/customer/profile/addresses");
    return res.data;
  },

  // เพิ่มที่อยู่ใหม่
  createAddress: async (data: AddressBody) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: Address }>("/customer/profile/addresses", data);
    return res.data;
  },

  // อัปเดตที่อยู่
  updateAddress: async (id: number, data: AddressBody) => {
    const res = await apiClient.put<{ success: boolean; message: string; data: Address }>(`/customer/profile/addresses/${id}`, data);
    return res.data;
  },

  // ลบที่อยู่
  deleteAddress: async (id: number) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/customer/profile/addresses/${id}`);
    return res.data;
  },

  // ตั้งเป็นที่อยู่หลัก
  setAsDefault: async (id: number) => {
    const res = await apiClient.patch<{ success: boolean; message: string }>(`/customer/profile/addresses/${id}/default`);
    return res.data;
  },
};
