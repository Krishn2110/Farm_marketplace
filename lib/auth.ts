import type { Role, SessionUser, UserRecord } from "@/lib/types";

const sessionCookieName = "farm-marketplace-session";
const sessionSecret = process.env.SESSION_SECRET ?? "local-demo-secret";

async function getCreateHmac() {
  const crypto = await import("node:crypto");
  return crypto.createHmac;
}

async function encode(payload: SessionUser) {
  const createHmac = await getCreateHmac();
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

async function decode(cookieValue: string | undefined | null): Promise<SessionUser | null> {
  if (!cookieValue) {
    return null;
  }

  const [body, signature] = cookieValue.split(".");
  if (!body || !signature) {
    return null;
  }

  const createHmac = await getCreateHmac();
  const expectedSignature = createHmac("sha256", sessionSecret)
    .update(body)
    .digest("base64url");

  if (expectedSignature !== signature) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionUser;
  } catch {
    return null;
  }
}

function toSessionUser(user: UserRecord): SessionUser {
  return {
    userId: user.id,
    role: user.role,
    name: user.name,
  };
}

async function getCookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

async function getRedirect() {
  const { redirect } = await import("next/navigation");
  return redirect;
}

async function getStoreApi() {
  const store = await import("@/lib/store");
  return store;
}

export async function createSession(user: UserRecord) {
  if (typeof window !== "undefined") {
    throw new Error("createSession can only be used on the server");
  }

  const cookieStore = await getCookieStore();
  cookieStore.set(sessionCookieName, await encode(toSessionUser(user)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  if (typeof window !== "undefined") {
    throw new Error("clearSession can only be used on the server");
  }

  const cookieStore = await getCookieStore();
  cookieStore.delete(sessionCookieName);
}

export async function getSessionFromCookieStore() {
  if (typeof window !== "undefined") {
    return null;
  }

  const cookieStore = await getCookieStore();
  return decode(cookieStore.get(sessionCookieName)?.value);
}

export async function getOptionalSession() {
  if (typeof window !== "undefined") {
    return null;
  }

  const session = await getSessionFromCookieStore();
  if (!session) {
    return null;
  }

  const { getUserById } = await getStoreApi();
  const user = await getUserById(session.userId);
  if (!user) {
    return null;
  }

  return {
    ...session,
    approved: user.approved,
  };
}

export async function ensureSession(roles?: Role[]) {
  if (typeof window !== "undefined") {
    throw new Error("ensureSession can only be used on the server");
  }

  const session = await getOptionalSession();
  const redirect = await getRedirect();

  if (!session) {
    redirect("/auth");
  }

  if (roles && !roles.includes(session.role)) {
    redirect("/dashboard");
  }

  return session;
}
