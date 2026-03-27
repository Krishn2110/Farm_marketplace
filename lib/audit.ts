import "server-only";

type AuthAuditEvent = {
  event:
    | "signup_success"
    | "signup_duplicate_email"
    | "login_success"
    | "login_failed"
    | "login_rate_limited"
    | "login_pending_approval"
    | "password_reset_requested"
    | "password_reset_completed"
    | "password_reset_invalid"
    | "offer_created"
    | "offer_updated"
    | "offer_rate_limited"
    | "offer_failed"
    | "offer_message_sent"
    | "offer_message_failed"
    | "farmer_listing_created"
    | "farmer_listing_failed"
    | "offer_accepted"
    | "offer_rejected"
    | "offer_action_failed"
    | "order_created"
    | "order_create_failed"
    | "review_created"
    | "review_updated"
    | "review_failed"
    | "review_rate_limited"
    | "admin_farmer_approved"
    | "admin_approve_failed"
    | "admin_action_rate_limited";
  email?: string;
  userId?: string;
  role?: string;
  ip?: string;
  reason?: string;
};

export function logAuthEvent(payload: AuthAuditEvent) {
  const line = JSON.stringify({
    scope: "auth",
    at: new Date().toISOString(),
    ...payload,
  });
  console.info(line);
}
