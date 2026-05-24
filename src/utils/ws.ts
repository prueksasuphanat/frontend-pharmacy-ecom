export function getWsUrl(path: string, token: string): string {
  const apiBase =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:3000/api/v1";

  try {
    const url = new URL(apiBase, window.location.href);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    url.pathname = path;
    url.searchParams.set("token", token);
    return url.toString();
  } catch (e) {
    const fallback = "ws://localhost:3000";
    return `${fallback}${path}?token=${encodeURIComponent(token)}`;
  }
}
