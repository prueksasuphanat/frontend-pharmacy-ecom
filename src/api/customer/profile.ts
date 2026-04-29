import { API_ENDPOINTS } from "@/constants";
import type { User } from "@/types";
import { apiClient } from "../client";

export interface UpdateProfileData {
  username?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  birthdate?: string | null;
  address?: string | null;
  avatar?: File | null;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: User & { profile_image: { url: string } | null };
}

export const customerProfileApi = {
  /**
   * PATCH /api/v1/customer/profile
   * อัปเดตข้อมูลส่วนตัว + รูปโปรไฟล์ (multipart/form-data)
   */
  updateProfile: (data: UpdateProfileData) => {
    const formData = new FormData();

    if (data.username !== undefined) formData.append("username", data.username);
    if (data.first_name !== undefined)
      formData.append("first_name", data.first_name);
    if (data.last_name !== undefined)
      formData.append("last_name", data.last_name);
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.birthdate !== undefined)
      formData.append("birthdate", data.birthdate ?? "");
    if (data.address !== undefined)
      formData.append("address", data.address ?? "");
    if (data.avatar) formData.append("avatar", data.avatar);

    return apiClient.patch<UpdateProfileResponse>(
      API_ENDPOINTS.CUSTOMER.PROFILE,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
  },
};
