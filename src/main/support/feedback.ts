import { errorResult, type Result } from "../../shared/result";

type FeedbackPayload = {
  email: string;
  message: string;
  source?: string;
};

/**
 * Community Edition has no Vessel-hosted support dependency.
 * Keep the IPC contract for compatibility, but never transmit feedback.
 */
export async function submitFeedback(
  _payload: FeedbackPayload,
): Promise<Result> {
  return errorResult("Hosted feedback is unavailable in Community Edition.");
}
