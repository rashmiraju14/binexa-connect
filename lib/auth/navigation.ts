export function safeNextPath(value: string | null | undefined, fallback = "/") {
  if (!value || !value.startsWith("/") || value.startsWith("//") || /[\\\x00-\x20]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://binexa.local");
    if (url.origin !== "https://binexa.local" || ["/sign-in", "/sign-up", "/auth/confirm", "/auth/callback", "/auth/sign-in"].includes(url.pathname)) return fallback;
    return url.pathname + url.search + url.hash;
  } catch { return fallback; }
}

export const publicArticleSlugs = [
  "healthy-habits-that-stick",
  "understanding-weight-care",
  "spotting-credible-wellness-info",
] as const;

export function isPublicArticle(slug: string) {
  return publicArticleSlugs.some(publicSlug => publicSlug === slug);
}

export function isMemberPath(path: string) {
  const normalized = path.replace(/\/$/, "");
  const article = /^\/resources\/([^/]+)$/.exec(normalized);
  if (article) {
    try { return !isPublicArticle(decodeURIComponent(article[1])); } catch { return true; }
  }
  return /^\/(explore|offerings|join|resources|events|discussions|habits|lounge|start|member)(\/|$)/.test(path);
}

export function isDiscordPath(path: string) {
  return path === "/api/discord/connect" || path === "/join-discord";
}
