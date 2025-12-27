import DodoPayments from "dodopayments";

/**
 * Dodo Payments client singleton for server-side use only.
 * 
 * Environment variables required:
 * - DODO_PAYMENTS_API_KEY: Your Dodo Payments API key
 * - DODO_PAYMENTS_WEBHOOK_KEY: Your webhook signing secret
 * - DODO_PAYMENTS_ENVIRONMENT: 'test_mode' or 'live_mode' (defaults to 'test_mode')
 */

let dodoClient: DodoPayments | null = null;

export function getDodoClient(): DodoPayments {
  if (!dodoClient) {
    const apiKey = process.env.DODO_PAYMENTS_API_KEY;
    const webhookKey = process.env.DODO_PAYMENTS_WEBHOOK_KEY;
    const environment = (process.env.DODO_PAYMENTS_ENVIRONMENT || "live_mode") as
      | "test_mode"
      | "live_mode";

    if (!apiKey) {
      throw new Error("DODO_PAYMENTS_API_KEY environment variable is required");
    }

    dodoClient = new DodoPayments({
      bearerToken: apiKey,
      webhookKey: webhookKey,
      environment,
    });
  }

  return dodoClient;
}

/**
 * Get the return URL for checkout sessions.
 * Falls back to localhost for development.
 */
export function getReturnUrl(): string {
  return (
    process.env.DODO_PAYMENTS_RETURN_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000"
  );
}

/**
 * Check if Dodo Payments is properly configured.
 */
export function isDodoConfigured(): boolean {
  return !!(
    process.env.DODO_PAYMENTS_API_KEY &&
    process.env.DODO_PAYMENTS_WEBHOOK_KEY
  );
}

