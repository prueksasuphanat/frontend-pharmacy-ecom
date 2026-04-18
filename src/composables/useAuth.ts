/**
 * Authentication composable
 *
 * Wraps the auth store to provide a clean API for authentication operations.
 * **Validates: Requirements 3.2**
 */

import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginCredentials, RegisterData } from "@/types";

/**
 * Authentication composable
 * Provides reactive authentication state and methods
 */
export function useAuth() {
  const authStore = useAuthStore();

  // Reactive state
  const isLoggedIn = computed(() => authStore.isLoggedIn);
  const currentUser = computed(() => authStore.currentUser);
  const isAdmin = computed(() => authStore.isAdmin);
  const isEmailVerified = computed(() => authStore.isEmailVerified);
  const roleName = computed(() => authStore.roleName);
  const isLoading = computed(() => authStore.isLoading);
  const loginError = computed(() => authStore.loginError);

  /**
   * Login with email and password
   * @param credentials - Login credentials (email, password)
   * @returns Promise<boolean> - true if login successful
   */
  async function login(credentials: LoginCredentials): Promise<boolean> {
    return authStore.login(credentials.email, credentials.password);
  }

  /**
   * Register a new user account
   * @param data - Registration data (email, password, full_name)
   * @returns Promise<boolean> - true if registration successful
   */
  async function register(data: RegisterData): Promise<boolean> {
    return authStore.register(data.email, data.password);
  }

  /**
   * Logout current user
   */
  function logout(): void {
    authStore.logout();
  }

  return {
    // State
    isLoggedIn,
    currentUser,
    isAdmin,
    isEmailVerified,
    roleName,
    isLoading,
    loginError,

    // Methods
    login,
    register,
    logout,
  };
}
