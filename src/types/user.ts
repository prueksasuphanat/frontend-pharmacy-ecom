// ============================================================
// TYPE DEFINITIONS — User, Authentication
// ============================================================

/**
 * User attachment (profile image or document)
 */
export interface UserAttachment {
  id: number;
  user_id: number;
  url: string;
  name: string;
  type: string | null;
  mime_type: string | null;
  size: number | null;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
}

/**
 * User entity representing a registered user in the system
 */
export interface User {
  id: number;
  pmc_customer_id: string | null;
  code: string;
  pmc_name: string | null;
  title: string | null;
  first_name: string;
  last_name: string;
  address: string | null;
  phone: string;
  email: string;
  birthdate: string | null;
  sex: string | null;
  username: string;
  role: string;
  is_verified: boolean;
  is_active: boolean;
  is_delete: boolean;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  updated_by: number | null;
  expired_date: string | null;
  profile_image?: UserAttachment | null;
  attachments?: UserAttachment[];
}

/**
 * Login credentials for authentication
 */
export interface LoginCredentials {
  username: string;
  password: string;
}

/**
 * Registration data for creating a new user account
 */
export interface RegisterData {
  email: string;
  username: string;
  password: string;
  title: string;
  first_name: string;
  last_name: string;
  birthdata: string;
  phone?: string;
  address?: string;
  files?: File[] | null;
  profileImage?: File | null;
}
