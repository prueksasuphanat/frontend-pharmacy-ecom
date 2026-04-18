<script setup lang="ts">
import { ref } from "vue";
import { MOCK_ROLES, MOCK_USERS } from "@/__mocks__/users";
import { MOCK_PRICING_RULES } from "@/__mocks__/inventory";
import {
  Users,
  DollarSign,
  Shield,
  Edit,
  Plus,
  Percent,
} from "lucide-vue-next";

// TODO: GET /admin/roles, GET /admin/users, GET /admin/pricing-rules

const tab = ref<"roles" | "pricing" | "users">("roles");
const editingRule = ref<string | null>(null);

function updateRule(id: string) {
  // TODO: PATCH /admin/pricing-rules/:roleId { discount_type, discount_value }
  editingRule.value = null;
  alert("TODO: บันทึก pricing rule");
}

function updateUserRole(userId: string, newRole: string) {
  // TODO: PATCH /admin/users/:id/role { role_id: newRole }
  alert(`TODO: เปลี่ยน role user ${userId} → ${newRole}`);
}

const tabs = [
  { id: "roles", label: "บทบาท & ราคา", icon: DollarSign },
  { id: "pricing", label: "ราคาแต่ละ Role", icon: Percent },
  { id: "users", label: "ผู้ใช้งาน", icon: Users },
];
</script>

<template>
  <div>
    <h1 class="page-title mb-6">ตั้งค่าระบบ</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 bg-secondary-100 p-1 rounded-xl w-fit">
      <button
        v-for="t in tabs"
        :key="t.id"
        @click="tab = t.id as any"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          tab === t.id
            ? 'bg-white text-secondary-900 shadow-sm'
            : 'text-secondary-500 hover:text-secondary-700',
        ]"
      >
        <component :is="t.icon" class="w-4 h-4" />{{ t.label }}
      </button>
    </div>

    <!-- Roles tab -->
    <div v-if="tab === 'roles'" class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div v-for="role in MOCK_ROLES" :key="role.id" class="card">
          <div class="flex items-center gap-2 mb-2">
            <div
              class="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center"
            >
              <Shield class="w-4 h-4 text-primary-600" />
            </div>
            <span v-if="role.is_admin" class="badge badge-red text-xs"
              >Admin</span
            >
          </div>
          <h3 class="font-bold text-secondary-900">{{ role.label }}</h3>
          <p class="text-xs text-secondary-400 mt-0.5">
            {{ role.description }}
          </p>
          <div
            class="mt-3 pt-3 border-t border-secondary-50 flex items-center justify-between"
          >
            <div>
              <p class="text-2xl font-bold text-primary-600">
                {{ role.user_count }}
              </p>
              <p class="text-xs text-secondary-400">ผู้ใช้</p>
            </div>
            <button class="btn-ghost text-xs text-secondary-400 gap-1">
              <Edit class="w-3 h-3" /> แก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Pricing rules tab -->
    <div v-if="tab === 'pricing'" class="space-y-4">
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-secondary-900">กำหนดราคาตาม Role</h3>
          <p class="text-xs text-secondary-400">
            TODO: เชื่อม PATCH /admin/pricing-rules/:roleId
          </p>
        </div>
        <div class="space-y-3">
          <div
            v-for="rule in MOCK_PRICING_RULES"
            :key="rule.id"
            class="flex items-center gap-4 p-4 bg-secondary-50 rounded-xl"
          >
            <div
              class="w-10 h-10 bg-primary-100 rounded-xl flex items-center justify-center shrink-0"
            >
              <Percent class="w-5 h-5 text-primary-600" />
            </div>
            <div class="flex-1">
              <p class="font-semibold text-secondary-900">
                {{ rule.role_label }}
              </p>
              <p class="text-xs text-secondary-400">
                {{
                  rule.discount_type === "percentage"
                    ? `ลด ${rule.discount_value}%`
                    : `ลด ฿${rule.discount_value}`
                }}
              </p>
            </div>
            <div v-if="editingRule === rule.id" class="flex items-center gap-2">
              <input
                type="number"
                :value="rule.discount_value"
                class="input w-20 text-sm py-1.5"
              />
              <button
                @click="updateRule(rule.id)"
                class="btn-primary text-xs py-1.5"
              >
                บันทึก
              </button>
              <button
                @click="editingRule = null"
                class="btn-secondary text-xs py-1.5"
              >
                ยกเลิก
              </button>
            </div>
            <button
              v-else
              @click="editingRule = rule.id"
              class="btn-secondary text-xs gap-1"
            >
              <Edit class="w-3 h-3" /> แก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Users tab -->
    <div v-if="tab === 'users'" class="space-y-4">
      <div class="card p-0 overflow-hidden">
        <table class="table">
          <thead>
            <tr>
              <th>อีเมล</th>
              <th>ชื่อ</th>
              <th>Role</th>
              <th>อีเมลยืนยัน</th>
              <th>สถานะ</th>
              <th>เปลี่ยน Role</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in MOCK_USERS" :key="user.id">
              <td class="text-sm">{{ user.email }}</td>
              <td class="text-sm text-secondary-600">
                {{ user.full_name || "-" }}
              </td>
              <td>
                <span class="badge badge-teal text-xs">{{
                  user.role_label
                }}</span>
              </td>
              <td>
                <span
                  v-if="user.is_email_verified"
                  class="badge badge-green text-xs"
                  >✓</span
                >
                <span v-else class="badge badge-red text-xs">ยังไม่ยืนยัน</span>
              </td>
              <td>
                <span
                  :class="[
                    'badge text-xs',
                    user.is_active ? 'badge-green' : 'badge-red',
                  ]"
                  >{{ user.is_active ? "ใช้งาน" : "ระงับ" }}</span
                >
              </td>
              <td>
                <!-- TODO: PATCH /admin/users/:id/role -->
                <select
                  :value="user.role_name"
                  @change="
                    updateUserRole(
                      user.id,
                      ($event.target as HTMLSelectElement).value,
                    )
                  "
                  class="input py-1 w-auto text-xs"
                >
                  <option v-for="r in MOCK_ROLES" :key="r.id" :value="r.name">
                    {{ r.label }}
                  </option>
                </select>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
