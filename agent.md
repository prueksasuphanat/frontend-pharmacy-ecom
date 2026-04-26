# Pharmacy E-Commerce Platform — Frontend Agent Context

> สรุปสถานะ frontend ล่าสุด ณ วันที่ 26 เมษายน 2569
> ข้อมูล technology stack, database schema, environment variables, และสถานะรวมอยู่ใน `backend/agent.md`

---

## 1. Project Setup

- ชื่อ: `phanadrug` (package.json)
- Framework: Vue 3 + Composition API + TypeScript
- Build: Vite 8.0.4
- Path alias: `@/` → `src/`
- Font: Noto Sans Thai, Inter
- Color theme: Primary = Teal (50-950), Secondary = Slate, Success/Warning/Danger/Info
- tsconfig: target es2023, bundler moduleResolution, noEmit

---

## 2. โครงสร้างไฟล์

```
frontend/src/
├── api/
│   ├── client.ts              # Axios instance + JWT interceptors + auto token refresh
│   ├── auth.ts                # login, register, logout, refresh, forgotPassword, resetPassword
│   ├── cart.ts                # Cart API (placeholder)
│   ├── notifications.ts       # Notification API (placeholder)
│   ├── index.ts               # Barrel exports
│   └── admin/
│       ├── products.ts        # Admin product API (getProducts, getProductById, updateProduct, toggleActive)
│       ├── logs.ts            # Pricing logs API (default + special, by product/user)
│       └── settings/
│           ├── categories.ts  # Category CRUD API
│           ├── productPrices.ts # Product price matrix API
│           └── users.ts       # Admin user management API
├── components/
│   ├── layout/
│   │   ├── Navbar.vue         # Navigation bar
│   │   ├── Footer.vue         # Footer
│   │   ├── AdminSidebar.vue   # Admin sidebar navigation
│   │   └── index.ts
│   ├── ui/                    # Reusable UI components
│   │   ├── BaseInput.vue      # Text input with validation
│   │   ├── BaseSelect.vue     # Dropdown
│   │   ├── BaseMultiSelect.vue # Multiple selection
│   │   ├── BaseCheckbox.vue   # Checkbox
│   │   ├── BaseToggle.vue     # Toggle switch
│   │   ├── BaseTextarea.vue   # Textarea
│   │   ├── BaseTable.vue      # Data table (sorting, pagination)
│   │   ├── BaseModal.vue      # Modal dialog
│   │   ├── BaseFileUpload.vue # File upload
│   │   ├── BaseDatePicker.vue # Date picker
│   │   ├── BaseAutocomplete.vue # Autocomplete search
│   │   ├── DrugTypeBadge.vue  # Drug type indicator badge
│   │   ├── LoadingOverlay.vue # Loading state overlay
│   │   ├── VInput.vue         # VeeValidate-wrapped input
│   │   ├── VSelect.vue        # VeeValidate-wrapped select
│   │   ├── VMultiSelect.vue   # VeeValidate-wrapped multi-select
│   │   ├── VCheckbox.vue      # VeeValidate-wrapped checkbox
│   │   ├── VDatePicker.vue    # VeeValidate-wrapped date picker
│   │   ├── VFileUpload.vue    # VeeValidate-wrapped file upload
│   │   ├── VTextarea.vue      # VeeValidate-wrapped textarea
│   │   ├── VAutocomplete.vue  # VeeValidate-wrapped autocomplete
│   │   └── index.ts
│   ├── product/
│   │   ├── ProductDetailModal.vue
│   │   └── index.ts
│   ├── cart/
│   │   ├── MiniCart.vue       # Mini cart dropdown
│   │   └── index.ts
│   └── notification/
│       ├── NotificationBell.vue
│       └── index.ts
├── composables/
│   ├── useAuth.ts             # Authentication composable
│   ├── useCart.ts             # Cart composable
│   ├── useNotifications.ts    # Notification composable
│   ├── useToast.ts            # Toast notification composable
│   └── index.ts
├── constants/
│   ├── api.ts                 # API endpoint constants (AUTH, PRODUCTS, CART, ORDERS, NOTIFICATIONS, PROFILE, ADMIN)
│   ├── app.ts                 # App configuration constants
│   ├── routes.ts              # Route path constants
│   └── index.ts
├── layouts/
│   ├── DefaultLayout.vue      # Public/customer layout (Navbar + Footer)
│   └── AdminLayout.vue        # Admin layout (AdminSidebar)
├── router/
│   ├── index.ts               # createRouter + authGuard
│   ├── guards/
│   │   └── auth.guard.ts      # Route protection (auth, admin, guest-only)
│   └── routes/
│       ├── public.routes.ts
│       ├── customer.routes.ts
│       ├── admin.routes.ts    # Wraps all admin sub-routes in AdminLayout
│       ├── error.routes.ts
│       └── admin/
│           ├── dashboard.routes.ts
│           ├── orders.routes.ts
│           ├── products.routes.ts
│           ├── admin-logs/logs.routes.ts
│           └── settings/settings.routes.ts
├── stores/
│   ├── auth.store.ts          # User auth state (login, logout, register, fetchProfile, refreshToken)
│   ├── cart.store.ts          # Shopping cart (localStorage + mock data) — TODO: connect to API
│   ├── notification.store.ts  # Notifications (mock data + polling) — TODO: connect to API
│   ├── index.ts
│   └── admin/
│       ├── product.store.ts       # Admin product management
│       ├── productPrice.store.ts  # Special pricing matrix
│       ├── logs.store.ts          # Pricing audit logs
│       └── settings/
│           ├── category.store.ts  # Category management
│           └── users.store.ts     # User management
├── types/
│   ├── user.ts                # User, LoginCredentials, RegisterData
│   ├── product.ts             # Product, ProductCategory, DrugType, ProductListParams
│   ├── cart.ts                # CartItem
│   ├── order.ts               # Order types
│   ├── notification.ts        # Notification types
│   ├── category.ts            # Category, CategoryListParams
│   ├── productPrice.ts        # ProductPriceData, UpdateProductPricePayload
│   ├── pricingLog.ts          # DefaultPriceLogEntry, SpecialPriceLogEntry, etc.
│   └── index.ts
├── utils/
│   ├── env.ts                 # Environment config (VITE_API_BASE_URL, VITE_APP_NAME, etc.)
│   ├── format.ts              # formatCurrency (THB), formatDate (Thai locale), truncateText
│   ├── validation.ts          # VeeValidate rules + Thai error messages
│   ├── storage.ts             # localStorage utilities
│   ├── dayjs.ts               # dayjs configuration
│   └── index.ts
├── views/
│   ├── public/
│   │   ├── LoginView.vue
│   │   ├── ProductListView.vue
│   │   ├── ForgotPasswordView.vue
│   │   ├── ResetPasswordView.vue
│   │   ├── VerifyEmailView.vue
│   │   └── register/
│   │       ├── RegisterView.vue
│   │       └── RegisterComplete.vue
│   ├── customer/
│   │   ├── CartView.vue
│   │   ├── CheckoutView.vue
│   │   ├── CheckoutSuccessView.vue
│   │   ├── OrderListView.vue
│   │   ├── OrderDetailView.vue
│   │   ├── ProductDetailView.vue
│   │   ├── ProfileView.vue
│   │   ├── SecurityView.vue
│   │   ├── AddressBookView.vue
│   │   ├── WishlistView.vue
│   │   └── NotificationView.vue
│   ├── admin/
│   │   ├── AdminDashboardView.vue
│   │   ├── AdminInventoryView.vue
│   │   ├── AdminOrderListView.vue
│   │   ├── AdminOrderDetailView.vue
│   │   ├── admin-logs/
│   │   │   ├── AdminLogIndexView.vue
│   │   │   ├── AdminLogSetPricingView.vue
│   │   │   └── AdminLogView.vue
│   │   └── settings/
│   │       ├── AdminSettingsIndexView.vue
│   │       ├── categories/
│   │       ├── product-price/
│   │       └── users/
│   └── errors/
│       ├── NotFoundView.vue
│       └── ForbiddenView.vue
├── __mocks__/
│   ├── products.ts            # Mock products + prices (ใช้ใน cart store)
│   ├── orders.ts              # Mock orders
│   ├── inventory.ts           # Mock inventory
│   └── users.ts               # Mock notifications
├── App.vue                    # Root component (RouterView only)
├── main.ts                    # App init: Pinia, Router, Toast
├── env.d.ts                   # Vite env type declarations
└── style.css                  # Global styles + Tailwind directives
```

---

## 3. Routing

### Public Routes (ไม่ต้อง login)

| Path                 | View                   | Meta                          |
| -------------------- | ---------------------- | ----------------------------- |
| `/`                  | redirect → `/products` |                               |
| `/login`             | LoginView              | guestOnly                     |
| `/register`          | RegisterView           | guestOnly                     |
| `/register/complete` | RegisterComplete       | guestOnly + beforeEnter guard |
| `/verify-email`      | VerifyEmailView        |                               |
| `/forgot-password`   | ForgotPasswordView     | guestOnly                     |
| `/reset-password`    | ResetPasswordView      |                               |
| `/products`          | ProductListView        |                               |

### Customer Routes (ต้อง login)

| Path                 | View                | Meta         |
| -------------------- | ------------------- | ------------ |
| `/products/:id`      | ProductDetailView   | requiresAuth |
| `/cart`              | CartView            | requiresAuth |
| `/checkout`          | CheckoutView        | requiresAuth |
| `/checkout/success`  | CheckoutSuccessView | requiresAuth |
| `/orders`            | OrderListView       | requiresAuth |
| `/orders/:id`        | OrderDetailView     | requiresAuth |
| `/profile`           | ProfileView         | requiresAuth |
| `/profile/addresses` | AddressBookView     | requiresAuth |
| `/profile/security`  | SecurityView        | requiresAuth |
| `/wishlist`          | WishlistView        | requiresAuth |
| `/notifications`     | NotificationView    | requiresAuth |

### Admin Routes (ต้อง login + ADMIN/DEMO role)

| Path                | View                             | Meta                         |
| ------------------- | -------------------------------- | ---------------------------- |
| `/admin`            | AdminLayout wrapper              | requiresAuth + requiresAdmin |
| `/admin/dashboard`  | AdminDashboardView               |                              |
| `/admin/orders`     | AdminOrderListView               |                              |
| `/admin/orders/:id` | AdminOrderDetailView             |                              |
| `/admin/products`   | AdminInventoryView               |                              |
| `/admin/logs`       | AdminLogIndexView                |                              |
| `/admin/settings`   | AdminSettingsIndexView           |                              |
| + sub-routes        | categories, users, product-price |                              |

### Error Routes

| Path               | View          |
| ------------------ | ------------- |
| `/403`             | ForbiddenView |
| `/:pathMatch(.*)*` | NotFoundView  |

### Auth Guard Logic

1. ถ้ามี token แต่ไม่มี user → fetchProfile()
2. Guest-only pages + logged in → redirect `/products`
3. Protected pages + not logged in → redirect `/login?redirect=...`
4. Admin pages + not admin/demo → redirect `/403`

---

## 4. State Management (Pinia Stores)

### auth.store.ts

- State: `currentUser`, `accessToken`, `refreshToken`, `isLoading`, `error`
- Getters: `isLoggedIn`, `isAdmin`, `isVerified`, `userRole`, `fullName`
- Actions: `login()`, `fetchProfile()`, `refreshAccessToken()`, `register()`, `logout()`
- Token persistence: localStorage (`access_token`, `refresh_token`)

### cart.store.ts (⚠️ ใช้ mock data + localStorage)

- State: `items` (CartItem[])
- Getters: `totalItems`, `subtotal`, `shippingFee` (ฟรีเมื่อ ≥ 1000), `total`, `hasPrescriptionItem`
- Actions: `addToCart()`, `updateQty()`, `removeItem()`, `clearCart()`, `moveToWishlist()`
- ใช้ `MOCK_PRODUCTS` + `MOCK_PRICES` จาก `__mocks__/products.ts`
- TODO: เชื่อมต่อ API จริง

### notification.store.ts (⚠️ ใช้ mock data)

- State: `notifications`, `isOpen`
- Getters: `unreadCount`, `latest5`
- Actions: `loadMockNotifications()`, `startPolling()` (30s), `markRead()`, `markAllRead()`
- TODO: เชื่อมต่อ API จริง

### admin/product.store.ts

- State: `products`, `pagination`, `isLoading`, `error`
- Getters: `totalProducts`, `activeProducts`, `inactiveProducts`, `productsWithSpecialPricing`
- Actions: `getProducts()`, `getProductById()`, `updateProduct()`, `toggleProductActive()`

### admin/productPrice.store.ts

- State: `productPrices`, `isLoading`, `isSaving`, `error`
- Getters: `priceMatrix`, `getPriceByUserAndProduct()`
- Actions: `fetchProductPrices()`, `updateProductPrices()`

### admin/logs.store.ts

- State: `defaultLogs`, `specialLogs`, `pricingType`, `selectedProduct`, `selectedUser`, `pagination`, `modalPagination`
- Actions: `fetchLogs()`, `fetchDefaultLogsByProduct()`, `fetchSpecialLogsByProduct()`, `fetchSpecialLogsByUser()`, `setPricingType()`, `clearModal()`

### admin/settings/category.store.ts

- State: `categories`, `pagination`, `isLoading`, `error`
- Getters: `totalCategories`, `activeCategories`, `inactiveCategories`
- Actions: `getCategories()`, `getCategoryById()`, `createCategory()`, `updateCategory()`, `toggleCategoryActive()`, `deleteCategory()`

### admin/settings/users.store.ts

- State: `users`, `userFullName`, `pagination`, `isLoading`, `error`
- Getters: `totalUsers`, `activeUsers`, `verifiedUsers`, `getUsersByRole()`
- Actions: `getUsers()`, `getUserFullName()`, `getUserById()`, `adminGetUserById()`, `adminUpdateUserById()`, `toggleActive()`, `adminChangeRole()`, `verifiredUser()`

---

## 5. API Client (Axios)

- Base URL: `VITE_API_BASE_URL` (จาก env)
- Timeout: 10 วินาที
- Request interceptor: inject `Bearer {access_token}` จาก localStorage
- Response interceptor (401):
  1. ถ้าไม่มี refresh token → clear tokens → redirect `/login`
  2. ถ้ากำลัง refresh อยู่ → queue request
  3. ถ้ายังไม่ได้ refresh → POST `/auth/refresh` → update tokens → retry original request
  4. ถ้า refresh ล้มเหลว → clear tokens → redirect `/login`
- Error handling: log ตาม status code (403, 404, 500)

---

## 6. UI Components

### Base Components (ไม่มี VeeValidate)

`BaseInput`, `BaseSelect`, `BaseMultiSelect`, `BaseCheckbox`, `BaseToggle`, `BaseTextarea`, `BaseTable`, `BaseModal`, `BaseFileUpload`, `BaseDatePicker`, `BaseAutocomplete`, `DrugTypeBadge`, `LoadingOverlay`

### V-Components (VeeValidate-wrapped)

`VInput`, `VSelect`, `VMultiSelect`, `VCheckbox`, `VDatePicker`, `VFileUpload`, `VTextarea`, `VAutocomplete`

### Layout Components

`Navbar`, `Footer`, `AdminSidebar`

### Feature Components

`ProductDetailModal`, `MiniCart`, `NotificationBell`

---

## 7. Form Validation (VeeValidate)

- Rules: `required`, `email`, `min`, `confirmed`, `password` (custom: min 8 chars)
- Error messages: ภาษาไทย (ไม่แสดงชื่อ field)
- Validate on: blur + change + model update (ไม่ validate ทุก keystroke)

---

## 8. Environment Variables (Frontend)

```env
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_APP_NAME=Phanadrug
VITE_APP_VERSION=1.0.0
VITE_S3_BUCKET_URL=                    # optional, สำหรับ file uploads
```

---

## 9. Scripts

```bash
npm run dev          # Vite dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run check-build  # Check build status
```

---

## 10. สถานะการพัฒนา (Frontend)

### ✅ เสร็จแล้ว

- Authentication flow ครบ (login, register, register complete, forgot password, reset password, verify email)
- Route guards (auth, admin, guest-only)
- Token refresh อัตโนมัติ (Axios interceptor)
- Admin dashboard structure
- Admin inventory management (product list + edit + toggle active + category filter)
- Admin category management (CRUD + toggle active)
- Admin user management (list, edit, toggle active, change role, verify, reset password)
- Admin special pricing matrix (view + bulk edit)
- Admin pricing audit logs (default + special, filter by product/user/date, modal detail)
- Reusable UI components (Base + VeeValidate-wrapped)
- Thai language support (validation messages, currency formatting, date formatting)
- Toast notifications
- Responsive layouts (DefaultLayout, AdminLayout)

### 🔲 ยังไม่ได้ทำ / TODO (ใช้ mock data หรือ placeholder)

- Cart → ใช้ mock data + localStorage (ต้องเชื่อม API)
- Notifications → ใช้ mock data + polling (ต้องเชื่อม API)
- Checkout flow → มี view แต่ยังไม่มี logic จริง
- Order management → มี view แต่ใช้ mock data
- Product detail (customer) → มี view แต่ยังไม่สมบูรณ์
- Profile update → มี view แต่ยังไม่เชื่อม API
- Security (change password) → มี view แต่ยังไม่เชื่อม API
- Address book → มี view แต่ยังไม่เชื่อม API
- Wishlist → มี view แต่ยังไม่มี logic
- Admin dashboard analytics/charts → มี ApexCharts แต่ยังไม่มีข้อมูลจริง
- Admin order management → มี view แต่ใช้ mock data
- Product public listing → ดึงข้อมูลจริงแล้วแต่ยังไม่มี filter/search UI ที่สมบูรณ์
- File upload (prescription, profile image) → มี component แต่ยังไม่เชื่อม storage
- Payment integration → ยังไม่มี

---

## 11. Coding Conventions & Patterns

### API Call Pattern (ทุก store ใช้รูปแบบนี้)

```typescript
// Store action
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

### Component Pattern

- ใช้ `<script setup lang="ts">` เสมอ (Composition API)
- Import types ด้วย `import type { ... }`
- ใช้ `@/` alias เสมอ (ไม่ใช้ relative path ยาวๆ)

### API Module Pattern

```typescript
// src/api/admin/something.ts
export const somethingApi = {
  getAll: (params?: Params) => apiClient.get<Response>("/endpoint", { params }),
  getById: (id: number) => apiClient.get<Response>(`/endpoint/${id}`),
  create: (data: CreatePayload) => apiClient.post<Response>("/endpoint", data),
  update: (id: number, data: UpdatePayload) =>
    apiClient.put<Response>(`/endpoint/${id}`, data),
  delete: (id: number) => apiClient.delete(`/endpoint/${id}`),
};
```

### Naming Conventions

- ไฟล์ Vue: PascalCase (AdminInventoryView.vue, BaseTable.vue)
- ไฟล์ TS: camelCase หรือ kebab-case (auth.store.ts, product-price.routes.ts)
- Store: `use{Name}Store` (useAuthStore, useProductStore)
- Composable: `use{Name}` (useAuth, useCart, useToast)
- API module: `{name}Api` (authApi, productsApi, usersApi)
- Route constants: UPPER_CASE ใน ROUTES object

### Toast Notifications

- ใช้ `useToast()` composable เสมอ (ไม่ import vue-toastification โดยตรง)
- Success: `toast.success("ข้อความ")`
- Error: `toast.error("ข้อความ")`

---

## 12. Business Logic Rules (Frontend)

### Auth Guard

- DEMO role ถือว่าเป็น admin (`isAdmin = role === "ADMIN" || role === "DEMO"`)
- ถ้า token หมดอายุ → Axios interceptor refresh อัตโนมัติ → retry request
- `/register/complete` — ต้องมี `sessionStorage.fromRegister` ถึงจะเข้าได้ (ป้องกัน direct access)

### Cart (ปัจจุบัน mock)

- ราคาในตะกร้าขึ้นอยู่กับ `auth.roleName` (retail/wholesale/clinic) — ดึงจาก MOCK_PRICES
- Free shipping เมื่อ subtotal ≥ 1000 บาท
- ไม่เกิน stock ที่มี

### Product Pricing Display

- ถ้า `is_special_pricing_enabled = true` → แสดงราคาพิเศษของ user นั้น
- ถ้าไม่มีราคาพิเศษ → แสดง `default_price`

### Admin Pricing Matrix

- `productPricesApi.getProductPrices({ product_ids: [...] })` — POST ไม่ใช่ GET
- Response เป็น matrix: `[{ product_id, data: [{ user_id, price }] }]`
- Update เป็น bulk: `[{ product_id, user_id, price }]`

---

## 13. Known Issues & Gotchas

### TypeScript

- `tsconfig.json` มี `"ignoreDeprecations": "6.0"` — ทำให้ getDiagnostics แสดง error แต่ build ได้ปกติ
- บาง store ใช้ `as unknown as User[]` cast เพราะ API response type ไม่ตรงกับ User interface

### Cart Store

- ใช้ `MOCK_PRODUCTS` และ `MOCK_PRICES` จาก `__mocks__/products.ts` — ไม่ใช่ข้อมูลจริง
- `auth.roleName` ใน cart store อาจ undefined ถ้า user ยังไม่ได้ login

### Notification Store

- ใช้ mock data จาก `__mocks__/users.ts` — polling ทุก 30 วินาที แต่ไม่ได้ call API จริง

### Router

- Admin guard check: `role === "ADMIN" || role === "DEMO"` — DEMO เข้า admin ได้แต่แก้ไขไม่ได้ (backend บังคับ)
- `scrollBehavior: () => ({ top: 0 })` — scroll to top ทุกครั้งที่เปลี่ยน route

### API Constants

- `ADMIN.PRODUCT_PRICES.BASE` = `/admin/product-prices` — ใช้ POST สำหรับ get (ไม่ใช่ GET)
- `ADMIN.SETTINGS.USERS.FULLNAME` = `admin/users/user-fullname` — ขาด `/` นำหน้า (อาจเป็น bug)

---

## 14. Next Priority Tasks (แนะนำลำดับการพัฒนา)

1. **Cart → API** — เชื่อม cart store กับ backend API (ต้องสร้าง backend ก่อน)
2. **Checkout flow** — implement logic จริงใน CheckoutView.vue
3. **Order management** — เชื่อม OrderListView + OrderDetailView กับ API
4. **Profile** — เชื่อม ProfileView, SecurityView, AddressBookView กับ API
5. **Notifications** — เชื่อม notification store กับ API
6. **Product detail** — สมบูรณ์ ProductDetailView.vue (customer)
7. **Admin dashboard** — เพิ่ม charts จริงใน AdminDashboardView.vue
8. **Product list filter** — เพิ่ม search/filter UI ที่สมบูรณ์ใน ProductListView.vue

---

## 15. Instructions สำหรับ Kiro Agent

### เมื่อเพิ่ม feature ใหม่

1. สร้าง type ใน `src/types/` ก่อน
2. สร้าง API function ใน `src/api/`
3. Export จาก `src/api/index.ts`
4. สร้าง/อัปเดต store ใน `src/stores/`
5. สร้าง/อัปเดต view ใน `src/views/`
6. เพิ่ม route ใน `src/router/routes/`

### เมื่อสร้าง form ใหม่

- ใช้ `VeeValidate` + V-components (`VInput`, `VSelect`, etc.)
- ใช้ `<Form>` และ `<Field>` จาก vee-validate
- Error messages ต้องเป็นภาษาไทย

### เมื่อสร้าง admin table ใหม่

- ใช้ `BaseTable.vue` component
- ใช้ store pattern ที่มีอยู่เป็น template (เช่น category.store.ts)
- ต้องมี pagination, search, loading state

### เมื่อ run dev

```bash
cd frontend && npm run dev
```

### ไฟล์ที่ต้องระวังเมื่อแก้ไข

- `src/api/client.ts` — อย่าแก้ interceptor logic โดยไม่จำเป็น
- `src/router/index.ts` + `auth.guard.ts` — กระทบ auth flow ทั้งระบบ
- `src/stores/auth.store.ts` — กระทบทุก component ที่ใช้ auth
- `src/constants/api.ts` — ต้อง sync กับ backend routes เสมอ
