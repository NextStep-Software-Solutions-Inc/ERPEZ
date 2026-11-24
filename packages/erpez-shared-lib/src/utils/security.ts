/**
 * Displays a security warning in the browser console in production environments
 * to protect users against Self-XSS (Social Engineering / Scam) attacks.
 */
export function initConsoleSecurityWarning(options?: { force?: boolean }): void {
  if (typeof window === 'undefined') return;

  const win = window as unknown as { __ERPEZ_SECURITY_WARNING_INITIALIZED__?: boolean };
  if (win.__ERPEZ_SECURITY_WARNING_INITIALIZED__) return;

  const proc = typeof globalThis !== 'undefined' ? (globalThis as any).process : undefined;
  const isProd =
    options?.force ||
    proc?.env?.NODE_ENV === 'production' ||
    Boolean(typeof import.meta !== 'undefined' && (import.meta as any)?.env?.PROD);

  if (!isProd) return;

  win.__ERPEZ_SECURITY_WARNING_INITIALIZED__ = true;

  // Use console.warn so the banner is not stripped by minifiers configured to drop console.log
  const warn = console.warn || console.log;

  warn(
    '%cStop!',
    'color: #ef4444; font-size: 48px; font-weight: 900; -webkit-text-stroke: 1px black; font-family: sans-serif;'
  );
  warn(
    '%cThis is a browser feature intended only for developers. If someone told you to copy and paste code or tokens here, it is a SCAM.\n\nPasting code here can compromise your account and organization data.',
    'font-size: 14px; font-weight: 600; color: #1f2937; line-height: 1.5; font-family: sans-serif;'
  );
  warn(
    '%cFor more information, see https://en.wikipedia.org/wiki/Self-XSS',
    'font-size: 12px; color: #6b7280; font-style: italic;'
  );
}
