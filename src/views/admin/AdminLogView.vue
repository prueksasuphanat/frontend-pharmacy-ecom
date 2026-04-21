<script setup lang="ts">
import { ref, computed } from "vue";
import { MOCK_AUDIT_LOGS } from "@/__mocks__/users";
import { Search } from "lucide-vue-next";
import { BaseInput } from "@/components/ui";

// TODO: GET /admin/logs?action=&page=

const search = ref("");
const page = ref(1);
const PAGE_SIZE = 15;

const filtered = computed(() => {
  if (!search.value) return MOCK_AUDIT_LOGS;
  const q = search.value.toLowerCase();
  return MOCK_AUDIT_LOGS.filter(
    (l) =>
      l.action.toLowerCase().includes(q) ||
      l.admin_email.toLowerCase().includes(q) ||
      l.target_id.toLowerCase().includes(q),
  );
});

const paginated = computed(() =>
  filtered.value.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
);

function fmtDate(d: string) {
  return new Date(d).toLocaleString("th-TH");
}
function prettyAction(a: string) {
  return a
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const actionColors: Record<string, string> = {
  UPDATE_PRICE_OVERRIDE: "badge-blue",
  UPDATE_USER_ROLE: "badge-purple",
  CREATE_PRODUCT: "badge-green",
  ORDER_STATUS_CHANGED: "badge-teal",
  PRESCRIPTION_REVIEWED: "badge-yellow",
  UPDATE_GLOBAL_RULE: "badge-red",
};
</script>

<template>
  <div>
    <div class="page-header mb-6">
      <h1 class="page-title">[TODO] บันทึกกิจกรรม (Audit Log)</h1>
      <!-- TODO: GET /admin/logs/export -->
      <span class="text-sm text-secondary-400"
        >{{ filtered.length }} รายการ</span
      >
    </div>

    <div class="card mb-4 flex gap-3">
      <BaseInput
        v-model="search"
        placeholder="ค้นหา action, admin, ID..."
        :icon="Search"
        class="flex-1"
      />
    </div>

    <div class="card p-0 overflow-hidden">
      <table class="table">
        <thead>
          <tr>
            <th>เวลา</th>
            <th>ผู้ดำเนินการ</th>
            <th>Action</th>
            <th>Target</th>
            <th>การเปลี่ยนแปลง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="log in paginated" :key="log.id">
            <td class="text-xs text-secondary-400 whitespace-nowrap">
              {{ fmtDate(log.changed_at) }}
            </td>
            <td class="text-sm text-secondary-700">{{ log.admin_email }}</td>
            <td>
              <span
                :class="[
                  'badge text-xs',
                  actionColors[log.action] || 'badge-teal',
                ]"
                >{{ prettyAction(log.action) }}</span
              >
            </td>
            <td class="text-xs text-secondary-600">
              <p>{{ log.target_type }}</p>
              <p class="font-mono text-secondary-400">{{ log.target_id }}</p>
            </td>
            <td class="text-xs max-w-xs">
              <div class="space-y-0.5">
                <div
                  v-if="Object.keys(log.old_value).length > 0"
                  class="text-danger"
                >
                  − {{ JSON.stringify(log.old_value) }}
                </div>
                <div
                  v-if="Object.keys(log.new_value).length > 0"
                  class="text-success"
                >
                  + {{ JSON.stringify(log.new_value) }}
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="paginated.length === 0">
            <td colspan="5" class="text-center text-secondary-400 py-8">
              ไม่พบรายการ
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
