export interface AuditLogUser {
  id: number;
  username: string;
  title: string | null;
  first_name: string | null;
  last_name: string | null;
  pmc_name: string | null;
  email: string | null;
  role: string;
}

export interface AuditLogProduct {
  id: number;
  code: string;
  name: string;
  categories: {
    category: {
      id: number;
      name: string;
    };
  }[];
}

export interface UserSessionLogEntry {
  id: number;
  user_id: number;
  session_id: string;
  login_at: string;
  last_active_at: string;
  logout_at: string | null;
  duration_minutes: number | null;
  ip_address: string | null;
  user_agent: string | null;
  user: AuditLogUser;
}

export interface ProductViewLogEntry {
  id: number;
  user_id: number;
  product_id: number;
  viewed_at: string;
  session_id: string | null;
  user: AuditLogUser;
  product: AuditLogProduct;
}

export interface UserSessionLogParams {
  page?: number;
  limit?: number;
  search?: string;
  login_at?: string;
  role?: string;
}

export interface ProductViewLogParams {
  page?: number;
  limit?: number;
  search?: string;
  viewed_at?: string;
}

export interface UserSessionLogResponse {
  success: boolean;
  data: UserSessionLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductViewLogResponse {
  success: boolean;
  data: ProductViewLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
