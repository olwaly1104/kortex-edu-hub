// Detect Lovable preview (editor) vs published site / custom domain.
// Preview hostnames look like: id-preview--<uuid>.lovable.app
// Anything else (including <slug>.lovable.app and custom domains) is treated as published.
export function isPreviewHost(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname || "";
  return host.startsWith("id-preview--");
}

export function isPublishedHost(): boolean {
  return !isPreviewHost();
}
