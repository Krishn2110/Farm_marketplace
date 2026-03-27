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
    | "password_reset_invalid";
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
