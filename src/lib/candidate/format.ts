/** Formats a date string safely — returns a fallback instead of "Invalid Date"
 * when the value is missing or unparseable. */
export function formatDate(value: string | null | undefined, fallback = "—") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return fallback;

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
