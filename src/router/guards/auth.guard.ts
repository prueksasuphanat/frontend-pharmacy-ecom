import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore();

  // If has token but no user, try to fetch profile first
  if (auth.accessToken && !auth.currentUser) {
    await auth.fetchProfile();
  }

  // Now check auth status with fresh user data
  const isLoggedIn = !!auth.accessToken && !!auth.currentUser;
  const isAdmin =
    auth.currentUser?.role === "ADMIN" || auth.currentUser?.role === "DEMO";

  // Guest only pages (login, register)
  if (to.meta.guestOnly && isLoggedIn) {
    return next("/products");
  }

  // Protected pages
  if (to.meta.requiresAuth && !isLoggedIn) {
    return next(`/login?redirect=${to.fullPath}`);
  }

  // Admin only pages
  if (to.meta.requiresAdmin && !isAdmin) {
    return next("/403");
  }

  next();
}
