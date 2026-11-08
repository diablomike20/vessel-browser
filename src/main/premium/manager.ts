import { flushPersist, loadSettings, setSetting } from "../config/settings";
import type { PremiumState } from "../../shared/types";
import {
  errorResult,
  type Result,
} from "../../shared/result";

/** Local Community Edition feature access and compatibility IPC contracts. */

const FREE_TOOL_ITERATION_LIMIT = 50;

type ActivationCodeStartResult = Result<{
  email: string;
  challengeToken: string;
}>;

type ActivationCodeVerifyResult = Result<
  { state: PremiumState },
  { state: PremiumState }
>;

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

/**
 * Vessel account and billing state is not part of Community Edition.
 * Never expose stale account identifiers or verification tokens from a
 * settings file migrated from the hosted edition.
 */
export function getPremiumState(): PremiumState {
  return {
    status: "free",
    customerId: "",
    verificationToken: "",
    email: "",
    validatedAt: "",
    expiresAt: "",
  };
}

export function getEffectiveMaxIterations(): number {
  if (isPremium()) {
    return loadSettings().maxToolIterations || 200;
  }
  return FREE_TOOL_ITERATION_LIMIT;
}

export async function resetPremium(): Promise<PremiumState> {
  const fresh: PremiumState = {
    status: "free",
    customerId: "",
    verificationToken: "",
    email: "",
    validatedAt: "",
    expiresAt: "",
  };
  setSetting("premium", fresh);
  await flushPersist();
  return fresh;
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

// --- Vessel-hosted billing is intentionally unavailable in Community Edition ---

export async function getCheckoutUrl(
  _email?: string,
): Promise<Result<{ url: string }>> {
  return errorResult("Vessel billing is not available in Community Edition.");
}

export async function getPortalUrl(): Promise<Result<{ url: string }>> {
  return errorResult("Vessel billing is not available in Community Edition.");
}

export async function verifySubscription(
  _identifier?: string,
): Promise<PremiumState> {
  return getPremiumState();
}

export async function requestActivationCode(
  _email: string,
): Promise<ActivationCodeStartResult> {
  return errorResult("Vessel account activation is not available in Community Edition.");
}

export async function verifyActivationCode(
  _email: string,
  _code: string,
  _challengeToken: string,
): Promise<ActivationCodeVerifyResult> {
  return errorResult(
    "Vessel account activation is not available in Community Edition.",
    { state: getPremiumState() },
  );
}

export function startBackgroundRevalidation(): void {
  // No Vessel subscription service is contacted by Community Edition.
}

export function stopBackgroundRevalidation(): void {
  // Kept as a compatibility export; no timer is created in Community Edition.
}

export function isPremiumActiveState(state: PremiumState): boolean {
  return state.status === "active" || state.status === "trialing";
}
