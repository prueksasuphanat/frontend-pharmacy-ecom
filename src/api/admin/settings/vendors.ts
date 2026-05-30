import { apiClient } from "../../client";
import type {
  Vendor,
  VendorListParams,
  VendorListResponse,
} from "@/types";

export async function getVendors(
  params: VendorListParams = {},
): Promise<VendorListResponse> {
  const { page = 1, limit = 10, search = null, is_active } = params;

  const response = await apiClient.get<VendorListResponse>(
    "/admin/vendors",
    {
      params: {
        page,
        limit,
        search,
        ...(is_active !== undefined && { is_active }),
      },
    },
  );

  return response.data;
}

export async function getVendorById(id: number): Promise<Vendor> {
  const response = await apiClient.get<{
    success: boolean;
    data: Vendor;
  }>(`/admin/vendors/${id}`);
  return response.data.data;
}

export async function createVendor(data: {
  name: string;
  seller_code?: string;
  address?: string;
  phone?: string;
}): Promise<Vendor> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Vendor;
  }>("/admin/vendors", data);
  return response.data.data;
}

export async function updateVendor(
  id: number,
  data: {
    name: string;
    seller_code?: string;
    address?: string;
    phone?: string;
    is_active: boolean;
  },
): Promise<Vendor> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Vendor;
  }>(`/admin/vendors/${id}`, data);
  return response.data.data;
}

export async function toggleVendorActive(id: number): Promise<Vendor> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Vendor;
  }>(`/admin/vendors/toggle-active/${id}`);
  return response.data.data;
}

export async function deleteVendor(id: number): Promise<void> {
  await apiClient.delete(`/admin/vendors/${id}`);
}

export const vendorsApi = {
  getVendors,
  getVendorById,
  createVendor,
  updateVendor,
  toggleVendorActive,
  deleteVendor,
};
