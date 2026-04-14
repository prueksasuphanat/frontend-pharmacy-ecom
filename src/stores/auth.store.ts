import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { MOCK_USERS, type User } from '@/mocks/users'

// TODO: Replace mock auth with real API calls to /auth/login, /auth/register, etc.

export type MockRole = 'admin' | 'wholesale' | 'clinic' | 'retail'

const DEMO_ACCOUNTS: Record<string, { password: string; userId: string }> = {
  'admin@pharma.com':         { password: 'admin1234',     userId: 'user-admin-001'     },
  'somchai@example.com':      { password: 'retail1234',    userId: 'user-retail-001'    },
  'wholesale@medshop.com':    { password: 'wholesale1234', userId: 'user-wholesale-001' },
  'clinic@bkkhospital.com':   { password: 'clinic1234',    userId: 'user-clinic-001'    },
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(
    JSON.parse(localStorage.getItem('mock_user') || 'null')
  )
  const isLoading = ref(false)
  const loginError = ref('')

  const isLoggedIn  = computed(() => !!currentUser.value)
  const isAdmin     = computed(() => currentUser.value?.role_name === 'admin')
  const isEmailVerified = computed(() => currentUser.value?.is_email_verified ?? false)
  const roleName    = computed(() => currentUser.value?.role_name ?? 'retail')

  // TODO: replace with: await axios.post('/auth/login', { email, password })
  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    loginError.value = ''
    await new Promise(r => setTimeout(r, 600)) // simulate network

    const account = DEMO_ACCOUNTS[email]
    if (!account || account.password !== password) {
      loginError.value = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'
      isLoading.value = false
      return false
    }

    const user = MOCK_USERS.find(u => u.id === account.userId) ?? null
    currentUser.value = user
    localStorage.setItem('mock_user', JSON.stringify(user))
    isLoading.value = false
    return true
  }

  // TODO: replace with: await axios.post('/auth/register', data)
  async function register(email: string, _password: string): Promise<boolean> {
    isLoading.value = true
    await new Promise(r => setTimeout(r, 800))
    // Mock: auto-create retail user
    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      full_name: '',
      role_id: 'role-retail',
      role_name: 'retail',
      role_label: 'ลูกค้าทั่วไป',
      is_email_verified: false,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    currentUser.value = newUser
    localStorage.setItem('mock_user', JSON.stringify(newUser))
    isLoading.value = false
    return true
  }

  // TODO: replace with: await axios.post('/auth/logout')
  function logout() {
    currentUser.value = null
    localStorage.removeItem('mock_user')
  }

  // Demo: switch role quickly for testing
  function switchDemoRole(role: MockRole) {
    const roleMap: Record<MockRole, string> = {
      admin:     'user-admin-001',
      wholesale: 'user-wholesale-001',
      clinic:    'user-clinic-001',
      retail:    'user-retail-001',
    }
    const user = MOCK_USERS.find(u => u.id === roleMap[role]) ?? null
    currentUser.value = user
    localStorage.setItem('mock_user', JSON.stringify(user))
  }

  return {
    currentUser, isLoading, loginError,
    isLoggedIn, isAdmin, isEmailVerified, roleName,
    login, register, logout, switchDemoRole,
  }
})
