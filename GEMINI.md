# Frontend — Gemini Context

> Last updated: 2026-05-23
> For backend context → see `backend/GEMINI.md`

## Tech Stack

| Tech               | Version    | Notes                       |
| ------------------ | ---------- | --------------------------- |
| Vue                | 3.5.32     | Composition API only        |
| Vite               | 8.0.13     | Build tool                  |
| TypeScript         | 6.0.2      |                             |
| Pinia              | 3.0.4      | State management            |
| Vue Router         | 4.6.4      |                             |
| Axios              | 1.15.0     | + JWT interceptors          |
| Tailwind CSS       | 3.4.19     |                             |
| VeeValidate        | 4.15.1     | Forms + Thai error messages |
| @vueuse/core       | 14.2.1     |                             |
| ApexCharts         | 5.10.6     | via vue3-apexcharts         |
| lucide-vue-next    | 1.0.0      | Icons                       |
| vue-toastification | 2.0.0-rc.5 |                             |
| dayjs              | 1.11.20    |                             |

## Quick Start

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
```

## Project Config

- Path alias: `@/` → `src/`
- Font: Noto Sans Thai, Inter
- Color theme: Primary = Teal (50-950), Secondary = Slate
- tsconfig: `"ignoreDeprecations": "6.0"` — shows errors but build works

## File Structure

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance + JWT interceptors + auto token refresh
│   ├── auth.ts, cart.ts, notifications.ts
│   ├── customer/              # Customer-facing APIs
│   ├── public/                # Public APIs (products, categories)
│   └── admin/                 # Admin APIs
├── components/
│   ├── layout/                # Navbar, Footer, AdminSidebar
│   ├── ui/                    # Base* + V* components
│   ├── product/, cart/, notification/
├── composables/               # useAuth, useCart, useNotifications, useToast
├── constants/                 # api.ts, app.ts, routes.ts
├── layouts/                   # DefaultLayout, AdminLayout
├── router/                    # Vue Router + auth guards
├── stores/                    # Pinia stores (auth, admin/*, customer/*)
├── types/                     # TypeScript interfaces
├── utils/                     # format.ts, validation.ts, storage.ts, dayjs.ts
├── views/                     # public/, customer/, admin/, errors/
└── __mocks__/                 # Mock data (being phased out)
```

## Routing

### Public (no auth)

| Path                 | View               | Meta                             |
| -------------------- | ------------------ | -------------------------------- |
| `/`                  | → `/products`      |                                  |
| `/login`             | LoginView          | guestOnly                        |
| `/register`          | RegisterView       | guestOnly                        |
| `/register/complete` | RegisterComplete   | guestOnly + sessionStorage guard |
| `/verify-email`      | VerifyEmailView    |                                  |
| `/forgot-password`   | ForgotPasswordView | guestOnly                        |
| `/reset-password`    | ResetPasswordView  |                                  |
| `/products`          | ProductListView    |                                  |

### Customer (requiresAuth)

`/products/:id`, `/cart`, `/checkout`, `/checkout/success`, `/orders`, `/orders/:id`, `/profile`, `/profile/addresses`, `/profile/security`, `/wishlist`, `/notifications`

### Admin (requiresAuth + ADMIN/DEMO)

`/admin/dashboard`, `/admin/orders`, `/admin/products`, `/admin/logs`, `/admin/settings/*`

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

## API Client

- Base URL: `VITE_API_BASE_URL`
- Timeout: 10s
- Request interceptor: injects `Bearer {access_token}`
- Response interceptor (401): auto refresh → retry → or redirect `/login`

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

- `<script setup lang="ts">` — Composition API only, no Options API
- `import type { ... }` for types
- `@/` alias — never `../../../`
- `useToast()` composable — never import vue-toastification directly
- Error messages in Thai

### Store Action Pattern

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

### API Module Pattern

```typescript
export const unitsApi = {
  getAll: (params?) => apiClient.get<Response>("/endpoint", { params }),
  getById: (id: number) => apiClient.get<Response>(`/endpoint/${id}`),
  create: (data) => apiClient.post<Response>("/endpoint", data),
  update: (id: number, data) =>
    apiClient.put<Response>(`/endpoint/${id}`, data),
  delete: (id: number) => apiClient.delete(`/endpoint/${id}`),
};
```

### Naming

| Thing       | Convention       | Example                                    |
| ----------- | ---------------- | ------------------------------------------ |
| Vue files   | PascalCase       | `AdminInventoryView.vue`                   |
| TS files    | camelCase/kebab  | `auth.store.ts`, `product-price.routes.ts` |
| Stores      | `use{Name}Store` | `useAuthStore`, `useUnitStore`             |
| Composables | `use{Name}`      | `useAuth`, `useCart`                       |
| API modules | `{name}Api`      | `authApi`, `unitsApi`                      |

### Adding a New Feature

1. Create types in `src/types/`
2. Create API functions in `src/api/` → export from `src/api/index.ts`
3. Create/update store in `src/stores/` → export from `src/stores/index.ts`
4. Create/update view in `src/views/`
5. Add route in `src/router/routes/`

## Known Issues

| Issue                                | Detail                                            |
| ------------------------------------ | ------------------------------------------------- |
| `isAdmin` getter bug                 | Store only checks ADMIN, guard checks ADMIN\|DEMO |
| `refreshAccessToken` bug             | Refresh token never gets updated in localStorage  |
| tsconfig `ignoreDeprecations: "6.0"` | Shows TS errors in IDE but build succeeds         |
| cart.store uses hardcoded `roleName` | `"CUSTOMER"` — doesn't use actual user role       |
| `ProductPrice` read is POST not GET  | Must pass product_ids in body                     |

## Critical Files — Edit with Care

| File                       | Why                                   |
| -------------------------- | ------------------------------------- |
| `src/api/client.ts`        | Touches all auth/request flow         |
| `src/router/index.ts`      | Affects entire auth flow              |
| `src/stores/auth.store.ts` | Used by every authenticated component |
| `src/constants/api.ts`     | Must stay in sync with backend routes |
