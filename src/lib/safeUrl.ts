// Only https links are rendered as hrefs/srcs. Blocks javascript:, data: and
// other schemes that could turn a CMS field into an attack vector.
export function safeHttpUrl(value?: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
