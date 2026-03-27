import {
  AdminApprovalForm,
  FarmerListingForm,
  FarmerOfferActions,
  OrderReviewForm,
  OfferMessageForm,
  ProfileForm,
} from "@/app/ui/forms";
import { ensureSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/market";
import { LoadingLink } from "@/app/ui/navigation-progress";
import { 
  LayoutDashboard, 
  User, 
  Package, 
  TrendingUp, 
  ShoppingBag, 
  Truck, 
  CreditCard,
  Star,
  MessageSquare,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  Calendar,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await ensureSession();
  const dashboard = await getDashboardData(session.userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700">
              <LayoutDashboard className="h-3 w-3" />
              {dashboard.user.role} dashboard
            </div>
          </div>
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                Welcome back,
                <span className="block text-emerald-600 mt-1">{dashboard.user.name}</span>
              </h1>
              <p className="mt-4 max-w-2xl text-base text-gray-600 leading-relaxed">
                {dashboard.heroText}
              </p>
            </div>
            
            {/* User Info Card */}
            <div className="flex-shrink-0 rounded-2xl bg-white shadow-md border border-gray-100 p-5 min-w-[240px]">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-emerald-100 p-2">
                  <User className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Account Details</p>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MapPin className="h-3 w-3" />
                      <span>{dashboard.user.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>Trust score {dashboard.user.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Users className="h-3 w-3" />
                      <span>{dashboard.user.reviewCount} review{dashboard.user.reviewCount !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Languages: {dashboard.user.languages.join(", ") || "English"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-10">
          {dashboard.metrics.map((metric) => (
            <div
              key={metric.label}
              className="group rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 p-6 hover:-translate-y-1"
            >
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {metric.value}
              </p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                {metric.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">Profile Information</h2>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Keep location, farm type, and language preferences accurate for better buyer matching.
                </p>
              </div>
              <div className="p-6">
                <ProfileForm user={dashboard.user} />
              </div>
            </div>

            {/* Farmer Specific: Add Product */}
            {dashboard.user.role === "farmer" && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Publish vegetables, fruits, or grains with live inventory and delivery options.
                  </p>
                </div>
                <div className="p-6">
                  <FarmerListingForm location={dashboard.user.location} />
                </div>
              </div>
            )}

            {/* Non-Farmer: Marketplace Signals */}
            {dashboard.user.role !== "farmer" && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Marketplace Signals</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Key insights and trends in your marketplace
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid gap-4">
                    {dashboard.signals.map((signal) => (
                      <div
                        key={signal.title}
                        className="rounded-xl bg-gray-50 border border-gray-100 p-5 hover:bg-gray-100 transition-colors"
                      >
                        <p className="font-semibold text-gray-900">{signal.title}</p>
                        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                          {signal.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Buyer Listings */}
            {dashboard.user.role === "buyer" && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-emerald-600" />
                      <h2 className="text-xl font-bold text-gray-900">Available Listings</h2>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {dashboard.listingProducts.length} listing{dashboard.listingProducts.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Browse fresh stock from farmers and jump into negotiation when something fits.
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid gap-5 md:grid-cols-2">
                    {dashboard.listingProducts.length === 0 ? (
                      <div className="col-span-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <Package className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No farmer listings are available right now.</p>
                      </div>
                    ) : (
                      dashboard.listingProducts.map((product) => (
                        <article
                          key={product.id}
                          className="rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                        >
                          <div className="bg-gradient-to-r from-emerald-50 to-white px-5 py-4 border-b border-gray-100">
                            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
                              {product.category}
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-gray-900">
                              {product.title}
                            </h3>
                          </div>
                          <div className="p-5 space-y-3">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <User className="h-4 w-4" />
                              <span>{product.farmerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <MapPin className="h-4 w-4" />
                              <span>{product.location}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              <span>Harvested on {product.harvestDate}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                              <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Price</p>
                                <p className="text-lg font-bold text-gray-900">
                                  ₹{product.price}/{product.unit}
                                </p>
                              </div>
                              <div className="rounded-lg bg-gray-50 p-3">
                                <p className="text-xs text-gray-500">Stock</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {product.quantity}{product.unit}
                                </p>
                              </div>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3">
                              <p className="text-sm text-emerald-800">
                                {product.freshnessNote ?? "Freshly available for buyers."}
                              </p>
                            </div>
                            <LoadingLink
                              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
                              href={`/listings/${product.id}`}
                            >
                              View listing
                              <ArrowRight className="h-4 w-4" />
                            </LoadingLink>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Negotiations Section */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Negotiations & Orders</h2>
                  </div>
                  {dashboard.user.role !== "farmer" && (
                    <LoadingLink 
                      className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700" 
                      href="/listings"
                    >
                      Browse listings
                      <ArrowRight className="h-4 w-4" />
                    </LoadingLink>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Every offer keeps messages, response state, and order conversion in one place.
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-5">
                  {dashboard.offers.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                      <MessageSquare className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No offers yet. Start by publishing produce or browsing listings.</p>
                    </div>
                  ) : (
                    dashboard.offers.map((offer) => (
                      <div
                        key={offer.id}
                        className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden"
                      >
                        <div className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                  {offer.productTitle}
                                </h3>
                                <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                                  offer.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  offer.status === 'accepted' ? 'bg-green-100 text-green-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  <Clock className="h-3 w-3" />
                                  {offer.status}
                                </span>
                              </div>
                              <p className="mt-2 text-sm text-gray-600">
                                {offer.counterpartyLabel} | Offer at ₹{offer.offeredPrice}/{offer.unit}
                              </p>
                            </div>
                            <LoadingLink
                              className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-emerald-600 hover:text-white transition-all"
                              href={`/dashboard/offers/${offer.id}`}
                            >
                              Open thread
                              <ArrowRight className="h-4 w-4" />
                            </LoadingLink>
                          </div>

                          <div className="mt-5 grid gap-4 sm:grid-cols-2">
                            <div className="rounded-lg bg-gray-50 p-4">
                              <p className="text-sm font-semibold text-gray-900 mb-2">Latest note</p>
                              <p className="text-sm text-gray-600">{offer.latestMessage}</p>
                            </div>
                            {dashboard.user.role === "farmer" && offer.status === "pending" ? (
                              <div className="rounded-lg bg-emerald-50 p-4">
                                <p className="text-sm font-semibold text-emerald-900 mb-3">
                                  Convert to order
                                </p>
                                <FarmerOfferActions
                                  defaultAddress={dashboard.defaultAddress}
                                  offerId={offer.id}
                                />
                              </div>
                            ) : (
                              <div className="rounded-lg bg-gray-50 p-4">
                                <OfferMessageForm offerId={offer.id} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Orders Section */}
            <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-900">Logistics & Payments</h2>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  Track your orders and payment status
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {dashboard.orders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-emerald-600" />
                          <h3 className="font-semibold text-gray-900">{order.productTitle}</h3>
                        </div>
                        <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                          order.status === 'in-transit' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          <CheckCircle2 className="h-3 w-3" />
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span>{order.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          <span>Quantity: {order.quantity}{order.unit}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4" />
                          <span>ETA: {order.eta} | {order.deliveryType}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          <span>{order.paymentProvider} • {order.paymentStatus}</span>
                        </div>
                      </div>
                      {dashboard.user.role !== "admin" && (
                        <div className="mt-4 pt-3 border-t border-gray-100">
                          <OrderReviewForm
                            existingReview={order.existingReview}
                            orderId={order.id}
                            targetName={order.reviewTargetName}
                            targetRole={order.reviewTargetRole}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {dashboard.orders.length === 0 && (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                      <Truck className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm text-gray-600">No orders yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Received Feedback */}
            {dashboard.user.role !== "admin" && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Received Feedback</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Reviews from farmers and buyers you have worked with
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboard.receivedReviews.length === 0 ? (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <Star className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No reviews yet.</p>
                      </div>
                    ) : (
                      dashboard.receivedReviews.map((review) => (
                        <div
                          key={review.id}
                          className="rounded-xl border border-gray-100 p-5 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-gray-900">{review.reviewerName}</p>
                              <p className="text-xs text-gray-500 mt-1">{review.reviewerRole} review</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                              <span className="font-semibold text-gray-900">{review.rating}/5</span>
                            </div>
                          </div>
                          <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                            {review.feedback}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Admin: Pending Approvals */}
            {dashboard.user.role === "admin" && (
              <div className="rounded-2xl bg-white shadow-md border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-900">Pending Farmer Approvals</h2>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    Review and approve new farmer registrations
                  </p>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboard.pendingFarmers.map((farmer) => (
                      <div
                        key={farmer.id}
                        className="rounded-xl border border-gray-100 p-5"
                      >
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h3 className="font-semibold text-gray-900">{farmer.name}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <MapPin className="h-3 w-3" />
                              <span>{farmer.location}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {farmer.farmType || "Mixed produce"}
                            </p>
                          </div>
                          <AlertCircle className="h-5 w-5 text-amber-500" />
                        </div>
                        <div className="mt-3">
                          <AdminApprovalForm userId={farmer.id} />
                        </div>
                      </div>
                    ))}
                    {dashboard.pendingFarmers.length === 0 && (
                      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                        <Users className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600">No pending approvals.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>
    </div>
  );
}

