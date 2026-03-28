import { seedData } from "@/lib/seed-data";
import type {
  DeliveryType,
  OfferRecord,
  OrderRecord,
  PasswordResetRecord,
  PaymentProvider,
  ProductRecord,
  ReviewRecord,
  Role,
  StoreData,
  UserRecord,
} from "@/lib/types";

const collectionName = "store";
const documentKey = "main";

type StoreDocument = StoreData & {
  key: string;
};

async function getNodeCrypto() {
  return import("node:crypto");
}

async function getDatabaseApi() {
  return import("@/lib/mongodb");
}

async function hashPassword(password: string) {
  const { createHash } = await getNodeCrypto();
  return createHash("sha256").update(password).digest("hex");
}

async function hashResetToken(token: string) {
  const { createHash } = await getNodeCrypto();
  return createHash("sha256").update(token).digest("hex");
}

async function getStoreCollection() {
  const { getDatabase } = await getDatabaseApi();
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
    reviews: document.reviews ?? [],
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

  return user.passwordHash === (await hashPassword(password)) ? user : null;
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
  const { randomUUID } = await getNodeCrypto();
  const user: UserRecord = {
    id: randomUUID(),
    name: input.name,
    email: input.email,
    passwordHash: await hashPassword(input.password),
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
  const { randomUUID } = await getNodeCrypto();
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

export async function getUserReviewStats(userId: string) {
  const store = await readStore();
  const reviews = store.reviews.filter((entry) => entry.revieweeId === userId);

  if (!reviews.length) {
    const user = store.users.find((entry) => entry.id === userId);
    return {
      averageRating: user?.rating ?? 0,
      reviewCount: 0,
    };
  }

  const total = reviews.reduce((sum, entry) => sum + entry.rating, 0);
  return {
    averageRating: Number((total / reviews.length).toFixed(1)),
    reviewCount: reviews.length,
  };
}

export async function getReviewsForUser(userId: string) {
  const store = await readStore();
  const userMap = new Map(store.users.map((user) => [user.id, user]));

  return store.reviews
    .filter((entry) => entry.revieweeId === userId)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((review) => {
      const reviewer = userMap.get(review.reviewerId);
      return {
        ...review,
        reviewerName: reviewer?.name ?? "Marketplace user",
        reviewerRole: reviewer?.role ?? "buyer",
      };
    });
}

export async function createOffer(input: {
  productId: string;
  buyerId: string;
  farmerId: string;
  offeredPrice: number;
  message: string;
}) {
  const store = await readStore();
  const { randomUUID } = await getNodeCrypto();
  const buyer = store.users.find((entry) => entry.id === input.buyerId);
  const product = store.products.find((entry) => entry.id === input.productId);
  const farmer = store.users.find((entry) => entry.id === input.farmerId);
  const messageText = input.message.trim() || "Buyer opened a negotiation.";

  if (!buyer || buyer.role !== "buyer") {
    throw new Error("BUYER_NOT_FOUND");
  }

  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  if (!farmer || farmer.role !== "farmer") {
    throw new Error("FARMER_NOT_FOUND");
  }

  if (!farmer.approved) {
    throw new Error("FARMER_NOT_APPROVED");
  }

  if (!Number.isFinite(product.quantity) || product.quantity <= 0) {
    throw new Error("PRODUCT_OUT_OF_STOCK");
  }

  if (product.farmerId !== input.farmerId) {
    throw new Error("INVALID_FARMER_FOR_PRODUCT");
  }

  if (input.buyerId === product.farmerId) {
    throw new Error("SELF_OFFER_NOT_ALLOWED");
  }

  if (!Number.isFinite(input.offeredPrice) || input.offeredPrice <= 0) {
    throw new Error("INVALID_OFFER_PRICE");
  }

  if (messageText.length > 600) {
    throw new Error("OFFER_MESSAGE_TOO_LONG");
  }

  const existingPendingOffer = store.offers.find((entry) => {
    return (
      entry.productId === input.productId &&
      entry.buyerId === input.buyerId &&
      entry.status === "pending"
    );
  });

  if (existingPendingOffer) {
    existingPendingOffer.offeredPrice = input.offeredPrice;
    existingPendingOffer.updatedAt = new Date().toISOString();
    existingPendingOffer.messages.push({
      id: randomUUID(),
      senderId: input.buyerId,
      text: messageText,
      createdAt: new Date().toLocaleString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "short",
      }),
    });

    await writeStore(store);
    return {
      offer: existingPendingOffer,
      mode: "updated" as const,
    };
  }

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
        text: messageText,
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
  return {
    offer,
    mode: "created" as const,
  };
}

export async function addMessageToOffer(
  offerId: string,
  senderId: string,
  text: string,
) {
  const store = await readStore();
  const { randomUUID } = await getNodeCrypto();
  const offer = store.offers.find((entry) => entry.id === offerId);

  if (!offer) {
    throw new Error("OFFER_NOT_FOUND");
  }

  const sender = store.users.find((entry) => entry.id === senderId);
  if (!sender) {
    throw new Error("SENDER_NOT_FOUND");
  }

  const canMessage =
    sender.role === "admin" ||
    senderId === offer.buyerId ||
    senderId === offer.farmerId;
  if (!canMessage) {
    throw new Error("OFFER_MESSAGE_FORBIDDEN");
  }

  const trimmedText = text.trim();
  if (!trimmedText) {
    throw new Error("EMPTY_OFFER_MESSAGE");
  }

  if (trimmedText.length > 1000) {
    throw new Error("OFFER_MESSAGE_TOO_LONG");
  }

  offer.messages.push({
    id: randomUUID(),
    senderId,
    text: trimmedText,
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
  const { randomUUID } = await getNodeCrypto();
  const farmer = store.users.find((entry) => entry.id === farmerId);

  if (!farmer || farmer.role !== "farmer") {
    throw new Error("FARMER_NOT_FOUND");
  }

  if (!farmer.approved) {
    throw new Error("FARMER_NOT_APPROVED");
  }

  const offer = store.offers.find(
    (entry) => entry.id === offerId && entry.farmerId === farmerId,
  );

  if (!offer) {
    throw new Error("OFFER_NOT_FOUND");
  }

  if (offer.status !== "pending") {
    throw new Error("OFFER_NOT_PENDING");
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
  const { randomUUID } = await getNodeCrypto();
  const farmer = store.users.find((entry) => entry.id === farmerId);

  if (!farmer || farmer.role !== "farmer") {
    throw new Error("FARMER_NOT_FOUND");
  }

  if (!farmer.approved) {
    throw new Error("FARMER_NOT_APPROVED");
  }

  const offer = store.offers.find(
    (entry) => entry.id === offerId && entry.farmerId === farmerId,
  );

  if (!offer) {
    throw new Error("OFFER_NOT_FOUND");
  }

  if (offer.status !== "pending") {
    throw new Error("OFFER_NOT_PENDING");
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
  const { randomUUID } = await getNodeCrypto();
  const offer = store.offers.find((entry) => entry.id === input.offerId);

  if (!offer) {
    throw new Error("OFFER_NOT_FOUND");
  }

  if (offer.status !== "accepted") {
    throw new Error("OFFER_NOT_ACCEPTED");
  }

  const existingOrder = store.orders.find((entry) => entry.offerId === offer.id);
  if (existingOrder) {
    throw new Error("ORDER_ALREADY_EXISTS");
  }

  const product = store.products.find((entry) => entry.id === offer.productId);
  if (!product) {
    throw new Error("PRODUCT_NOT_FOUND");
  }

  const orderQuantity = 20;
  if (!Number.isFinite(product.quantity) || product.quantity < orderQuantity) {
    throw new Error("INSUFFICIENT_STOCK_FOR_ORDER");
  }

  const trimmedAddress = input.address.trim();
  if (!trimmedAddress) {
    throw new Error("INVALID_DELIVERY_ADDRESS");
  }

  const order: OrderRecord = {
    id: randomUUID(),
    offerId: offer.id,
    productId: product.id,
    buyerId: offer.buyerId,
    farmerId: offer.farmerId,
    quantity: orderQuantity,
    unit: product.unit,
    total: offer.offeredPrice * orderQuantity,
    status: "confirmed",
    deliveryType: input.deliveryType,
    deliveryStatus: "Preparing dispatch",
    address: trimmedAddress,
    eta: input.deliveryType === "platform" ? "6 hours" : "12 hours",
    paymentProvider: input.paymentProvider,
    paymentStatus: "paid",
    createdAt: new Date().toISOString(),
  };

  product.quantity = Number((product.quantity - orderQuantity).toFixed(2));
  store.orders.unshift(order);
  await writeStore(store);
  return order;
}

export async function createOrUpdateReview(input: {
  orderId: string;
  reviewerId: string;
  rating: number;
  feedback: string;
}) {
  const store = await readStore();
  const { randomUUID } = await getNodeCrypto();
  const reviewer = store.users.find((entry) => entry.id === input.reviewerId);

  if (!reviewer || (reviewer.role !== "buyer" && reviewer.role !== "farmer")) {
    throw new Error("REVIEWER_NOT_ALLOWED");
  }

  const order = store.orders.find((entry) => entry.id === input.orderId);
  if (!order) {
    throw new Error("ORDER_NOT_FOUND");
  }

  const revieweeId =
    reviewer.id === order.buyerId
      ? order.farmerId
      : reviewer.id === order.farmerId
        ? order.buyerId
        : null;

  if (!revieweeId) {
    throw new Error("REVIEW_FORBIDDEN");
  }

  if (!Number.isInteger(input.rating) || input.rating < 1 || input.rating > 5) {
    throw new Error("INVALID_REVIEW_RATING");
  }

  const feedback = input.feedback.trim();
  if (!feedback) {
    throw new Error("EMPTY_REVIEW_FEEDBACK");
  }

  if (feedback.length > 500) {
    throw new Error("REVIEW_FEEDBACK_TOO_LONG");
  }

  const now = new Date().toISOString();
  const existingReview = store.reviews.find((entry) => {
    return entry.orderId === input.orderId && entry.reviewerId === input.reviewerId;
  });

  if (existingReview) {
    existingReview.rating = input.rating;
    existingReview.feedback = feedback;
    existingReview.updatedAt = now;
    await writeStore(store);
    return {
      review: existingReview,
      mode: "updated" as const,
    };
  }

  const review: ReviewRecord = {
    id: randomUUID(),
    orderId: input.orderId,
    reviewerId: input.reviewerId,
    revieweeId,
    rating: input.rating,
    feedback,
    createdAt: now,
    updatedAt: now,
  };

  store.reviews.unshift(review);
  await writeStore(store);
  return {
    review,
    mode: "created" as const,
  };
}

export async function approveFarmer(userId: string) {
  const store = await readStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "farmer") {
    throw new Error("NOT_A_FARMER");
  }

  if (user.approved) {
    throw new Error("FARMER_ALREADY_APPROVED");
  }

  user.approved = true;
  await writeStore(store);
  return user;
}

export async function createPasswordResetToken(email: string) {
  const store = await readStore();
  const { randomUUID } = await getNodeCrypto();
  const user = store.users.find((entry) => entry.email === email);

  if (!user) {
    return null;
  }

  const now = Date.now();
  const token = randomUUID();
  const reset: PasswordResetRecord = {
    id: randomUUID(),
    userId: user.id,
    tokenHash: await hashResetToken(token),
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
  const hashedToken = await hashResetToken(token);
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

  user.passwordHash = await hashPassword(nextPassword);
  store.passwordResets = store.passwordResets.filter(
    (entry) => entry.userId !== user.id,
  );
  await writeStore(store);
  return true;
}
