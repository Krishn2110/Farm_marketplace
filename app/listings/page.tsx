import Link from "next/link";
import Image from "next/image";
import { 
  Search, 
  Filter, 
  MapPin, 
  Package, 
  Calendar, 
  Truck, 
  Star, 
  Leaf, 
  TrendingUp,
  CheckCircle2,
  Clock,
  DollarSign,
  ArrowRight,
  SlidersHorizontal,
  X,
  ChevronDown
} from "lucide-react";

import { OfferForm } from "@/app/ui/forms";
import { getOptionalSession } from "@/lib/auth";
import {
  getCategories,
  getListingsWithContext,
  getLocationOptions,
} from "@/lib/market";

type SearchParams = Promise<{
  category?: string | string[];
  location?: string | string[];
  maxPrice?: string | string[];
}>;

function readFilterValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const [params, session, categories, locations, listings] = await Promise.all([
    searchParams,
    getOptionalSession(),
    getCategories(),
    getLocationOptions(),
    getListingsWithContext(),
  ]);

  const category = readFilterValue(params.category);
  const location = readFilterValue(params.location);
  const maxPrice = Number(readFilterValue(params.maxPrice) || "0");

  const filteredListings = listings.filter((listing) => {
    const matchesCategory = category ? listing.category === category : true;
    const matchesLocation = location ? listing.location === location : true;
    const matchesPrice = maxPrice > 0 ? listing.price <= maxPrice : true;
    return matchesCategory && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-4">
                <TrendingUp className="h-4 w-4" />
                Buyer Sourcing Board
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Browse local produce
                <span className="block text-emerald-600">negotiate directly</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-gray-600">
                Filter by category, location, and target price to find the best-fit
                suppliers. Farmers publish freshness notes, stock levels, and
                delivery options right on each listing.
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="rounded-2xl bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4 border border-emerald-200">
                <p className="text-sm font-semibold text-emerald-700">Total listings</p>
                <p className="text-3xl font-bold text-emerald-900">{filteredListings.length}</p>
                <p className="text-xs text-emerald-600 mt-1">match your filters</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="mb-12 rounded-2xl bg-white shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Filter listings</h2>
            </div>
          </div>
          
          <form className="p-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="category">
                  Category
                </label>
                <div className="relative">
                  <select 
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    defaultValue={category} 
                    id="category" 
                    name="category"
                  >
                    <option value="">All categories</option>
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="location">
                  Location
                </label>
                <div className="relative">
                  <select 
                    className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none"
                    defaultValue={location} 
                    id="location" 
                    name="location"
                  >
                    <option value="">All locations</option>
                    {locations.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="maxPrice">
                  Max price per unit (₹)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    defaultValue={maxPrice || ""}
                    id="maxPrice"
                    name="maxPrice"
                    placeholder="e.g., 55"
                    type="number"
                  />
                </div>
              </div>
              
              <div className="flex items-end gap-3">
                <button className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-6 rounded-xl transition-all hover:shadow-lg" type="submit">
                  Apply filters
                </button>
                { (category || location || maxPrice) && (
                  <Link 
                    href="/listings" 
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                    Clear
                  </Link>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Listings Grid */}
        <div className="space-y-8">
          {filteredListings.map((listing) => (
            <article
              key={listing.id}
              className="group rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100"
            >
              <div className="grid lg:grid-cols-[1fr_0.85fr] gap-0">
                {/* Left Column - Listing Details */}
                <div className="p-6 lg:p-8">
                  {/* Product Image */}
                  <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image
                      alt={listing.title}
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      src={listing.images[0] || "/produce-placeholder.svg"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white">
                      <Package className="h-3 w-3" />
                      {listing.category}
                    </span>
                    {listing.organic && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                        <Leaf className="h-3 w-3" />
                        Organic
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                      <Star className="h-3 w-3 fill-amber-500" />
                      Sustainability {listing.sustainabilityScore}/100
                    </span>
                  </div>

                  {/* Title and Farmer Info */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                        {listing.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        <span>Supplied by {listing.farmerName} • {listing.location}</span>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 px-4 py-3 border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                        Market guidance
                      </p>
                      <p className="text-2xl font-bold text-emerald-900">
                        ₹{listing.suggestedPrice}/{listing.unit}
                      </p>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Available</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        {listing.quantity}{listing.unit}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Farmer price</p>
                      <p className="mt-1 text-lg font-bold text-gray-900">
                        ₹{listing.price}/{listing.unit}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Harvest</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">{listing.harvestDate}</p>
                      </div>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3 border border-gray-100">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Delivery ETA</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <p className="text-sm font-semibold text-gray-900">{listing.estimatedDelivery}</p>
                      </div>
                    </div>
                  </div>

                  {/* Freshness Note */}
                  <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-emerald-800 leading-relaxed">
                        {listing.freshnessNote} Nearby buyers see this supplier first because
                        the location score is high for {listing.location}.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column - Offer Workflow */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 lg:p-8">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                        Offer workflow
                      </p>
                      <h3 className="mt-2 text-2xl font-bold text-white">
                        Open a negotiation
                      </h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {listing.deliveryOptions.map((option) => (
                        <span key={option} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    Start with your target landed price and add context like volume,
                    weekly demand, or preferred delivery method.
                  </p>
                  
                  <div className="mt-6">
                    {session?.role === "buyer" ? (
                      <OfferForm productId={listing.id} />
                    ) : (
                      <div className="rounded-xl bg-white/5 border border-white/10 p-5">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="rounded-full bg-emerald-500/20 p-2">
                            <Lock className="h-5 w-5 text-emerald-400" />
                          </div>
                          <p className="text-sm font-semibold text-white">Buyer verification required</p>
                        </div>
                        <p className="text-sm text-gray-300 mb-4">
                          Buyer accounts can place offers here. 
                        </p>
                        <Link 
                          className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors" 
                          href="/auth"
                        >
                          Login as a buyer
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Additional Info */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span>Verified farmer • Direct sourcing</span>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}

          {/* Empty State */}
          {filteredListings.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex rounded-full bg-gray-100 p-4 mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No listings found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to find more results</p>
              <Link 
                href="/listings" 
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-white font-semibold hover:bg-emerald-700 transition-colors"
              >
                Clear all filters
                <X className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Import missing icons
import { Sparkles, Lock } from "lucide-react";