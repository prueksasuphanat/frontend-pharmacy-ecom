// ============================================================
// TYPE DEFINITIONS — User, Authentication
// Extracted from mocks/users.ts and stores/auth.store.ts
// ============================================================

/**
 * User entity representing a registered user in the system
 */
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role_id: string;
  role_name: string;
  role_label: string;
  is_email_verified: boolean;
  is_active: boolean;
  created_at: string;
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data for creating a new user account
 */
export interface RegisterData {
  email: string;
  password: string;
  full_name?: string;
}

/**
 * User role types
 */
export type MockRole = "admin" | "wholesale" | "clinic" | "retail";
