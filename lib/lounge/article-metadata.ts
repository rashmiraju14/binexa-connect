export const peptideArticleUrl = "https://www.nyp.org/healthmatters/peptides-and-skin-care-benefits-risks-and-what-a-dermatologist-want-you-to-know";

/** Read publisher dates only from Article structured data, not navigation or related stories. */
export function extractArticleDates(html: string) {
  const dates: { published?: string; updated?: string } = {};
  function visit(value: unknown) {
    if (!value || typeof value !== "object") return;
    if (Array.isArray(value)) { value.forEach(visit); return; }
    const node = value as Record<string, unknown>;
    const types = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    if (types.some(type => typeof type === "string" && /^(Article|NewsArticle|BlogPosting|MedicalScholarlyArticle)$/.test(type))) {
      for (const [field, key] of [["datePublished", "published"], ["dateModified", "updated"]] as const) {
        const date = node[field];
        if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(date) && !Number.isNaN(Date.parse(date))) dates[key] = date;
      }
    }
    if (node["@graph"]) visit(node["@graph"]);
  }
  for (const script of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try { visit(JSON.parse(script[1])); } catch { /* Preserve known dates if source markup changes. */ }
  }
  return dates;
}

export async function getPeptideArticleMetadata() {
  const fallback = { published: "2026-10-09", updated: undefined as string | undefined, checkedAt: undefined as string | undefined };
  try {
    const response = await fetch(peptideArticleUrl, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return fallback;
    const dates = extractArticleDates(await response.text());
    // HTTP Date belongs to the cached source response, not to this page render.
    const fetchedAt = response.headers.get("date");
    return { ...fallback, ...dates, checkedAt: fetchedAt && !Number.isNaN(Date.parse(fetchedAt)) ? new Date(fetchedAt).toISOString() : undefined };
  } catch { return fallback; }
}
