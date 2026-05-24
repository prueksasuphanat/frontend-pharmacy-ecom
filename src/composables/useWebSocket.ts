import { ref } from "vue";

interface WsOptions {
  url: string;
  onMessage: (data: any) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebSocket(options: WsOptions) {
  const isConnected = ref(false);
  let ws: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let reconnectAttempts = 0;
  let isExplicitDisconnect = false;
  const MAX_RECONNECT_ATTEMPTS = 10;
  const BASE_DELAY_MS = 1_000;

  function connect() {
    if (ws && ws.readyState === WebSocket.OPEN) return;

    isExplicitDisconnect = false;
    ws = new WebSocket(options.url);

    ws.onopen = () => {
      isConnected.value = true;
      reconnectAttempts = 0;
      options.onConnected?.();
    };

    ws.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        if (parsed.type === "ping") {
          ws?.send(JSON.stringify({ type: "pong" }));
          return;
        }
        options.onMessage(parsed);
      } catch {}
    };

    ws.onclose = (event) => {
      isConnected.value = false;
      options.onDisconnected?.();

      if (isExplicitDisconnect || event.code === 4001) return;

      scheduleReconnect();
    };

    ws.onerror = () => {
      isConnected.value = false;
    };
  }

  function scheduleReconnect() {
    if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS || isExplicitDisconnect)
      return;

    const delay = Math.min(BASE_DELAY_MS * 2 ** reconnectAttempts, 30_000);
    reconnectAttempts++;

    reconnectTimer = setTimeout(() => {
      connect();
    }, delay);
  }

  function disconnect() {
    isExplicitDisconnect = true;
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    reconnectAttempts = 0;
    ws?.close();
    ws = null;
    isConnected.value = false;
  }

  return { isConnected, connect, disconnect };
}
