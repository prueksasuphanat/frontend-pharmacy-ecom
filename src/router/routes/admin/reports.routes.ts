import type { RouteRecordRaw } from 'vue-router';

export const reportsRoutes: RouteRecordRaw[] = [
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
        { label: 'รายงาน', path: '/admin/reports/user-pricing' },
        { label: 'การตั้งราคา', active: true }
      ]
    }
  }
];
