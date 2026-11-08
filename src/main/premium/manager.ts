import { loadSettings } from "../config/settings";

/** Local Community Edition feature access and compatibility IPC contracts. */

const FREE_TOOL_ITERATION_LIMIT = 50;

// --- Premium feature definitions ---

/** Tools that require a premium subscription */
export const PREMIUM_TOOLS = new Set([
  "screenshot",
  "save_session",
  "load_session",
  "list_sessions",
  "delete_session",
  "flow_start",
  "flow_advance",
  "flow_status",
  "flow_end",
  "metrics",
  "extract_table",
  "vault_login",
  "vault_status",
  "vault_totp",
  "human_vault_list",
  "human_vault_fill",
  "human_vault_remove",
  "memory_note_create",
  "memory_note_append",
  "memory_note_list",
  "memory_note_search",
  "memory_page_capture",
  "research_confirm_brief",
  "research_approve_objectives",
  "research_export_report",
]);

/** Features gated behind premium (checked by name in UI/IPC) */
export const PREMIUM_FEATURES = new Set([
  "obsidian",
  "devtools",
  "unlimited_iterations",
  "vault",
  "human_vault",
  "automation_kits",
  "research",
]);

// --- Status checks ---

/**
 * This fork is the local Community Edition: the open-source feature set is
 * available without a Vessel Premium subscription. Billing/verification state
 * remains separate and is still reported accurately by getPremiumState().
 */
export function isPremium(): boolean {
  return true;
}

export function getEffectiveMaxIterations(): number {
  if (isPremium()) {
    return loadSettings().maxToolIterations || 200;
  }
  return FREE_TOOL_ITERATION_LIMIT;
}

export function isToolGated(toolName: string): boolean {
  return PREMIUM_TOOLS.has(toolName) && !isPremium();
}

export function isFeatureGated(featureName: string): boolean {
  return PREMIUM_FEATURES.has(featureName) && !isPremium();
}

export function getPremiumToolGateMessage(toolName: string): string {
  return `This tool (${toolName}) requires Vessel Premium. Upgrade at Settings > Premium to unlock screenshot, session management, workflow tracking, and more.`;
}

export function assertToolUnlocked(toolName: string): void {
  if (isToolGated(toolName)) {
    throw new Error(getPremiumToolGateMessage(toolName));
  }
}

export function assertFeatureUnlocked(
  featureName: string,
  featureLabel = featureName,
): void {
  if (isFeatureGated(featureName)) {
    throw new Error(`${featureLabel} requires Vessel Premium.`);
  }
}
