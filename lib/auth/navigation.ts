export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://binexa.local");
    if (url.origin !== "https://binexa.local" || ["/sign-in", "/sign-up", "/auth/confirm", "/auth/callback", "/auth/sign-in"].includes(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

// Published educational content is public. Discussions and account pages require a session.
export function isDiscussionPath(path: string) {
  try {
    return /^\/discussions(\/|$)/.test(decodeURIComponent(path));
  } catch { return false; }
}

export function isMemberPath(path: string) {
  return /^\/member(\/|$)/.test(path) || isDiscussionPath(path);
}
