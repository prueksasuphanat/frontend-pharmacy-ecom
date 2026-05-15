# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Phanadrug** — Pharmacy e-commerce frontend built with Vue 3 + TypeScript + Vite. Two user personas: customers (browse/purchase) and admins (inventory/pricing/orders management). Thai language UI with THB currency.

## Commands

```bash
npm run dev          # Vite dev server (port 5173 by default)
npm run build        # Production build
npm run preview      # Preview production build
npm run check-build  # Check build output
```

No test runner is configured. TypeScript checking: `npx tsc --noEmit` (note: `tsconfig.json` has `"ignoreDeprecations": "6.0"` so some errors appear but build succeeds).

## Environment Variables

Create `.env` in the frontend root:

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Phanadrug
VITE_APP_VERSION=1.0.0
VITE_S3_BUCKET_URL=   # optional, for file uploads
```

## Architecture

### Tech Stack
- **Vue 3** with `<script setup lang="ts">` Composition API throughout
- **Pinia** for state management
- **Vue Router 4** with file-based route grouping + auth guards
- **Axios** with JWT interceptors (auto token refresh on 401)
- **VeeValidate 4** + `@vee-validate/rules` for form validation (Thai error messages)
- **Tailwind CSS 3** — primary color: Teal, secondary: Slate
- **dayjs** for dates, `formatCurrency` util for THB display
- Path alias `@/` → `src/`

### Layouts & Routing

Two layouts wrap all views:
- `DefaultLayout.vue` — public + customer routes (Navbar + Footer)
- `AdminLayout.vue` — admin routes (AdminSidebar only)

Route files are split by section in `src/router/routes/`. Auth guard logic in `src/router/guards/auth.guard.ts`:
1. Has token but no user → call `fetchProfile()`
2. Guest-only route + logged in → redirect `/products`
3. Protected route + not logged in → redirect `/login?redirect=...`
4. Admin route + not ADMIN/DEMO role → redirect `/403`

**DEMO role counts as admin** (`role === "ADMIN" || role === "DEMO"`), but backend restricts actual mutations.

`/register/complete` requires `sessionStorage.fromRegister` — prevents direct URL access.

### State Management Pattern

All Pinia store actions follow this pattern:

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

### API Layer

All API calls go through `src/api/client.ts` (Axios instance). The response interceptor handles 401 by queuing concurrent requests while refreshing tokens, then retrying them. Never modify interceptor logic without understanding the queue mechanism.

API modules export a plain object: `export const somethingApi = { getAll, getById, create, update, delete }`.

**Gotcha:** `productPricesApi.getProductPrices()` uses POST (not GET) despite being a read operation — matches backend design.

**Gotcha:** `ADMIN.SETTINGS.USERS.FULLNAME` constant in `src/constants/api.ts` is missing a leading `/` — known issue.

### UI Components

Two tiers in `src/components/ui/`:
- **Base\*** — standalone components (no form binding)
- **V\*** — VeeValidate-wrapped versions of the same components for use inside `<Form>` blocks

For forms always use V-components (`VInput`, `VSelect`, `VMultiSelect`, etc.) inside VeeValidate `<Form>` tags. For display/non-form use cases use Base components.

### Stores with Mock Data (TODO: connect to real API)

- `cart.store.ts` — uses `MOCK_PRODUCTS` + `MOCK_PRICES` from `src/__mocks__/products.ts`
- `notification.store.ts` — polls every 30s but hits mock data, not API

## Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Vue files | PascalCase | `AdminInventoryView.vue` |
| TS files | kebab-case | `auth.store.ts`, `product-price.routes.ts` |
| Pinia stores | `use{Name}Store` | `useAuthStore` |
| Composables | `use{Name}` | `useAuth`, `useToast` |
| API modules | `{name}Api` | `authApi`, `productsApi` |
| Route constants | UPPER_CASE | `ROUTES.ADMIN.DASHBOARD` |

## Adding a New Feature (Checklist)

1. Define types in `src/types/`
2. Add API functions in `src/api/` (or `src/api/admin/`)
3. Export from `src/api/index.ts`
4. Create/update Pinia store in `src/stores/`
5. Create view(s) in `src/views/`
6. Add route in `src/router/routes/`

For new admin tables: use `BaseTable.vue` and mirror the pattern in `category.store.ts` (pagination + search + loading state).

## Files to Touch Carefully

- `src/api/client.ts` — interceptor queue logic is subtle
- `src/router/guards/auth.guard.ts` — affects entire auth flow
- `src/stores/auth.store.ts` — referenced by nearly every component
- `src/constants/api.ts` — must stay in sync with backend route definitions
