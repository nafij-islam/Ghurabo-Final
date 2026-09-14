/**
 * SEO Text Sanitization & Truncation Utilities
 */

/**
 * Strip HTML tags and normalize extra whitespace
 */
export function sanitizePlainText(input?: string | null): string {
  if (!input) return '';
  return input
    .replace(/<[^>]*>/g, ' ') // Strip HTML tags
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Strip markdown links [text](url)
    .replace(/[*_~`#>-]/g, ' ') // Strip common markdown formatting
    .replace(/\s+/g, ' ') // Collapse multiple whitespace
    .trim();
}

/**
 * Truncate text cleanly at word boundary with an ellipsis
 */
export function truncateText(text?: string | null, maxLength = 160): string {
  const cleaned = sanitizePlainText(text);
  if (!cleaned || cleaned.length <= maxLength) return cleaned;

  // Find last space before maxLength
  const truncated = cleaned.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > maxLength * 0.6) {
    return truncated.slice(0, lastSpace).trim() + '...';
  }
  return truncated.trim() + '...';
}

/**
 * Generate contextual trip title adhering to the preferred formula:
 * {Trip Title} – Travel Guide & Budget | Ghurabo
 */
export function formatTripMetaTitle(tripTitle: string): string {
  const base = sanitizePlainText(tripTitle);
  const suffix = ' – Travel Guide & Budget';
  // Keep under ~60 characters total if possible
  if ((base + suffix).length > 60) {
    const trimmed = truncateText(base, 60 - suffix.length);
    return `${trimmed}${suffix}`;
  }
  return `${base}${suffix}`;
}
