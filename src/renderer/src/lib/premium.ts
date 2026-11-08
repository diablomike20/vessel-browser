/**
 * Local Community Edition: all features shipped in the open-source build are
 * enabled. This helper controls feature visibility only; the actual billing
 * status is still read from the premium state and is never fabricated.
 */
export function isPremiumStatus(_status: string | undefined): boolean {
  return true;
}
