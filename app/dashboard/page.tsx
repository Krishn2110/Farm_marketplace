import Image from "next/image";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  CreditCard,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  TrendingUp,
  Truck,
  User,
  Users,
} from "lucide-react";

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

function isUploadedListingImage(src: string) {
  return src.startsWith("/uploads/listings/");
}

export default async function DashboardPage() {
  const session = await ensureSession();
  const dashboard = await getDashboardData(session.userId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
        <div className="mb-8 flex items-center gap-2"><div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700"><LayoutDashboard className="h-3 w-3" />{dashboard.user.role} dashboard</div></div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {dashboard.metrics.map((metric) => <div key={metric.label} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{metric.label}</p><p className="mt-3 text-3xl font-bold text-gray-900">{metric.value}</p><p className="mt-2 text-sm leading-relaxed text-gray-600">{metric.description}</p></div>)}
        </div>

        <div className="grid gap-8 xl:grid-cols-2">
          <div className="space-y-8">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center gap-2"><User className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Profile Information</h2></div></div><div className="p-6"><ProfileForm user={dashboard.user} /></div></div>

            {dashboard.user.role === "farmer" && (
              <>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Add New Product</h2></div></div><div className="p-6"><FarmerListingForm location={dashboard.user.location} /></div></div>
                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Your Listings</h2></div><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">{dashboard.myProducts.length} listing{dashboard.myProducts.length !== 1 ? "s" : ""}</span></div></div><div className="p-6"><div className="grid gap-5 md:grid-cols-2">{dashboard.myProducts.map((product) => <article key={product.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"><div className="relative h-44 overflow-hidden bg-stone-100"><Image alt={product.title} className="object-cover" fill sizes="(max-width: 1280px) 100vw, 33vw" src={product.images[0] || "/produce-placeholder.svg"} unoptimized={isUploadedListingImage(product.images[0] || "/produce-placeholder.svg")} /></div><div className="p-5"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{product.category}</p><h3 className="mt-1 text-lg font-bold text-gray-900">{product.title}</h3></div></article>)}</div></div></div>
              </>
            )}

            {dashboard.user.role !== "farmer" && <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Marketplace Signals</h2></div></div><div className="p-6"><div className="grid gap-4">{dashboard.signals.map((signal) => <div key={signal.title} className="rounded-xl border border-gray-100 bg-gray-50 p-5"><p className="font-semibold text-gray-900">{signal.title}</p><p className="mt-2 text-sm leading-relaxed text-gray-600">{signal.description}</p></div>)}</div></div></div>}
          </div>

          <div className="space-y-8">
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Negotiations & Orders</h2></div>{dashboard.user.role !== "farmer" && <LoadingLink className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600" href="/listings" variant="secondary">Browse listings<ArrowRight className="h-4 w-4" /></LoadingLink>}</div></div><div className="p-6"><div className="space-y-5">{dashboard.offers.map((offer) => <div key={offer.id} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"><div className="p-5"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div className="flex-1"><div className="flex flex-wrap items-center gap-3"><h3 className="text-lg font-bold text-gray-900">{offer.productTitle}</h3><span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700"><Clock className="h-3 w-3" />{offer.status}</span></div></div><LoadingLink className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700" href={`/dashboard/offers/${offer.id}`} variant="secondary">Open thread<ArrowRight className="h-4 w-4" /></LoadingLink></div><div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-lg bg-gray-50 p-4"><p className="mb-2 text-sm font-semibold text-gray-900">Latest note</p><p className="text-sm text-gray-600">{offer.latestMessage}</p></div>{dashboard.user.role === "farmer" && offer.status === "pending" ? <div className="rounded-lg bg-emerald-50 p-4"><FarmerOfferActions defaultAddress={dashboard.defaultAddress} offerId={offer.id} /></div> : <div className="rounded-lg bg-gray-50 p-4"><OfferMessageForm offerId={offer.id} /></div>}</div></div></div>)}</div></div></div>
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center gap-2"><Truck className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Logistics & Payments</h2></div></div><div className="p-6"><div className="space-y-4">{dashboard.orders.map((order) => <div key={order.id} className="rounded-xl border border-gray-100 p-5"><div className="mb-3 flex flex-wrap items-start justify-between gap-3"><div className="flex items-center gap-3"><Package className="h-5 w-5 text-emerald-600" /><h3 className="font-semibold text-gray-900">{order.productTitle}</h3></div><span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" />{order.status}</span></div><div className="space-y-2 text-sm text-gray-600"><div className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" /><span>{order.address}</span></div><div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /><span>Quantity: {order.quantity}{order.unit}</span></div><div className="flex items-center gap-2"><Truck className="h-4 w-4" /><span>ETA: {order.eta} | {order.deliveryType}</span></div><div className="flex items-center gap-2"><CreditCard className="h-4 w-4" /><span>{order.paymentProvider} • {order.paymentStatus}</span></div></div>{dashboard.user.role !== "admin" && <div className="mt-4 border-t border-gray-100 pt-3"><OrderReviewForm existingReview={order.existingReview} orderId={order.id} targetName={order.reviewTargetName} targetRole={order.reviewTargetRole} /></div>}</div>)}</div></div></div>
            {dashboard.user.role === "admin" && <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"><div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-5"><div className="flex items-center gap-2"><Users className="h-5 w-5 text-emerald-600" /><h2 className="text-xl font-bold text-gray-900">Pending Farmer Approvals</h2></div></div><div className="p-6"><div className="space-y-4">{dashboard.pendingFarmers.map((farmer) => <div key={farmer.id} className="rounded-xl border border-gray-100 p-5"><div className="mb-3 flex items-start justify-between gap-3"><div><h3 className="font-semibold text-gray-900">{farmer.name}</h3><div className="mt-1 flex items-center gap-2 text-sm text-gray-600"><MapPin className="h-3 w-3" /><span>{farmer.location}</span></div></div><AlertCircle className="h-5 w-5 text-amber-500" /></div><AdminApprovalForm userId={farmer.id} /></div>)}</div></div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}
