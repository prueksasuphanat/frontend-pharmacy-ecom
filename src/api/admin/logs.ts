import { apiClient } from "../client";
import type {
  DefaultPriceLogListResponse,
  DefaultPriceLogByProductResponse,
  SpecialPriceLogListResponse,
  SpecialPriceLogByProductResponse,
  SpecialPriceLogByUserResponse,
  PricingLogParams,
} from "@/types";

export const pricingLogsApi = {
  getDefaultPriceLogs: (params: PricingLogParams = {}) => {
    const { page = 1, limit = 10, search, product_id, changed_at } = params;
    return apiClient.get<DefaultPriceLogListResponse>(
      "/admin/logs/default-prices",
      {
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(product_id && { product_id }),
          ...(changed_at && { changed_at }),
        },
      },
    );
  },

  getDefaultPriceLogsByProduct: (
    productId: number,
    params: { page?: number; limit?: number } = {},
  ) => {
    const { page = 1, limit = 10 } = params;
    return apiClient.get<DefaultPriceLogByProductResponse>(
      `/admin/logs/default-prices/product/${productId}`,
      { params: { page, limit } },
    );
  },

  getSpecialPriceLogs: (params: PricingLogParams = {}) => {
    const {
      page = 1,
      limit = 10,
      search,
      product_id,
      user_id,
      changed_at,
    } = params;
    return apiClient.get<SpecialPriceLogListResponse>(
      "/admin/logs/special-prices",
      {
        params: {
          page,
          limit,
          ...(search && { search }),
          ...(product_id && { product_id }),
          ...(user_id && { user_id }),
          ...(changed_at && { changed_at }),
        },
      },
    );
  },

  getSpecialPriceLogsByProduct: (
    productId: number,
    params: { page?: number; limit?: number; changed_at?: string } = {},
  ) => {
    const { page = 1, limit = 10, changed_at } = params;
    return apiClient.get<SpecialPriceLogByProductResponse>(
      `/admin/logs/special-prices/product/${productId}`,
      {
        params: {
          page,
          limit,
          ...(changed_at && { changed_at }),
        },
      },
    );
  },

  getSpecialPriceLogsByUser: (
    userId: number,
    params: {
      page?: number;
      limit?: number;
      product_id?: number;
      changed_at?: string;
    } = {},
  ) => {
    const { page = 1, limit = 10, product_id, changed_at } = params;
    return apiClient.get<SpecialPriceLogByUserResponse>(
      `/admin/logs/special-prices/user/${userId}`,
      {
        params: {
          page,
          limit,
          ...(product_id && { product_id }),
          ...(changed_at && { changed_at }),
        },
      },
    );
  },
};
