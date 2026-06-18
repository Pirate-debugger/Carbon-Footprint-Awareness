/**
 * Safely escapes HTML special characters to prevent Cross-Site Scripting (XSS) vulnerabilities.
 */
export function escapeHTML(str: string): string {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, (tag) => {
    const chars: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    };
    return chars[tag] || tag;
  });
}
