"use server";

import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  acceptOffer,
  addMessageToOffer,
  approveFarmer,
  createListing,
  createOffer,
  createOrderFromOffer,
  createUser,
  createPasswordResetToken,
  getProductById,
  getUserByEmail,
  rejectOffer,
  resetPasswordByToken,
  updateUserProfile,
  verifyCredentials,
} from "@/lib/store";
import { logAuthEvent } from "@/lib/audit";
import {
  clearSession,
  createSession,
  ensureSession,
  getOptionalSession,
} from "@/lib/auth";
import { clearRateLimit, consumeRateLimit } from "@/lib/rate-limit";
import type { Role } from "@/lib/types";

export type FormState = {
  error?: string;
  success?: string;
};

function readString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function readNumber(formData: FormData, key: string) {
  return Number(readString(formData, key));
}

const listingUploadDirectory = path.join(
  process.cwd(),
  "public",
  "uploads",
  "listings",
);

const allowedListingImageTypes = new Map<string, string>([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
]);

function readPositiveNumber(formData: FormData, key: string) {
  const raw = readString(formData, key);
  if (!raw) {
    return null;
  }
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) {
    return null;
  }
  return value;
}

async function uploadListingImages(formData: FormData) {
  const entries = formData.getAll("images");
  const files = entries.filter((entry): entry is File => {
    return entry instanceof File && entry.size > 0;
  });

  if (!files.length) {
    return ["/produce-placeholder.svg"];
  }

  if (files.length > 4) {
    throw new Error("MAX_4_IMAGES_ALLOWED");
  }

  await mkdir(listingUploadDirectory, { recursive: true });

  const paths = await Promise.all(
    files.map(async (file) => {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("IMAGE_TOO_LARGE");
      }

      const extension = allowedListingImageTypes.get(file.type);
      if (!extension) {
        throw new Error("INVALID_IMAGE_TYPE");
      }

      const filename = `${Date.now()}-${randomUUID()}${extension}`;
      const targetPath = path.join(listingUploadDirectory, filename);
      const bytes = Buffer.from(await file.arrayBuffer());
      await writeFile(targetPath, bytes);
      return `/uploads/listings/${filename}`;
    }),
  );

  return paths;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function getClientIp() {
  const headerStore = await headers();
  const forwarded = headerStore.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return headerStore.get("x-real-ip") || "unknown";
}

function readRoles(formData: FormData): Role {
  const role = readString(formData, "role");
  if (role === "farmer" || role === "buyer" || role === "admin") {
    return role;
  }
  return "buyer";
}

export async function signupAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = readString(formData, "name");
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const role = readRoles(formData);
  const location = readString(formData, "location");
  const farmType = readString(formData, "farmType");
  const businessType = readString(formData, "businessType");
  const languages = readString(formData, "languages")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!name || !email || !password || !location) {
    return { error: "Please complete all required signup fields." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (password.length < 6) {
    return { error: "Use a password with at least 6 characters." };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
    logAuthEvent({
      event: "signup_duplicate_email",
      email,
      ip: await getClientIp(),
    });
    return { error: "An account with this email already exists." };
  }

  const user = await createUser({
    name,
    email,
    password,
    role,
    location,
    farmType,
    businessType,
    languages,
  });

  await createSession(user);
  logAuthEvent({
    event: "signup_success",
    email: user.email,
    userId: user.id,
    role: user.role,
    ip: await getClientIp(),
  });
  revalidatePath("/");
  redirect("/dashboard");
}

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");
  const ip = await getClientIp();
  const rateLimitKey = `login:${email}:${ip}`;

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  if (!isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const rateLimit = consumeRateLimit(rateLimitKey, 5, 10 * 60 * 1000);
  if (!rateLimit.allowed) {
    logAuthEvent({
      event: "login_rate_limited",
      email,
      ip,
      reason: `retry_after_${rateLimit.retryAfterSeconds}s`,
    });
    return {
      error: `Too many login attempts. Try again in about ${rateLimit.retryAfterSeconds} seconds.`,
    };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    logAuthEvent({
      event: "login_failed",
      email,
      ip,
      reason: "invalid_credentials",
    });
    return { error: "Invalid email or password." };
  }

  if (user.role === "farmer" && !user.approved) {
    logAuthEvent({
      event: "login_pending_approval",
      email,
      userId: user.id,
      role: user.role,
      ip,
    });
    return {
      error:
        "Your farmer account is pending admin approval. Please try again after approval.",
    };
  }

  clearRateLimit(rateLimitKey);
  await createSession(user);
  logAuthEvent({
    event: "login_success",
    email: user.email,
    userId: user.id,
    role: user.role,
    ip,
  });
  revalidatePath("/");
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  revalidatePath("/");
  redirect("/");
}

export async function updateProfileAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession();

  await updateUserProfile(session.userId, {
    location: readString(formData, "location"),
    farmType: readString(formData, "farmType"),
    businessType: readString(formData, "businessType"),
    languages: readString(formData, "languages")
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean),
  });

  revalidatePath("/dashboard");
  return { success: "Profile updated." };
}

export async function createListingAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession(["farmer"]);

  const title = readString(formData, "title");
  const category = readString(formData, "category");
  const price = readPositiveNumber(formData, "price");
  const quantity = readPositiveNumber(formData, "quantity");
  const unit = readString(formData, "unit") || "kg";
  const harvestDate = readString(formData, "harvestDate");
  const location = readString(formData, "location");
  const freshnessNote = readString(formData, "freshnessNote");
  const organic = readString(formData, "organic") === "yes";
  const deliveryOptions = formData
    .getAll("deliveryOptions")
    .map((value) => String(value))
    .filter((value): value is "self" | "platform" => {
      return value === "self" || value === "platform";
    });

  if (
    !title ||
    !category ||
    !harvestDate ||
    !location ||
    !freshnessNote ||
    price === null ||
    quantity === null
  ) {
    return {
      error:
        "Please complete all listing fields with valid values (price and quantity must be greater than 0).",
    };
  }

  let images: string[];
  try {
    images = await uploadListingImages(formData);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "MAX_4_IMAGES_ALLOWED") {
        return { error: "You can upload up to 4 images per listing." };
      }
      if (error.message === "IMAGE_TOO_LARGE") {
        return { error: "Each image must be 5MB or smaller." };
      }
      if (error.message === "INVALID_IMAGE_TYPE") {
        return { error: "Only JPG, PNG, and WEBP images are supported." };
      }
    }
    return { error: "Unable to upload listing images. Please try again." };
  }

  try {
    await createListing({
      farmerId: session.userId,
      title,
      category,
      price,
      quantity,
      unit,
      harvestDate,
      location,
      freshnessNote,
      organic,
      deliveryOptions,
      images,
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "FARMER_NOT_APPROVED") {
        return { error: "Your farmer account is pending admin approval." };
      }
      if (error.message === "INVALID_LISTING_INPUT") {
        return { error: "Invalid listing details. Please review all fields." };
      }
    }
    return { error: "Unable to publish listing right now. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
  return { success: "Listing published." };
}

export async function createOfferAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession(["buyer"]);
  const productId = readString(formData, "productId");
  const offeredPrice = readNumber(formData, "offeredPrice");
  const message = readString(formData, "message");

  if (!productId || Number.isNaN(offeredPrice)) {
    return { error: "Select a product and offer price." };
  }

  const product = await getProductById(productId);
  if (!product) {
    return { error: "This listing is no longer available." };
  }

  await createOffer({
    productId,
    buyerId: session.userId,
    farmerId: product.farmerId,
    offeredPrice,
    message,
  });

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  return { success: "Offer sent to the farmer." };
}

export async function addOfferMessageAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession();
  const offerId = readString(formData, "offerId");
  const text = readString(formData, "text");

  if (!offerId || !text) {
    return { error: "Write a message before sending." };
  }

  await addMessageToOffer(offerId, session.userId, text);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/offers/${offerId}`);
  return { success: "Message sent." };
}

export async function acceptOfferAction(formData: FormData) {
  const session = await ensureSession(["farmer"]);
  const offerId = readString(formData, "offerId");
  const address = readString(formData, "address");
  const deliveryType =
    readString(formData, "deliveryType") === "platform" ? "platform" : "self";
  const paymentProvider =
    readString(formData, "paymentProvider") === "stripe"
      ? "stripe"
      : "razorpay";

  await acceptOffer(offerId, session.userId);
  await createOrderFromOffer({
    offerId,
    address,
    deliveryType,
    paymentProvider,
  });

  revalidatePath("/dashboard");
  redirect(`/dashboard/offers/${offerId}`);
}

export async function rejectOfferAction(formData: FormData) {
  const session = await ensureSession(["farmer"]);
  const offerId = readString(formData, "offerId");
  await rejectOffer(offerId, session.userId);
  revalidatePath("/dashboard");
  redirect(`/dashboard/offers/${offerId}`);
}

export async function approveFarmerAction(formData: FormData) {
  await ensureSession(["admin"]);
  const userId = readString(formData, "userId");
  await approveFarmer(userId);
  revalidatePath("/dashboard");
}

export async function quickDemoLoginAction(formData: FormData) {
  const role = readRoles(formData);
  const current = await getOptionalSession();
  if (current?.role === role) {
    redirect("/dashboard");
  }

  const emailByRole: Record<Role, string> = {
    admin: "admin@farmmarket.local",
    farmer: "farmer@farmmarket.local",
    buyer: "buyer@farmmarket.local",
  };

  const user = await verifyCredentials(emailByRole[role], "demo123");
  if (!user) {
    redirect("/auth");
  }

  await createSession(user);
  logAuthEvent({
    event: "login_success",
    email: user.email,
    userId: user.id,
    role: user.role,
    ip: await getClientIp(),
    reason: "demo_login",
  });
  revalidatePath("/");
  redirect("/dashboard");
}

export async function requestPasswordResetAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = readString(formData, "email").toLowerCase();
  const ip = await getClientIp();

  if (!email || !isValidEmail(email)) {
    return { error: "Please enter a valid email address." };
  }

  const reset = await createPasswordResetToken(email);

  if (reset?.token && process.env.NODE_ENV !== "production") {
    console.info(
      `Password reset link: /reset-password?token=${encodeURIComponent(reset.token)}`,
    );
  }

  logAuthEvent({
    event: "password_reset_requested",
    email,
    userId: reset?.userId,
    ip,
    reason: reset?.token ? "token_generated" : "email_not_found",
  });

  return {
    success:
      "If an account exists for this email, a reset link has been generated.",
  };
}

export async function resetPasswordAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const token = readString(formData, "token");
  const password = readString(formData, "password");
  const confirmPassword = readString(formData, "confirmPassword");
  const ip = await getClientIp();

  if (!token) {
    return { error: "Reset token is missing. Please use a valid reset link." };
  }

  if (password.length < 6) {
    return { error: "Use a password with at least 6 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Password and confirm password must match." };
  }

  const updated = await resetPasswordByToken(token, password);
  if (!updated) {
    logAuthEvent({
      event: "password_reset_invalid",
      ip,
      reason: "invalid_or_expired_token",
    });
    return {
      error: "This reset link is invalid or expired. Please request a new one.",
    };
  }

  logAuthEvent({
    event: "password_reset_completed",
    ip,
  });
  return { success: "Password updated. You can now login with your new password." };
}
