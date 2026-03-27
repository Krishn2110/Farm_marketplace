import "server-only";

import { acceptOfferAction, rejectOfferAction } from "@/app/actions";
import { getMandiComparisonForListing } from "@/lib/mandi";
import { getReviewsForUser, getStore, getUserById, getUserReviewStats } from "@/lib/store";
import type { OfferThreadView } from "@/lib/types";

function formatCurrency(value: number) {
  return `Rs. ${value}`;
}

function estimateSuggestedPrice(price: number, sustainabilityScore: number) {
  const freshnessLift = sustainabilityScore > 85 ? 4 : 2;
  return price + freshnessLift;
}

function estimateDelivery(location: string) {
  if (location.includes("Gujarat")) {
    return "4-8 hours";
  }
  return "1 day";
}

export async function getFeaturedProducts() {
  const store = await getStore();
  return store.products.slice(0, 3);
}

export async function getMarketplaceSnapshot() {
  const store = await getStore();
  return {
    farmers: store.users.filter((user) => user.role === "farmer" && user.approved)
      .length,
    products: store.products.length,
    pendingOffers: store.offers.filter((offer) => offer.status === "pending").length,
  };
}

export async function getCategories() {
  const store = await getStore();
  return [...new Set(store.products.map((product) => product.category))];
}

export async function getLocationOptions() {
  const store = await getStore();
  return [...new Set(store.products.map((product) => product.location))];
}

export async function getListingsWithContext() {
  const store = await getStore();

  return Promise.all(
    store.products.map(async (product) => {
      const farmer = await getUserById(product.farmerId);
      const farmerStats = farmer
        ? await getUserReviewStats(farmer.id)
        : { averageRating: 0, reviewCount: 0 };
      const mandiComparison = await getMandiComparisonForListing({
        title: product.title,
        category: product.category,
        location: product.location,
        price: product.price,
        unit: product.unit,
      });
      return {
        ...product,
        farmerName: farmer?.name ?? "Farmer",
        farmerRating: farmerStats.averageRating || farmer?.rating || 0,
        farmerReviewCount: farmerStats.reviewCount,
        mandiComparison,
        suggestedPrice: estimateSuggestedPrice(product.price, product.sustainabilityScore),
        estimatedDelivery: estimateDelivery(product.location),
      };
    }),
  );
}

export async function getListingsMarketPulse() {
  const listings = await getListingsWithContext();
  const liveCount = listings.filter((listing) => listing.mandiComparison.status === "live").length;
  const savingsCount = listings.filter((listing) => listing.mandiComparison.priceGap < 0).length;
  const premiumCount = listings.filter((listing) => listing.mandiComparison.priceGap > 0).length;
  const averageGap =
    listings.length > 0
      ? Number(
          (
            listings.reduce(
              (sum, listing) => sum + listing.mandiComparison.priceGapPercent,
              0,
            ) / listings.length
          ).toFixed(1),
        )
      : 0;

  return {
    liveCount,
    savingsCount,
    premiumCount,
    averageGap,
    listings,
  };
}

export async function getDashboardData(userId: string) {
  const store = await getStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    throw new Error("User not found");
  }

  const reviewStats = await getUserReviewStats(userId);
  const receivedReviews = await getReviewsForUser(userId);

  const myProducts = store.products.filter((product) => product.farmerId === userId);
  const myOffers = store.offers.filter((offer) => {
    if (user.role === "farmer") {
      return offer.farmerId === userId;
    }
    if (user.role === "buyer") {
      return offer.buyerId === userId;
    }
    return true;
  });
  const myOrders = store.orders.filter((order) => {
    if (user.role === "farmer") {
      return order.farmerId === userId;
    }
    if (user.role === "buyer") {
      return order.buyerId === userId;
    }
    return true;
  });

  const metrics =
    user.role === "farmer"
      ? [
          {
            label: "Products listed",
            value: String(myProducts.length),
            description: "Harvests currently discoverable by buyers.",
          },
          {
            label: "Orders received",
            value: String(myOrders.length),
            description: "Accepted offers converted to paid orders.",
          },
          {
            label: "Pending offers",
            value: String(myOffers.filter((offer) => offer.status === "pending").length),
            description: "Negotiations waiting on your decision.",
          },
          {
            label: "Estimated earnings",
            value: formatCurrency(myOrders.reduce((sum, order) => sum + order.total, 0)),
            description: "Revenue from completed and in-flight sales.",
          },
        ]
      : user.role === "buyer"
        ? [
            {
              label: "Active orders",
              value: String(myOrders.length),
              description: "Deliveries in motion or recently confirmed.",
            },
            {
              label: "Negotiations",
              value: String(myOffers.length),
              description: "Open supplier conversations and offer history.",
            },
            {
              label: "Saved suppliers",
              value: String(new Set(myOffers.map((offer) => offer.farmerId)).size),
              description: "Farmers already engaged through the platform.",
            },
            {
              label: "Weekly subscription",
              value: "Ready",
              description: "Subscription model is scaffolded for recurring sourcing.",
            },
          ]
        : [
            {
              label: "Marketplace users",
              value: String(store.users.length),
              description: "Total farmers, buyers, and admins onboarded.",
            },
            {
              label: "Pending approvals",
              value: String(
                store.users.filter((entry) => entry.role === "farmer" && !entry.approved)
                  .length,
              ),
              description: "Farmers waiting for verification.",
            },
            {
              label: "Transactions",
              value: String(store.orders.length),
              description: "Orders monitored through payment and delivery.",
            },
            {
              label: "GMV",
              value: formatCurrency(store.orders.reduce((sum, order) => sum + order.total, 0)),
              description: "Marketplace gross transaction value.",
            },
          ];

  const offers = await Promise.all(
    myOffers.map(async (offer) => {
      const product = store.products.find((entry) => entry.id === offer.productId);
      const counterpartyId = user.role === "buyer" ? offer.farmerId : offer.buyerId;
      const counterparty = await getUserById(counterpartyId);
      const latestMessage = offer.messages.at(-1)?.text ?? "No messages yet.";
      return {
        id: offer.id,
        status: offer.status,
        productTitle: product?.title ?? "Listing",
        offeredPrice: offer.offeredPrice,
        unit: product?.unit ?? "kg",
        counterpartyLabel:
          user.role === "buyer"
            ? `Supplier ${counterparty?.name ?? "Farmer"}`
            : `Buyer ${counterparty?.name ?? "Buyer"}`,
        latestMessage,
        acceptAction: acceptOfferAction,
        rejectAction: rejectOfferAction,
      };
    }),
  );

  const orders = myOrders.map((order) => {
    const product = store.products.find((entry) => entry.id === order.productId);
    const reviewTargetUserId = user.role === "buyer" ? order.farmerId : order.buyerId;
    const reviewTarget = store.users.find((entry) => entry.id === reviewTargetUserId);
    const existingReview = store.reviews.find((entry) => {
      return entry.orderId === order.id && entry.reviewerId === userId;
    });
    return {
      ...order,
      productTitle: product?.title ?? "Produce order",
      reviewTargetName: reviewTarget?.name ?? "Marketplace user",
      reviewTargetRole: reviewTarget?.role ?? "buyer",
      existingReview,
    };
  });

  return {
    user: {
      ...user,
      rating: reviewStats.averageRating || user.rating,
      reviewCount: reviewStats.reviewCount,
    },
    myProducts,
    heroText:
      user.role === "farmer"
        ? "Manage produce listings, respond to offers, and convert negotiations into paid deliveries."
        : user.role === "buyer"
          ? "Track supplier negotiations, watch delivery ETAs, and keep recurring sourcing organized."
          : "Approve farmers, monitor transactions, and steer marketplace growth with live analytics.",
    metrics,
    offers,
    orders,
    defaultAddress:
      user.role === "farmer"
        ? "Maya Foods, Prahlad Nagar, Ahmedabad"
        : "Farm pickup point",
    signals: [
      {
        title: "AI price suggestion",
        description:
          "Suggested pricing compares listed price with freshness and sustainability scores to nudge stronger asks.",
      },
      {
        title: "Smart location matching",
        description:
          "Nearby suppliers in Gujarat are surfaced earlier to lower delivery costs and turnaround time.",
      },
      {
        title: "Demand forecasting",
        description:
          "Tomato and leafy greens demand is trending upward for next week based on current buyer activity.",
      },
    ],
    pendingFarmers: store.users.filter(
      (entry) => entry.role === "farmer" && !entry.approved,
    ),
    receivedReviews,
  };
}

export async function getOfferThread(offerId: string, currentUserId: string) {
  const store = await getStore();
  const offer = store.offers.find((entry) => entry.id === offerId);

  if (!offer) {
    return null;
  }

  if (![offer.buyerId, offer.farmerId].includes(currentUserId)) {
    const user = store.users.find((entry) => entry.id === currentUserId);
    if (user?.role !== "admin") {
      return null;
    }
  }

  const product = store.products.find((entry) => entry.id === offer.productId);
  const counterpartyId = currentUserId === offer.buyerId ? offer.farmerId : offer.buyerId;
  const counterparty = await getUserById(counterpartyId);
  const relatedOrder = store.orders.find((order) => order.offerId === offer.id);

  const messages = await Promise.all(
    offer.messages.map(async (message) => {
      const sender = await getUserById(message.senderId);
      return {
        id: message.id,
        senderName: sender?.name ?? "Marketplace user",
        text: message.text,
        createdAt: message.createdAt,
        isCurrentUser: message.senderId === currentUserId,
      };
    }),
  );

  const thread: OfferThreadView = {
    id: offer.id,
    productTitle: product?.title ?? "Produce order",
    offeredPrice: offer.offeredPrice,
    unit: product?.unit ?? "kg",
    status: offer.status,
    counterpartyLabel: counterparty
      ? `Conversation with ${counterparty.name}`
      : "Conversation thread",
    deliverySummary: relatedOrder
      ? `${relatedOrder.deliveryType} delivery • ${relatedOrder.eta} • ${relatedOrder.paymentProvider}`
      : "Awaiting farmer response",
    messages,
    timeline: [
      {
        label: "Offer status",
        value: offer.status,
      },
      {
        label: "Payment",
        value: relatedOrder
          ? `${relatedOrder.paymentProvider} ${relatedOrder.paymentStatus}`
          : "Not created yet",
      },
      {
        label: "Delivery",
        value: relatedOrder
          ? `${relatedOrder.deliveryStatus} to ${relatedOrder.address}`
          : "Address pending",
      },
    ],
  };

  return thread;
}
