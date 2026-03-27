import "server-only";

import { createHmac } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getUserById } from "@/lib/store";
import type { Role, SessionUser, UserRecord } from "@/lib/types";

const sessionCookieName = "farm-marketplace-session";
const sessionSecret = process.env.SESSION_SECRET ?? "local-demo-secret";

function encode(payload: SessionUser) {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json).toString("base64url");
  const signature = createHmac("sha256", sessionSecret).update(body).digest("base64url");
  return `${body}.${signature}`;
}

function decode(cookieValue: string | undefined | null): SessionUser | null {
  if (!cookieValue) {
    return null;
  }

  const [body, signature] = cookieValue.split(".");
  if (!body || !signature) {
    return null;
  }

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

export async function createSession(user: UserRecord) {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, encode(toSessionUser(user)), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionCookieName);
}

export async function getSessionFromCookieStore() {
  const cookieStore = await cookies();
  return decode(cookieStore.get(sessionCookieName)?.value);
}

export async function getOptionalSession() {
  const session = await getSessionFromCookieStore();
  if (!session) {
    return null;
  }

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
  const session = await getOptionalSession();

  if (!session) {
    redirect("/auth");
  }

  if (roles && !roles.includes(session.role)) {
    redirect("/dashboard");
  }

  return session;
}
