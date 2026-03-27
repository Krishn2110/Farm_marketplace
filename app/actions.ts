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
  createOrUpdateReview,
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
    logAuthEvent({
      event: "farmer_listing_created",
      userId: session.userId,
      ip: await getClientIp(),
      reason: `category_${category}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      logAuthEvent({
        event: "farmer_listing_failed",
        userId: session.userId,
        ip: await getClientIp(),
        reason: error.message,
      });
    }
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
  const ip = await getClientIp();
  const productId = readString(formData, "productId");
  const offeredPrice = readPositiveNumber(formData, "offeredPrice");
  const message = readString(formData, "message");

  if (!productId || offeredPrice === null) {
    return { error: "Select a product and enter a valid offer price." };
  }

  const offerRateLimit = consumeRateLimit(
    `offer:${session.userId}:${productId}:${ip}`,
    8,
    10 * 60 * 1000,
  );
  if (!offerRateLimit.allowed) {
    logAuthEvent({
      event: "offer_rate_limited",
      userId: session.userId,
      ip,
      reason: `retry_after_${offerRateLimit.retryAfterSeconds}s`,
    });
    return {
      error: `Too many offers sent. Try again in about ${offerRateLimit.retryAfterSeconds} seconds.`,
    };
  }

  const product = await getProductById(productId);
  if (!product) {
    return { error: "This listing is no longer available." };
  }

  try {
    const result = await createOffer({
      productId,
      buyerId: session.userId,
      farmerId: product.farmerId,
      offeredPrice,
      message,
    });
    logAuthEvent({
      event: result.mode === "created" ? "offer_created" : "offer_updated",
      userId: session.userId,
      ip,
      reason: `offer_${result.offer.id}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      logAuthEvent({
        event: "offer_failed",
        userId: session.userId,
        ip,
        reason: error.message,
      });
      if (error.message === "SELF_OFFER_NOT_ALLOWED") {
        return { error: "You cannot place an offer on your own listing." };
      }
      if (error.message === "INVALID_OFFER_PRICE") {
        return { error: "Offer price must be greater than 0." };
      }
      if (error.message === "OFFER_MESSAGE_TOO_LONG") {
        return { error: "Offer message is too long. Keep it under 600 characters." };
      }
      if (error.message === "PRODUCT_NOT_FOUND") {
        return { error: "This listing is no longer available." };
      }
      if (error.message === "PRODUCT_OUT_OF_STOCK") {
        return { error: "This listing is currently out of stock." };
      }
      if (error.message === "FARMER_NOT_APPROVED") {
        return {
          error:
            "This farmer account is not approved right now. Please try another listing.",
        };
      }
    }
    return { error: "Unable to send offer right now. Please try again." };
  }

  revalidatePath("/listings");
  revalidatePath("/dashboard");
  return { success: "Offer sent to the farmer." };
}

export async function addOfferMessageAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession();
  const ip = await getClientIp();
  const offerId = readString(formData, "offerId");
  const text = readString(formData, "text");

  if (!offerId || !text) {
    return { error: "Write a message before sending." };
  }

  const messageRateLimit = consumeRateLimit(
    `offer-message:${session.userId}:${offerId}:${ip}`,
    20,
    10 * 60 * 1000,
  );
  if (!messageRateLimit.allowed) {
    return {
      error: `Too many messages sent. Try again in about ${messageRateLimit.retryAfterSeconds} seconds.`,
    };
  }

  try {
    await addMessageToOffer(offerId, session.userId, text);
    logAuthEvent({
      event: "offer_message_sent",
      userId: session.userId,
      ip,
      reason: `offer_${offerId}`,
    });
  } catch (error) {
    if (error instanceof Error) {
      logAuthEvent({
        event: "offer_message_failed",
        userId: session.userId,
        ip,
        reason: error.message,
      });
      if (error.message === "OFFER_NOT_FOUND") {
        return { error: "Offer thread not found." };
      }
      if (error.message === "OFFER_MESSAGE_FORBIDDEN") {
        return { error: "You are not allowed to message in this offer thread." };
      }
      if (error.message === "EMPTY_OFFER_MESSAGE") {
        return { error: "Write a message before sending." };
      }
      if (error.message === "OFFER_MESSAGE_TOO_LONG") {
        return { error: "Message is too long. Keep it under 1000 characters." };
      }
    }
    return { error: "Unable to send message right now. Please try again." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/offers/${offerId}`);
  return { success: "Message sent." };
}

export async function acceptOfferAction(formData: FormData) {
  const session = await ensureSession(["farmer"]);
  const ip = await getClientIp();
  const offerId = readString(formData, "offerId");
  const address = readString(formData, "address");
  const deliveryType =
    readString(formData, "deliveryType") === "platform" ? "platform" : "self";
  const paymentProvider =
    readString(formData, "paymentProvider") === "stripe"
      ? "stripe"
      : "razorpay";

  if (!offerId || !address.trim()) {
    logAuthEvent({
      event: "offer_action_failed",
      userId: session.userId,
      ip,
      reason: "missing_offer_or_address",
    });
    redirect("/dashboard");
  }

  try {
    await acceptOffer(offerId, session.userId);
    logAuthEvent({
      event: "offer_accepted",
      userId: session.userId,
      ip,
      reason: `offer_${offerId}`,
    });
  } catch (error) {
    logAuthEvent({
      event: "offer_action_failed",
      userId: session.userId,
      ip,
      reason: error instanceof Error ? error.message : "accept_offer_unknown",
    });
    redirect(`/dashboard/offers/${offerId}`);
  }

  try {
    await createOrderFromOffer({
      offerId,
      address,
      deliveryType,
      paymentProvider,
    });
    logAuthEvent({
      event: "order_created",
      userId: session.userId,
      ip,
      reason: `offer_${offerId}`,
    });
  } catch (error) {
    logAuthEvent({
      event: "order_create_failed",
      userId: session.userId,
      ip,
      reason: error instanceof Error ? error.message : "create_order_unknown",
    });
    if (error instanceof Error && error.message === "INSUFFICIENT_STOCK_FOR_ORDER") {
      redirect(`/dashboard/offers/${offerId}`);
    }
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/offers/${offerId}`);
}

export async function rejectOfferAction(formData: FormData) {
  const session = await ensureSession(["farmer"]);
  const ip = await getClientIp();
  const offerId = readString(formData, "offerId");

  if (!offerId) {
    logAuthEvent({
      event: "offer_action_failed",
      userId: session.userId,
      ip,
      reason: "missing_offer_id",
    });
    redirect("/dashboard");
  }

  try {
    await rejectOffer(offerId, session.userId);
    logAuthEvent({
      event: "offer_rejected",
      userId: session.userId,
      ip,
      reason: `offer_${offerId}`,
    });
  } catch (error) {
    logAuthEvent({
      event: "offer_action_failed",
      userId: session.userId,
      ip,
      reason: error instanceof Error ? error.message : "reject_offer_unknown",
    });
  }

  revalidatePath("/dashboard");
  redirect(`/dashboard/offers/${offerId}`);
}

export async function approveFarmerAction(formData: FormData) {
  const session = await ensureSession(["admin"]);
  const ip = await getClientIp();
  const userId = readString(formData, "userId");

  const rateLimit = consumeRateLimit(
    `admin-approve:${session.userId}:${ip}`,
    40,
    10 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    logAuthEvent({
      event: "admin_action_rate_limited",
      userId: session.userId,
      ip,
      reason: `retry_after_${rateLimit.retryAfterSeconds}s`,
    });
    return;
  }

  if (!userId) {
    logAuthEvent({
      event: "admin_approve_failed",
      userId: session.userId,
      ip,
      reason: "missing_user_id",
    });
    return;
  }

  try {
    await approveFarmer(userId);
    logAuthEvent({
      event: "admin_farmer_approved",
      userId: session.userId,
      ip,
      reason: `approved_${userId}`,
    });
  } catch (error) {
    logAuthEvent({
      event: "admin_approve_failed",
      userId: session.userId,
      ip,
      reason: error instanceof Error ? error.message : "approve_unknown",
    });
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
}

export async function submitReviewAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await ensureSession(["buyer", "farmer"]);
  const ip = await getClientIp();
  const orderId = readString(formData, "orderId");
  const rating = Number(readString(formData, "rating"));
  const feedback = readString(formData, "feedback");

  if (!orderId) {
    return { error: "Review target is missing." };
  }

  const rateLimit = consumeRateLimit(
    `review:${session.userId}:${orderId}:${ip}`,
    10,
    10 * 60 * 1000,
  );
  if (!rateLimit.allowed) {
    logAuthEvent({
      event: "review_rate_limited",
      userId: session.userId,
      ip,
      reason: `retry_after_${rateLimit.retryAfterSeconds}s`,
    });
    return {
      error: `Too many review attempts. Try again in about ${rateLimit.retryAfterSeconds} seconds.`,
    };
  }

  try {
    const result = await createOrUpdateReview({
      orderId,
      reviewerId: session.userId,
      rating,
      feedback,
    });
    logAuthEvent({
      event: result.mode === "created" ? "review_created" : "review_updated",
      userId: session.userId,
      ip,
      reason: `order_${orderId}`,
    });
  } catch (error) {
    logAuthEvent({
      event: "review_failed",
      userId: session.userId,
      ip,
      reason: error instanceof Error ? error.message : "review_unknown",
    });

    if (error instanceof Error) {
      if (error.message === "ORDER_NOT_FOUND") {
        return { error: "This order was not found." };
      }
      if (error.message === "REVIEW_FORBIDDEN") {
        return { error: "You can only review the buyer or farmer from your own order." };
      }
      if (error.message === "REVIEWER_NOT_ALLOWED") {
        return { error: "Only buyers and farmers can submit reviews." };
      }
      if (error.message === "INVALID_REVIEW_RATING") {
        return { error: "Please choose a rating between 1 and 5 stars." };
      }
      if (error.message === "EMPTY_REVIEW_FEEDBACK") {
        return { error: "Please add a short feedback message." };
      }
      if (error.message === "REVIEW_FEEDBACK_TOO_LONG") {
        return { error: "Feedback is too long. Keep it under 500 characters." };
      }
    }

    return { error: "Unable to save feedback right now. Please try again." };
  }

  revalidatePath("/dashboard");
  return { success: "Feedback saved." };
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
