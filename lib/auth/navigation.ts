export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://binexa.local");
    if (url.origin !== "https://binexa.local" || ["/sign-in", "/sign-up", "/auth/confirm"].includes(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

export function isMemberPath(path: string) {
  return /^\/(explore|offerings|join|resources|events|discussions|habits|lounge|start|member)(\/|$)/.test(path);
}

export function isDiscordPath(path: string) {
  return path === "/api/discord/connect" || path === "/join-discord";
}
