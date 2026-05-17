const SUPPORTED_LOCALES = ["en-US", "de-DE", "ja-JP"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Case-insensitive: 'EN-US' resolves to 'en-US'.
 * Partial language code: 'de' resolves to 'de-DE'.
 * Unsupported or empty: falls back to 'en-US'.
 */
export function getLocale(requested: string): SupportedLocale {
  const trimmed = requested.trim();

  const exact = SUPPORTED_LOCALES.find(
    (l) => l.toLowerCase() === trimmed.toLowerCase(),
  );
  if (exact) return exact;

  const lang = trimmed.split("-")[0].toLowerCase();
  if (lang) {
    const partial = SUPPORTED_LOCALES.find(
      (l) => l.split("-")[0].toLowerCase() === lang,
    );
    if (partial) return partial;
  }

  return "en-US";
}

export function formatDate(date: Date, locale: SupportedLocale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
