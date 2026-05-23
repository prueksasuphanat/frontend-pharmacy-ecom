import { apiClient } from "@/api/client";
import type { Address, AddressBody } from "@/types";

export const addressesApi = {
  getAddresses: async () => {
    const res = await apiClient.get<{ success: boolean; data: Address[] }>(
      "/customer/profile/addresses",
    );
    return res.data;
  },

  createAddress: async (data: AddressBody) => {
    const res = await apiClient.post<{
      success: boolean;
      message: string;
      data: Address;
    }>("/customer/profile/addresses", data);
    return res.data;
  },

  updateAddress: async (id: number, data: AddressBody) => {
    const res = await apiClient.put<{
      success: boolean;
      message: string;
      data: Address;
    }>(`/customer/profile/addresses/${id}`, data);
    return res.data;
  },

  deleteAddress: async (id: number) => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(
      `/customer/profile/addresses/${id}`,
    );
    return res.data;
  },

  setAsDefault: async (id: number) => {
    const res = await apiClient.patch<{ success: boolean; message: string }>(
      `/customer/profile/addresses/${id}/default`,
    );
    return res.data;
  },
};
