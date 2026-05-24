import type {
  CreateProductUnitPayload,
  ProductUnit,
  ProductUnitListResponse,
  Unit,
  UnitListParams,
  UnitListResponse,
  UpdateProductUnitPayload,
} from "@/types";
import { apiClient } from "../../client";

export async function getUnits(
  params: UnitListParams = {},
): Promise<UnitListResponse> {
  const { page = 1, limit = 10, search = null, is_active } = params;
  const response = await apiClient.get<UnitListResponse>("/admin/units", {
    params: {
      page,
      limit,
      ...(search && { search }),
      ...(is_active !== undefined && { is_active }),
    },
  });
  return response.data;
}

export async function getUnitById(id: number): Promise<Unit> {
  const response = await apiClient.get<{ success: boolean; data: Unit }>(
    `/admin/units/${id}`,
  );
  return response.data.data;
}

export async function createUnit(data: {
  name: string;
  pmc_unit_id?: number;
}): Promise<Unit> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: Unit;
  }>("/admin/units", data);
  return response.data.data;
}

export async function updateUnit(
  id: number,
  data: { name?: string; is_active?: boolean },
): Promise<Unit> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Unit;
  }>(`/admin/units/${id}`, data);
  return response.data.data;
}

export async function toggleUnitActive(id: number): Promise<Unit> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: Unit;
  }>(`/admin/units/toggle-active/${id}`);
  return response.data.data;
}

export async function deleteUnit(id: number): Promise<void> {
  await apiClient.delete(`/admin/units/${id}`);
}

export async function getProductUnits(
  productId: number,
): Promise<ProductUnitListResponse> {
  const response = await apiClient.get<ProductUnitListResponse>(
    `/admin/products/${productId}/units`,
  );
  return response.data;
}

export async function createProductUnit(
  productId: number,
  data: CreateProductUnitPayload,
): Promise<ProductUnit> {
  const response = await apiClient.post<{
    success: boolean;
    message: string;
    data: ProductUnit;
  }>(`/admin/products/${productId}/units`, data);
  return response.data.data;
}

export async function updateProductUnit(
  productId: number,
  unitId: number,
  data: UpdateProductUnitPayload,
): Promise<ProductUnit> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data: ProductUnit;
  }>(`/admin/products/${productId}/units/${unitId}`, data);
  return response.data.data;
}

export async function deleteProductUnit(
  productId: number,
  unitId: number,
): Promise<void> {
  await apiClient.delete(`/admin/products/${productId}/units/${unitId}`);
}

export const unitsApi = {
  getUnits,
  getUnitById,
  createUnit,
  updateUnit,
  toggleUnitActive,
  deleteUnit,
  getProductUnits,
  createProductUnit,
  updateProductUnit,
  deleteProductUnit,
};
