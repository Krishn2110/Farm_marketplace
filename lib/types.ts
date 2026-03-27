export type Role = "farmer" | "buyer" | "admin";

export type DeliveryType = "self" | "platform";
export type OfferStatus = "pending" | "accepted" | "rejected";
export type OrderStatus = "confirmed" | "packed" | "in-transit" | "delivered";
export type PaymentProvider = "razorpay" | "stripe";
export type PaymentStatus = "paid" | "pending";

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
  location: string;
  farmType?: string;
  businessType?: string;
  languages: string[];
  rating: number;
  approved: boolean;
  createdAt: string;
};

export type ProductRecord = {
  id: string;
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
  sustainabilityScore: number;
  createdAt: string;
};

export type OfferMessageRecord = {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
};

export type OfferRecord = {
  id: string;
  productId: string;
  buyerId: string;
  farmerId: string;
  offeredPrice: number;
  status: OfferStatus;
  messages: OfferMessageRecord[];
  createdAt: string;
  updatedAt: string;
};

export type OrderRecord = {
  id: string;
  offerId: string;
  productId: string;
  buyerId: string;
  farmerId: string;
  total: number;
  status: OrderStatus;
  deliveryType: DeliveryType;
  deliveryStatus: string;
  address: string;
  eta: string;
  paymentProvider: PaymentProvider;
  paymentStatus: PaymentStatus;
  createdAt: string;
};

export type StoreData = {
  users: UserRecord[];
  products: ProductRecord[];
  offers: OfferRecord[];
  orders: OrderRecord[];
};

export type SessionUser = {
  userId: string;
  role: Role;
  name: string;
};

export type OfferThreadView = {
  id: string;
  productTitle: string;
  offeredPrice: number;
  unit: string;
  status: OfferStatus;
  counterpartyLabel: string;
  deliverySummary: string;
  messages: Array<{
    id: string;
    senderName: string;
    text: string;
    createdAt: string;
    isCurrentUser: boolean;
  }>;
  timeline: Array<{
    label: string;
    value: string;
  }>;
};
