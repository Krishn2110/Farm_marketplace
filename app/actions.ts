"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  acceptOffer,
  addMessageToOffer,
  approveFarmer,
  createListing,
  createOffer,
  createOrderFromOffer,
  createUser,
  getProductById,
  getUserByEmail,
  rejectOffer,
  updateUserProfile,
  verifyCredentials,
} from "@/lib/store";
import {
  clearSession,
  createSession,
  ensureSession,
  getOptionalSession,
} from "@/lib/auth";
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

  if (password.length < 6) {
    return { error: "Use a password with at least 6 characters." };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser) {
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
  revalidatePath("/");
  redirect("/dashboard");
}

export async function loginAction(
  _state: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = readString(formData, "email").toLowerCase();
  const password = readString(formData, "password");

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const user = await verifyCredentials(email, password);
  if (!user) {
    return { error: "Invalid email or password." };
  }

  await createSession(user);
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
  const price = readNumber(formData, "price");
  const quantity = readNumber(formData, "quantity");
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
    Number.isNaN(price) ||
    Number.isNaN(quantity)
  ) {
    return { error: "Please complete all listing fields." };
  }

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
    images: ["/produce-placeholder.svg"],
  });

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
  revalidatePath("/");
  redirect("/dashboard");
}
