export function formatDate(iso: string, locale: string): string {
  try {
    return new Date(iso).toLocaleString(locale.startsWith("es") ? "es" : "en", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}
