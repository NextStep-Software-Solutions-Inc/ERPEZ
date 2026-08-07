const HTML_ESCAPE_MAP: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '').replace(/[&<>"']/g, (character) => {
    return HTML_ESCAPE_MAP[character] ?? character
  })
}

export function neutralizeSpreadsheetFormula(
  value: string | null | undefined,
): string {
  const normalized = String(value ?? '')

  return /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized
}

export function toSafeSpreadsheetCell(
  value: string | null | undefined,
): string {
  return escapeHtml(neutralizeSpreadsheetFormula(value))
}
