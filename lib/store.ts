import "server-only";

import { createHash, randomUUID } from "node:crypto";

import { getDatabase } from "@/lib/mongodb";
import { seedData } from "@/lib/seed-data";
import type {
  DeliveryType,
  OfferRecord,
  OrderRecord,
  PasswordResetRecord,
  PaymentProvider,
  ProductRecord,
  Role,
  StoreData,
  UserRecord,
} from "@/lib/types";

const collectionName = "store";
const documentKey = "main";

type StoreDocument = StoreData & {
  key: string;
};

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function getStoreCollection() {
  const database = await getDatabase();
  return database.collection<StoreDocument>(collectionName);
}

async function ensureStoreDocument() {
  const collection = await getStoreCollection();
  await collection.updateOne(
    { key: documentKey },
    {
      $setOnInsert: {
        key: documentKey,
        ...seedData,
      },
    },
    { upsert: true },
  );
}

async function writeStore(store: StoreData) {
  const collection = await getStoreCollection();
  await collection.updateOne(
    { key: documentKey },
    {
      $set: {
        key: documentKey,
        ...store,
      },
    },
    { upsert: true },
  );
}

async function readStore(): Promise<StoreData> {
  await ensureStoreDocument();
  const collection = await getStoreCollection();
  const document = await collection.findOne({ key: documentKey });

  if (!document) {
    return structuredClone(seedData);
  }

  return {
    users: document.users ?? [],
    products: document.products ?? [],
    offers: document.offers ?? [],
    orders: document.orders ?? [],
    passwordResets: document.passwordResets ?? [],
  };
}

export async function getStore() {
  return readStore();
}

export async function getUserById(userId: string) {
  const store = await readStore();
  return store.users.find((user) => user.id === userId) ?? null;
}

export async function getUserByEmail(email: string) {
  const store = await readStore();
  return store.users.find((user) => user.email === email) ?? null;
}

export async function verifyCredentials(email: string, password: string) {
  const user = await getUserByEmail(email);
  if (!user) {
    return null;
  }

  return user.passwordHash === hashPassword(password) ? user : null;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role: Role;
  location: string;
  farmType?: string;
  businessType?: string;
  languages: string[];
}) {
  const store = await readStore();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: hashPassword(input.password),
    role: input.role,
    location: input.location,
    farmType: input.farmType || undefined,
    businessType: input.businessType || undefined,
    languages: input.languages.length ? input.languages : ["English"],
    rating: input.role === "admin" ? 5 : 4.5,
    approved: input.role !== "farmer",
    createdAt: new Date().toISOString().slice(0, 10),
  };

  store.users.unshift(user);
  await writeStore(store);
  return user;
}

export async function updateUserProfile(
  userId: string,
  input: Pick<UserRecord, "location" | "farmType" | "businessType" | "languages">,
) {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    return null;
  }

  user.location = input.location || user.location;
  user.farmType = input.farmType || undefined;
  user.businessType = input.businessType || undefined;
  user.languages = input.languages.length ? input.languages : ["English"];

  await writeStore(store);
  return user;
}

export async function createListing(input: {
  farmerId: string;
  title: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  harvestDate: string;
  images: string[];
  location: string;
  freshnessNote: string;
  organic: boolean;
  deliveryOptions: DeliveryType[];
}) {
  const store = await readStore();
  const farmer = store.users.find((entry) => entry.id === input.farmerId);
  const hasValidHarvestDate = /^\d{4}-\d{2}-\d{2}$/.test(input.harvestDate);

  if (!farmer || farmer.role !== "farmer") {
    throw new Error("FARMER_NOT_FOUND");
  }

  if (!farmer.approved) {
    throw new Error("FARMER_NOT_APPROVED");
  }

  if (
    !input.title.trim() ||
    !input.category.trim() ||
    !input.location.trim() ||
    !input.freshnessNote.trim() ||
    !hasValidHarvestDate ||
    !Number.isFinite(input.price) ||
    !Number.isFinite(input.quantity) ||
    input.price <= 0 ||
    input.quantity <= 0
  ) {
    throw new Error("INVALID_LISTING_INPUT");
  }

  const listing: ProductRecord = {
    id: randomUUID(),
    farmerId: input.farmerId,
    title: input.title.trim(),
    category: input.category.trim(),
    price: input.price,
    quantity: input.quantity,
    unit: input.unit.trim() || "kg",
    harvestDate: input.harvestDate,
    images: input.images,
    location: input.location.trim(),
    freshnessNote: input.freshnessNote.trim(),
    organic: input.organic,
    deliveryOptions: input.deliveryOptions.length
      ? input.deliveryOptions
      : ["platform"],
    sustainabilityScore: input.organic ? 94 : 79,
    createdAt: new Date().toISOString().slice(0, 10),
  };

  store.products.unshift(listing);
  await writeStore(store);
  return listing;
}

export async function getProductById(productId: string) {
  const store = await readStore();
  return store.products.find((product) => product.id === productId) ?? null;
}

export async function createOffer(input: {
  productId: string;
  buyerId: string;
  farmerId: string;
  offeredPrice: number;
  message: string;
}) {
  const store = await readStore();
  const offer: OfferRecord = {
    id: randomUUID(),
    productId: input.productId,
    buyerId: input.buyerId,
    farmerId: input.farmerId,
    offeredPrice: input.offeredPrice,
    status: "pending",
    messages: [
      {
        id: randomUUID(),
        senderId: input.buyerId,
        text: input.message || "Buyer opened a negotiation.",
        createdAt: new Date().toLocaleString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "short",
        }),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  store.offers.unshift(offer);
  await writeStore(store);
  return offer;
}

export async function addMessageToOffer(
  offerId: string,
  senderId: string,
  text: string,
) {
  const store = await readStore();
  const offer = store.offers.find((entry) => entry.id === offerId);

  if (!offer) {
    return null;
  }

  offer.messages.push({
    id: randomUUID(),
    senderId,
    text,
    createdAt: new Date().toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }),
  });
  offer.updatedAt = new Date().toISOString();

  await writeStore(store);
  return offer;
}

export async function acceptOffer(offerId: string, farmerId: string) {
  const store = await readStore();
  const offer = store.offers.find(
    (entry) => entry.id === offerId && entry.farmerId === farmerId,
  );

  if (!offer) {
    return null;
  }

  offer.status = "accepted";
  offer.updatedAt = new Date().toISOString();
  offer.messages.push({
    id: randomUUID(),
    senderId: farmerId,
    text: "Offer accepted. Converting this negotiation into an order.",
    createdAt: new Date().toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }),
  });

  await writeStore(store);
  return offer;
}

export async function rejectOffer(offerId: string, farmerId: string) {
  const store = await readStore();
  const offer = store.offers.find(
    (entry) => entry.id === offerId && entry.farmerId === farmerId,
  );

  if (!offer) {
    return null;
  }

  offer.status = "rejected";
  offer.updatedAt = new Date().toISOString();
  offer.messages.push({
    id: randomUUID(),
    senderId: farmerId,
    text: "Offer rejected. You can still continue the conversation with a revised ask.",
    createdAt: new Date().toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    }),
  });

  await writeStore(store);
  return offer;
}

export async function createOrderFromOffer(input: {
  offerId: string;
  address: string;
  deliveryType: DeliveryType;
  paymentProvider: PaymentProvider;
}) {
  const store = await readStore();
  const offer = store.offers.find((entry) => entry.id === input.offerId);

  if (!offer) {
    return null;
  }

  const product = store.products.find((entry) => entry.id === offer.productId);
  if (!product) {
    return null;
  }

  const order: OrderRecord = {
    id: randomUUID(),
    offerId: offer.id,
    productId: product.id,
    buyerId: offer.buyerId,
    farmerId: offer.farmerId,
    total: offer.offeredPrice * 20,
    status: "confirmed",
    deliveryType: input.deliveryType,
    deliveryStatus: "Preparing dispatch",
    address: input.address,
    eta: input.deliveryType === "platform" ? "6 hours" : "12 hours",
    paymentProvider: input.paymentProvider,
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  };

  store.orders.unshift(order);
  await writeStore(store);
  return order;
}

export async function approveFarmer(userId: string) {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    return null;
  }

  user.approved = true;
  await writeStore(store);
  return user;
}

export async function createPasswordResetToken(email: string) {
  const store = await readStore();
  const user = store.users.find((entry) => entry.email === email);

  if (!user) {
    return null;
  }

  const now = Date.now();
  const token = randomUUID();
  const reset: PasswordResetRecord = {
    id: randomUUID(),
    userId: user.id,
    tokenHash: hashResetToken(token),
    createdAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 30 * 60 * 1000).toISOString(),
  };

  store.passwordResets = store.passwordResets.filter((entry) => {
    return entry.userId !== user.id && new Date(entry.expiresAt).getTime() > now;
  });
  store.passwordResets.unshift(reset);
  await writeStore(store);
  return {
    token,
    userId: user.id,
  };
}

export async function resetPasswordByToken(token: string, nextPassword: string) {
  const store = await readStore();
  const now = Date.now();
  const hashedToken = hashResetToken(token);
  const resetRequest = store.passwordResets.find((entry) => {
    return (
      entry.tokenHash === hashedToken && new Date(entry.expiresAt).getTime() > now
    );
  });

  if (!resetRequest) {
    store.passwordResets = store.passwordResets.filter(
      (entry) => new Date(entry.expiresAt).getTime() > now,
    );
    await writeStore(store);
    return false;
  }

  const user = store.users.find((entry) => entry.id === resetRequest.userId);
  if (!user) {
    store.passwordResets = store.passwordResets.filter(
      (entry) => entry.id !== resetRequest.id,
    );
    await writeStore(store);
    return false;
  }

  user.passwordHash = hashPassword(nextPassword);
  store.passwordResets = store.passwordResets.filter(
    (entry) => entry.userId !== user.id,
  );
  await writeStore(store);
  return true;
}
