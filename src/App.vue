<script setup lang="ts">
import { watch } from "vue";
import { RouterView } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";

const authStore = useAuthStore();

const BUGLENSE_KEY =
  import.meta.env.VITE_BUGLENSE_API_KEY || "bl_oun620fcps04yc5zqpibdj";
const BUGLENSE_URL =
  import.meta.env.VITE_BUGLENSE_API_URL || "https://api.buglense.phanadrug.com";

function loadBuglense() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  if (document.querySelector("buglense-widget")) return;

  const existingScript =
    document.querySelector('script[src*="buglense.js"]') ||
    document.querySelector("script[data-api-key]");

  if (existingScript) {
    const widget = document.createElement("buglense-widget");
    widget.setAttribute("api-key", BUGLENSE_KEY);
    widget.setAttribute("api-url", BUGLENSE_URL);
    document.body.appendChild(widget);
  } else {
    const script = document.createElement("script");
    script.src = `${BUGLENSE_URL}/buglense.js`;
    script.setAttribute("data-api-key", BUGLENSE_KEY);
    script.setAttribute("data-api-url", BUGLENSE_URL);
    script.async = true;
    document.body.appendChild(script);
  }
}

function unloadBuglense() {
  if (typeof document === "undefined") return;
  const widget = document.querySelector("buglense-widget");
  if (widget) {
    widget.remove();
  }
}

// Watch the isAdmin getter to dynamically add/remove the widget
watch(
  () => authStore.isAdmin,
  (isAdmin) => {
    if (isAdmin) {
      loadBuglense();
    } else {
      unloadBuglense();
    }
  },
  { immediate: true },
);
</script>

<template>
  <RouterView />
</template>
