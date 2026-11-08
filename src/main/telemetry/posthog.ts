/**
 * Community Edition telemetry compatibility layer.
 *
 * The CE intentionally has no analytics transport, device identifier,
 * background timer, or remote telemetry endpoint.
 */

const SENSITIVE_PROPERTY_RE = /url|uri|query|prompt|content|text|token|secret|key|password|credential|email|domain/i;
const SENSITIVE_STRING_VALUE_RE =
  /https?:\/\/|www\.|[^\s@]+@[^\s@]+\.[^\s@]+|bearer\s+\S+|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.|(?:sk|pk|rk|gh[pousr]|xox[baprs])-[-_A-Za-z0-9]{12,}/i;

export function sanitizeTelemetryProperties(
  properties: Record<string, unknown>,
  allowedKeys?: ReadonlySet<string>,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (allowedKeys && !allowedKeys.has(key)) continue;
    if (!allowedKeys?.has(key) && SENSITIVE_PROPERTY_RE.test(key)) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      if (typeof value === "string" && SENSITIVE_STRING_VALUE_RE.test(value)) {
        continue;
      }
      safe[key] = typeof value === "string" ? value.slice(0, 120) : value;
    }
  }
  return safe;
}

// No-op compatibility exports. Existing local features may continue to call
// these helpers without creating network requests or collecting analytics.
export function trackEvent(
  _event: string,
  _properties: Record<string, unknown> = {},
): void {}

export function trackToolCall(_toolName: string, _pageType?: string): void {}

export function trackProviderConfigured(_providerId: string): void {}

export function trackPageTypeDetected(_pageType: string): void {}

export function trackSettingChanged(_key: string): void {}

export function trackApprovalModeChanged(_mode: string): void {}

export function trackBookmarkAction(
  _action: "save" | "remove" | "folder_create" | "folder_remove" | "export" | "import",
): void {}

export function trackVaultAction(
  _action: "credential_added" | "credential_removed" | "login_fill" | "totp_fill",
): void {}

export function trackExtractionFailed(_domain: string, _reason: string): void {}

export function trackPremiumFunnel(
  _step: string,
  _context?: Record<string, unknown>,
): void {}

export function startTelemetry(): void {}

export function stopTelemetry(): void {}
