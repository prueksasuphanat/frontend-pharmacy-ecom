import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    // ─── Public ────────────────────────────────────────────────
    { path: '/', redirect: '/products' },
    { path: '/login',           component: () => import('@/views/public/LoginView.vue'),          meta: { guestOnly: true } },
    { path: '/register',        component: () => import('@/views/public/RegisterView.vue'),       meta: { guestOnly: true } },
    { path: '/verify-email',    component: () => import('@/views/public/VerifyEmailView.vue') },
    { path: '/forgot-password', component: () => import('@/views/public/ForgotPasswordView.vue'), meta: { guestOnly: true } },
    { path: '/reset-password',  component: () => import('@/views/public/ResetPasswordView.vue') },
    { path: '/products',        component: () => import('@/views/public/ProductListView.vue') },

    // ─── Customer (requires auth) ───────────────────────────────
    { path: '/products/:id',       component: () => import('@/views/customer/ProductDetailView.vue'),  meta: { requiresAuth: true } },
    { path: '/cart',               component: () => import('@/views/customer/CartView.vue'),           meta: { requiresAuth: true } },
    { path: '/checkout',           component: () => import('@/views/customer/CheckoutView.vue'),       meta: { requiresAuth: true } },
    { path: '/checkout/success',   component: () => import('@/views/customer/CheckoutSuccessView.vue'), meta: { requiresAuth: true } },
    { path: '/orders',             component: () => import('@/views/customer/OrderListView.vue'),      meta: { requiresAuth: true } },
    { path: '/orders/:id',         component: () => import('@/views/customer/OrderDetailView.vue'),    meta: { requiresAuth: true } },
    { path: '/profile',            component: () => import('@/views/customer/ProfileView.vue'),        meta: { requiresAuth: true } },
    { path: '/profile/addresses',  component: () => import('@/views/customer/AddressBookView.vue'),    meta: { requiresAuth: true } },
    { path: '/profile/security',   component: () => import('@/views/customer/SecurityView.vue'),       meta: { requiresAuth: true } },
    { path: '/wishlist',           component: () => import('@/views/customer/WishlistView.vue'),       meta: { requiresAuth: true } },
    { path: '/notifications',      component: () => import('@/views/customer/NotificationView.vue'),   meta: { requiresAuth: true } },

    // ─── Admin (requires admin role) ────────────────────────────
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      children: [
        { path: '',           redirect: '/admin/dashboard' },
        { path: 'dashboard',  component: () => import('@/views/admin/AdminDashboardView.vue') },
        { path: 'orders',     component: () => import('@/views/admin/AdminOrderListView.vue') },
        { path: 'orders/:id', component: () => import('@/views/admin/AdminOrderDetailView.vue') },
        { path: 'inventory',  component: () => import('@/views/admin/AdminInventoryView.vue') },
        { path: 'logs',       component: () => import('@/views/admin/AdminLogView.vue') },
        { path: 'settings',   component: () => import('@/views/admin/AdminSettingsView.vue') },
      ],
    },

    // ─── Error Pages ─────────────────────────────────────────────
    { path: '/403', component: () => import('@/views/errors/ForbiddenView.vue') },
    { path: '/:pathMatch(.*)*', component: () => import('@/views/errors/NotFoundView.vue') },
  ],
})

// Route Guards — import stores lazily (after Pinia is installed on app)
router.beforeEach(async (to) => {
  const { useAuthStore } = await import('@/stores/auth.store')
  const auth = useAuthStore()

  if (to.meta.guestOnly && auth.isLoggedIn) return '/products'
  if (to.meta.requiresAuth && !auth.isLoggedIn) return `/login?redirect=${to.fullPath}`
  if (to.meta.requiresAdmin && !auth.isAdmin) return '/403'
})

export default router
