import type { RouteRecordRaw } from "vue-router";

import { cartRoutes } from "./customer/cart.routes";
import { checkoutRoutes } from "./customer/checkout.routes";
import { notificationsRoutes } from "./customer/notifications.routes";
import { productsRoutes } from "./customer/products.routes";
import { profileRoutes } from "./customer/profile.routes";

export const customerRoutes: RouteRecordRaw[] = [
  ...productsRoutes,
  ...cartRoutes,
  ...checkoutRoutes,
  ...profileRoutes,
  ...notificationsRoutes,
];
