import { createRouter, createWebHistory } from "vue-router";
import { publicRoutes } from "./routes/public.routes";
import { customerRoutes } from "./routes/customer.routes";
import { adminRoutes } from "./routes/admin.routes";
import { errorRoutes } from "./routes/error.routes";
import { authGuard } from "./guards/auth.guard";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [...publicRoutes, ...customerRoutes, adminRoutes, ...errorRoutes],
});

// Apply auth guard
router.beforeEach(authGuard);

export default router;
