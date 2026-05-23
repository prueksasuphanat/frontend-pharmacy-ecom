import type { NavigationGuardNext, RouteLocationNormalized } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const auth = useAuthStore();

  if (auth.accessToken && !auth.currentUser) {
    await auth.fetchProfile();
  }

  const isLoggedIn = !!auth.accessToken && !!auth.currentUser;
  const isAdmin =
    auth.currentUser?.role === "ADMIN" || auth.currentUser?.role === "DEMO";

  if (to.meta.guestOnly && isLoggedIn) {
    return next("/products");
  }

  if (to.meta.requiresAuth && !isLoggedIn) {
    return next(`/login?redirect=${to.fullPath}`);
  }

  if (to.meta.requiresAdmin && !isAdmin) {
    return next("/403");
  }

  next();
}
