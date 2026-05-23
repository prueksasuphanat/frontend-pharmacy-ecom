import { computed } from "vue";
import { useAuthStore } from "@/stores/auth.store";
import type { LoginCredentials, RegisterData } from "@/types";

export function useAuth() {
  const authStore = useAuthStore();

  const isLoggedIn = computed(() => authStore.isLoggedIn);
  const currentUser = computed(() => authStore.currentUser);
  const isAdmin = computed(() => authStore.isAdmin);
  const isEmailVerified = computed(() => authStore.isEmailVerified);
  const roleName = computed(() => authStore.roleName);
  const isLoading = computed(() => authStore.isLoading);
  const loginError = computed(() => authStore.loginError);

  async function login(credentials: LoginCredentials): Promise<boolean> {
    return authStore.login(credentials.email, credentials.password);
  }

  async function register(data: RegisterData): Promise<boolean> {
    return authStore.register(data.email, data.password);
  }

  function logout(): void {
    authStore.logout();
  }

  return {
    isLoggedIn,
    currentUser,
    isAdmin,
    isEmailVerified,
    roleName,
    isLoading,
    loginError,

    login,
    register,
    logout,
  };
}
