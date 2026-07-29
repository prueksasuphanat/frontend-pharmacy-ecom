import type { RouteRecordRaw } from 'vue-router';

export const reportsRoutes: RouteRecordRaw[] = [
  {
    path: 'reports',
    name: 'admin-reports-index',
    component: () => import('@/views/admin/reports/AdminReportsIndexView.vue'),
    meta: {
      title: 'รายงาน',
      requiresAuth: true,
      requiresAdmin: true,
      breadcrumb: [
        { label: 'แดชบอร์ด', path: '/admin/dashboard' },
        { label: 'รายงาน', active: true }
      ]
    }
  },
  {
    path: 'reports/user-pricing',
    name: 'admin-reports-user-pricing',
    component: () => import('@/views/admin/reports/UserPricingReportView.vue'),
    meta: {
      title: 'รายงานการตั้งราคา',
      requiresAuth: true,
      requiresAdmin: true,
      breadcrumb: [
        { label: 'แดชบอร์ด', path: '/admin/dashboard' },
        { label: 'รายงาน', path: '/admin/reports' },
        { label: 'รายงานการตั้งราคา', active: true }
      ]
    }
  }
];
