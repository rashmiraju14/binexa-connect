export const CUSTOM_SITE_ORIGIN = "https://binexaconnect.com";
export const LEGACY_SITE_ORIGIN = "https://binexa-connect-2.vercel.app";
export const WWW_SITE_ORIGIN = "https://www.binexaconnect.com";

function isLoopback(url: URL) {
  return ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
}

function parseOrigin(value: string) {
  const url = new URL(value);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      (url.protocol !== "https:" && !(url.protocol === "http:" && isLoopback(url)))) {
    throw new Error("Invalid site origin");
  }
  return url.origin;
}

/** Canonical metadata origin. Existing production remains the fallback until cutover. */
export function getSiteOrigin(
  configured = process.env.NEXT_PUBLIC_SITE_URL,
  environment: string | undefined = process.env.NODE_ENV,
) {
  if (!configured?.trim()) {
    return environment === "production" ? LEGACY_SITE_ORIGIN : "http://localhost:3000";
  }
  try {
    return parseOrigin(configured.trim());
  } catch {
    throw new Error("NEXT_PUBLIC_SITE_URL must be an HTTPS origin or an HTTP loopback origin, without a path, query, or credentials");
  }
}

/** Keep OAuth state, PKCE/session cookies, and callback URLs on the originating host. */
export function getAuthOrigin(
  requestUrl: string,
  configured = process.env.NEXT_PUBLIC_SITE_URL,
  environment: string | undefined = process.env.NODE_ENV,
  additionalOrigins: string[] = [],
) {
  const url = new URL(requestUrl);
  if (url.username || url.password) throw new Error("Unsupported authentication origin");
  const allowed = new Set([
    getSiteOrigin(configured, environment), CUSTOM_SITE_ORIGIN, LEGACY_SITE_ORIGIN, WWW_SITE_ORIGIN,
    ...additionalOrigins.map(parseOrigin),
  ]);
  if (allowed.has(url.origin)) return url.origin;
  if (environment !== "production" && isLoopback(url) && ["http:", "https:"].includes(url.protocol)) return url.origin;
  throw new Error("Unsupported authentication origin");
}

const authPaths = ["/api", "/auth", "/sign-in", "/sign-up", "/join-discord", "/access-granted", "/member"];
const authParameters = ["auth", "discord", "verification", "code", "state", "token_hash", "access_token", "refresh_token", "error", "error_description", "recovery"];

/** Disabled by default. Does not move transactions or authenticated legacy sessions. */
export function getLegacyDomainRedirect(
  requestUrl: string,
  options: {
    enabled?: boolean;
    configuredOrigin?: string;
    method?: string;
    cookieNames?: string[];
  } = {},
): URL | null {
  if (!(options.enabled ?? process.env.ENABLE_LEGACY_DOMAIN_REDIRECT === "true")) return null;
  if (!["GET", "HEAD"].includes(options.method ?? "GET")) return null;
  const source = new URL(requestUrl);
  if (source.origin !== LEGACY_SITE_ORIGIN) return null;
  const destinationOrigin = getSiteOrigin(options.configuredOrigin);
  // Never redirect the existing site to localhost, itself, or an unverified alternative.
  if (destinationOrigin !== CUSTOM_SITE_ORIGIN) return null;
  let path: string;
  try {
    path = decodeURIComponent(source.pathname).replace(/\/+/g, "/").replace(/\/+$/, "").toLowerCase() || "/";
  } catch {
    return null;
  }
  if (authPaths.some(prefix => path === prefix || path.startsWith(prefix + "/"))) return null;
  if (authParameters.some(name => source.searchParams.has(name))) return null;
  if (options.cookieNames?.some(name => /^sb-.+-auth-token(?:\.\d+)?$/.test(name) || name.startsWith("discord_oauth_"))) return null;
  const destination = new URL(destinationOrigin);
  destination.pathname = source.pathname;
  destination.search = source.search;
  destination.hash = source.hash;
  return destination;
}
