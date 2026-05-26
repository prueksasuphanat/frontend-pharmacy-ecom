# Frontend — Claude Code Context

> Last updated: 2026-05-23
> For backend context, stack details, and DB schema → see `backend/CLAUDE.md`

## Git Commit Style

> See root `CLAUDE.md` for full rules, format, types & emojis, and examples.

- **ยังไม่ต้องทำการ Git Commit ทุกครั้งจนกว่าผู้ใช้จะสั่งโดยตรง** (Do NOT commit automatically; wait for explicit instruction/approval from the user to commit).
- **หยุดถามเพื่อขอคำยืนยันจากผู้ใช้ก่อนทำการ Commit เสมอ** (Always ask and wait for user confirmation/command before committing).
- **NEVER `git push` automatically** — only push when explicitly asked/instructed by the user
- **NEVER touch the `main` branch**


## Tech Stack

| Tech               | Version    | Notes                          |
| ------------------ | ---------- | ------------------------------ |
| Vue                | 3.5.32     | Composition API only           |
| Vite               | 8.0.13     | Build tool                     |
| TypeScript         | 6.0.2      |                                |
| Pinia              | 3.0.4      | State management               |
| Vue Router         | 4.6.4      |                                |
| Axios              | 1.15.0     | + JWT interceptors             |
| Tailwind CSS       | 3.4.19     |                                |
| VeeValidate        | 4.15.1     | Forms + Thai error messages    |
| @vueuse/core       | 14.2.1     |                                |
| ApexCharts         | 5.10.6     | via vue3-apexcharts            |
| lucide-vue-next    | 1.0.0      | Icons                          |
| vue-toastification | 2.0.0-rc.5 |                                |
| dayjs              | 1.11.20    |                                |

## Quick Start

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check-build  # Check build status
```

## Project Config

- Path alias: `@/` → `src/`
- Font: Noto Sans Thai, Inter
- Color theme: Primary = Teal (50-950), Secondary = Slate
- tsconfig: `"ignoreDeprecations": "6.0"` — getDiagnostics shows errors but build works

## File Structure

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance + JWT interceptors + auto token refresh
│   ├── auth.ts
│   ├── cart.ts                # connected to backend Cart API
│   ├── notifications.ts       # notifications API
│   ├── index.ts               # barrel exports
│   ├── customer/
│   │   └── profile.ts         # PATCH /api/v1/customer/profile
│   ├── public/                # public-facing API (products, categories)
│   └── admin/
│       ├── products.ts
│       ├── logs.ts
│       └── settings/
│           ├── categories.ts
│           ├── productPrices.ts
│           ├── units.ts
│           └── users.ts
├── components/
│   ├── layout/                # Navbar, Footer, AdminSidebar
│   ├── ui/                    # Base* + V* components (see UI Components section)
│   ├── product/ProductDetailModal.vue
│   ├── cart/MiniCart.vue
│   └── notification/NotificationBell.vue
├── composables/
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useNotifications.ts
│   └── useToast.ts
├── constants/
│   ├── api.ts                 # API endpoint constants
│   ├── app.ts
│   └── routes.ts
├── layouts/
│   ├── DefaultLayout.vue      # Public/customer (Navbar + Footer)
│   └── AdminLayout.vue        # Admin (AdminSidebar)
├── router/
│   ├── index.ts               # createRouter + authGuard
│   ├── guards/auth.guard.ts
│   └── routes/                # public, customer, admin, error routes
├── stores/
│   ├── index.ts               # barrel exports all stores
│   ├── auth.store.ts
│   ├── admin/
│   │   ├── logs.store.ts
│   │   ├── product.store.ts
│   │   ├── productPrice.store.ts
│   │   └── settings/
│   │       ├── category.store.ts
│   │       ├── unit.store.ts          # ✅ fully connected
│   │       └── users.store.ts
│   └── customer/
│       ├── cart.store.ts          # ⚠️ mock data — not connected to API
│       └── notification.store.ts  # ⚠️ mock data — not connected to API
├── types/                     # user, product, cart, order, notification, category, productPrice, pricingLog
├── utils/
│   ├── env.ts
│   ├── format.ts              # formatCurrency (THB), formatDate (Thai locale), truncateText
│   ├── validation.ts          # VeeValidate rules + Thai error messages
│   ├── storage.ts
│   └── dayjs.ts
├── views/
│   ├── public/                # login, register, forgot/reset password, verify email, product list
│   ├── customer/              # cart, checkout, orders, profile, security, addresses, wishlist, notifications
│   ├── admin/                 # dashboard, inventory, orders, logs, settings/
│   │   └── settings/          # categories, units, users, product-price, product-units
│   └── errors/                # 403, 404
├── __mocks__/                 # Mock data (products, orders, inventory, users/notifications)
├── App.vue
└── main.ts
```

## Routing

### Public (no auth required)

| Path                 | View              | Meta                              |
| -------------------- | ----------------- | --------------------------------- |
| `/`                  | → `/products`     |                                   |
| `/login`             | LoginView         | guestOnly                         |
| `/register`          | RegisterView      | guestOnly                         |
| `/register/complete` | RegisterComplete  | guestOnly + sessionStorage guard  |
| `/verify-email`      | VerifyEmailView   |                                   |
| `/forgot-password`   | ForgotPasswordView| guestOnly                         |
| `/reset-password`    | ResetPasswordView |                                   |
| `/products`          | ProductListView   |                                   |

### Customer (requiresAuth)

`/products/:id`, `/cart`, `/checkout`, `/checkout/success`, `/orders`, `/orders/:id`, `/profile`, `/profile/addresses`, `/profile/security`, `/wishlist`, `/notifications`

### Admin (requiresAuth + ADMIN/DEMO)

`/admin/dashboard`, `/admin/orders`, `/admin/orders/:id`, `/admin/products`, `/admin/logs`, `/admin/settings` + sub-routes (categories, units, users, product-price, product-units)

### Error

`/403` → ForbiddenView, `/:pathMatch(.*)` → NotFoundView

### Auth Guard Logic

1. Has token but no user → `fetchProfile()`
2. Guest-only + logged in → redirect `/products`
3. Protected + not logged in → redirect `/login?redirect=...`
4. Admin + not admin/demo → redirect `/403`

## State Management (Pinia)

### auth.store.ts

- State: `currentUser`, `accessToken`, `refreshToken`, `isLoading`, `error`
- Getters: `isLoggedIn`, `isAdmin` (ADMIN or DEMO), `isVerified`, `userRole`, `fullName`
- Actions: `login()`, `fetchProfile()`, `refreshAccessToken()`, `register()`, `logout()`
- Persistence: localStorage (`access_token`, `refresh_token`)

### cart.store.ts ⚠️ Mock only

- Uses `MOCK_PRODUCTS` + `MOCK_PRICES` from `__mocks__/products.ts`
- Free shipping when subtotal ≥ 1000 THB
- Pricing based on `auth.roleName` (retail/wholesale/clinic)
- TODO: connect to backend Cart API

### notification.store.ts ⚠️ Mock only

- Polling every 30s but calls no real API
- TODO: connect to backend Notification API

### unit.store.ts ✅ Fully connected

- State: `units`, `isLoading`, `error`, `pagination`
- Actions: `fetchUnits()`, `createUnit()`, `updateUnit()`, `deleteUnit()`, `toggleActive()`

## API Client

- Base URL: `VITE_API_BASE_URL`
- Timeout: 10s
- Request interceptor: injects `Bearer {access_token}`
- Response interceptor (401):
  1. No refresh token → clear → redirect `/login`
  2. Already refreshing → queue request
  3. POST `/auth/refresh` → update tokens → retry
  4. Refresh failed → clear → redirect `/login`

## UI Components

### Base Components (no VeeValidate)

`BaseInput`, `BaseSelect`, `BaseMultiSelect`, `BaseCheckbox`, `BaseToggle`, `BaseTextarea`, `BaseTable`, `BaseModal`, `BaseFileUpload`, `BaseDatePicker`, `BaseAutocomplete`, `DrugTypeBadge`, `LoadingOverlay`

### V-Components (VeeValidate-wrapped)

`VInput`, `VSelect`, `VMultiSelect`, `VCheckbox`, `VDatePicker`, `VFileUpload`, `VTextarea`, `VAutocomplete`

## Environment Variables

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Phanadrug
VITE_APP_VERSION=1.0.0
VITE_S3_BUCKET_URL=          # optional — Cloudflare R2 public URL
```

## Coding Conventions

### Always

- `<script setup lang="ts">` — Composition API, no Options API
- `import type { ... }` for types
- `@/` alias — never relative paths with `../../../`
- `useToast()` composable — never import vue-toastification directly
- Error messages in Thai

### Store action pattern

```typescript
async someAction(): Promise<boolean> {
  this.isLoading = true
  this.error = null
  const toast = useToast()
  try {
    const response = await someApi.doSomething(params)
    this.data = response.data
    toast.success("สำเร็จ")
    return true
  } catch (err: any) {
    this.error = err.response?.data?.message || "เกิดข้อผิดพลาด"
    toast.error(this.error)
    return false
  } finally {
    this.isLoading = false
  }
}
```

### API module pattern

```typescript
// src/api/admin/settings/units.ts
export const unitsApi = {
  getAll: (params?: Params) => apiClient.get<Response>('/endpoint', { params }),
  getById: (id: number) => apiClient.get<Response>(`/endpoint/${id}`),
  create: (data: CreatePayload) => apiClient.post<Response>('/endpoint', data),
  update: (id: number, data: UpdatePayload) => apiClient.put<Response>(`/endpoint/${id}`, data),
  delete: (id: number) => apiClient.delete(`/endpoint/${id}`),
}
```

### Naming

| Thing        | Convention           | Example                                 |
| ------------ | -------------------- | --------------------------------------- |
| Vue files    | PascalCase           | `AdminInventoryView.vue`                |
| TS files     | camelCase/kebab      | `auth.store.ts`, `product-price.routes.ts` |
| Stores       | `use{Name}Store`     | `useAuthStore`, `useUnitStore`          |
| Composables  | `use{Name}`          | `useAuth`, `useCart`                    |
| API modules  | `{name}Api`          | `authApi`, `unitsApi`                   |
| Route consts | UPPER_CASE in ROUTES |                                         |

### Adding a new feature

1. Create types in `src/types/`
2. Create API functions in `src/api/`
3. Export from `src/api/index.ts`
4. Create/update store in `src/stores/` (export from `src/stores/index.ts`)
5. Create/update view in `src/views/`
6. Add route in `src/router/routes/`

### New form

- Use VeeValidate + V-components (`VInput`, `VSelect`, etc.)
- Use `<Form>` and `<Field>` from vee-validate
- Error messages must be in Thai

### New admin table

- Use `BaseTable.vue`
- Follow existing store pattern (see `unit.store.ts` or `category.store.ts`)
- Must include: pagination, search, loading state

## Business Logic

### Auth Guard

- DEMO role counts as admin: `isAdmin = role === "ADMIN" || role === "DEMO"`
- `/register/complete` requires `sessionStorage.fromRegister` (prevents direct access)

### Pricing (Multi-Unit)

Backend uses `ProductUnit` — pricing is **per unit, not per product**:

- Each product has multiple `ProductUnit` entries (ซอง, กล่อง, ลัง)
- Each `ProductUnit` has its own `default_price` and `multiplier_to_base`
- `ProductPrice` links `user_id + product_unit_id`
- `productPricesApi.getProductPrices({ product_ids: [...] })` is **POST** not GET
- Response: `[{ product_id, units: [{ product_unit_id, unit_name, default_price, users: [...] }] }]`
- Bulk update: `[{ product_id, user_id, price }]`
- `is_special_pricing_enabled = true` → show user's special price, otherwise → `default_price`

## Known Issues & Gotchas

| Issue                                           | Detail                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `isAdmin` getter bug                            | `auth.store.ts` only checks `role === "ADMIN"`, but auth guard checks ADMIN \| DEMO. DEMO users won't get `isAdmin = true` from store. |
| `refreshAccessToken` bug                        | Tries to save `response.data.data.refreshToken` but backend only returns `accessToken`. The refresh token never gets updated in localStorage. |
| tsconfig `ignoreDeprecations: "6.0"`            | Shows TS errors in IDE but build succeeds                                                                |
| cart.store uses `roleName` hardcoded            | `const roleName = "CUSTOMER"` — hardcoded, doesn't use actual user role                                  |
| `ADMIN.SETTINGS.USERS.FULLNAME` missing `/`    | `"admin/users/user-fullname"` should be `"/admin/users/user-fullname"`                                   |
| `ADMIN.PRODUCT_PRICES.BASE` uses POST for read  | Not GET — must pass product_ids in body                                                                  |
| `API_ENDPOINTS` missing entries                 | No admin units, product-units, categories endpoints in `constants/api.ts`                                |

## Critical Files — Edit with Care

| File                             | Why                                          |
| -------------------------------- | -------------------------------------------- |
| `src/api/client.ts`              | Touches all auth/request flow                |
| `src/router/index.ts` + `auth.guard.ts` | Affects entire auth flow              |
| `src/stores/auth.store.ts`       | Used by every authenticated component        |
| `src/constants/api.ts`           | Must stay in sync with backend routes        |


