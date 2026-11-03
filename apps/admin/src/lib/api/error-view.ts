import { isRetryable, type ApiError } from "./errors";

export type ErrorView = {
  chip: string;
  tone: "loss" | "caution" | "info";
  title: string;
  text: string;
  /** Show "Try again": the same request may work a moment later. */
  retry: boolean;
};

/** What a page shows when its data couldn't be loaded (ADM-06), including "no permission" (ADM-18). */
export function describeApiError(error: ApiError): ErrorView {
  switch (error.code) {
    case "FORBIDDEN":
      return {
        chip: "No access",
        tone: "caution",
        title: "You don't have permission for this page",
        text: "Your admin role doesn't include this. If you need it, ask an admin with the ADMIN role.",
        retry: false,
      };
    case "NOT_FOUND":
      return { chip: "Not found", tone: "info", title: "We couldn't find this", text: error.message, retry: false };
    case "UNAUTHORIZED":
    case "SESSION_ENDED":
      return { chip: "Signed out", tone: "info", title: "Your session has ended", text: "Sign in again to continue.", retry: false };
    case "MFA_REQUIRED":
      return { chip: "2FA needed", tone: "caution", title: "Enter your 2FA code to continue", text: "The code wasn't entered. Try again to enter it.", retry: true };
    default:
      return { chip: "Unable to load", tone: "loss", title: "This didn't load", text: error.message, retry: isRetryable(error) };
  }
}
