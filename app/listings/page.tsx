import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronDown,
  DollarSign,
  Leaf,
  Lock,
  MapPin,
  Package,
  Search,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
} from "lucide-react";

import { OfferForm } from "@/app/ui/forms";
import { getOptionalSession } from "@/lib/auth";
import {
  getCategories,
  getListingsMarketPulse,
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

function isUploadedListingImage(src: string) {
  return src.startsWith("/uploads/listings/");
}

export default async function ListingsPage({ searchParams }: { searchParams: SearchParams }) {
  const [params, session, categories, locations, marketPulse] = await Promise.all([
    searchParams,
    getOptionalSession(),
    getCategories(),
    getLocationOptions(),
    getListingsMarketPulse(),
  ]);

  const category = readFilterValue(params.category);
  const location = readFilterValue(params.location);
  const maxPrice = Number(readFilterValue(params.maxPrice) || "0");

  const filteredListings = marketPulse.listings.filter((listing) => {
    const matchesCategory = category ? listing.category === category : true;
    const matchesLocation = location ? listing.location === location : true;
    const matchesPrice = maxPrice > 0 ? listing.price <= maxPrice : true;
    return matchesCategory && matchesLocation && matchesPrice;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-10 lg:px-12">
        <div className="mb-12 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
              <TrendingUp className="h-4 w-4" />
              Buyer Sourcing Board
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
              Browse local produce
              <span className="block text-emerald-600">negotiate directly</span>
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-gray-600">
              Filter by category, location, and target price to find the best-fit suppliers.
              Farmers publish freshness notes, stock levels, and mandi comparisons right on each listing.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-emerald-100 px-6 py-4">
            <p className="text-sm font-semibold text-emerald-700">Total listings</p>
            <p className="text-3xl font-bold text-emerald-900">{filteredListings.length}</p>
            <p className="mt-1 text-xs text-emerald-600">match your filters</p>
          </div>
        </div>

        <div className="mb-12 overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-emerald-600" />
              <h2 className="font-semibold text-gray-900">Filter listings</h2>
            </div>
          </div>
          <form className="p-6">
            <div className="grid gap-6 lg:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="category">Category</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" defaultValue={category} id="category" name="category">
                    <option value="">All categories</option>
                    {categories.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="location">Location</label>
                <div className="relative">
                  <select className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" defaultValue={location} id="location" name="location">
                    <option value="">All locations</option>
                    {locations.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                </div>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700" htmlFor="maxPrice">Max price per unit (Rs.)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input className="w-full rounded-xl border border-gray-200 bg-white px-10 py-3 text-gray-700 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20" defaultValue={maxPrice || ""} id="maxPrice" name="maxPrice" placeholder="e.g., 55" type="number" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <button className="flex-1 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 font-semibold text-white transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg" type="submit">Apply filters</button>
                {(category || location || maxPrice) && <Link className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-600 transition-colors hover:bg-gray-50" href="/listings">Clear</Link>}
              </div>
            </div>
          </form>
        </div>

        <div className="space-y-8">
          {filteredListings.map((listing) => (
            <article key={listing.id} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all duration-300 hover:shadow-2xl">
              <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
                <div className="p-6 lg:p-8">
                  <div className="relative mb-6 h-64 w-full overflow-hidden rounded-xl bg-gradient-to-br from-gray-100 to-gray-200">
                    <Image alt={listing.title} className="object-cover transition-transform duration-700 group-hover:scale-110" fill sizes="(max-width: 1024px) 100vw, 50vw" src={listing.images[0] || "/produce-placeholder.svg"} unoptimized={isUploadedListingImage(listing.images[0] || "/produce-placeholder.svg")} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                  <div className="mb-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white"><Package className="h-3 w-3" />{listing.category}</span>
                    {listing.organic && <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800"><Leaf className="h-3 w-3" />Organic</span>}
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800"><Star className="h-3 w-3 fill-amber-500" />Sustainability {listing.sustainabilityScore}/100</span>
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold text-stone-700">{listing.mandiComparison.comparisonLabel}</span>
                  </div>
                  <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 transition-colors group-hover:text-emerald-600">{listing.title}</h2>
                      <div className="mt-2 flex items-center gap-2 text-sm text-gray-500"><MapPin className="h-4 w-4" /><span>Supplied by {listing.farmerName} • {listing.location}</span></div>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 px-4 py-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Market guidance</p>
                      <p className="text-2xl font-bold text-emerald-900">Rs. {listing.suggestedPrice}/{listing.unit}</p>
                    </div>
                  </div>
                  <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Available</p><p className="mt-1 text-lg font-bold text-gray-900">{listing.quantity}{listing.unit}</p></div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">App price / kg</p><p className="mt-1 text-lg font-bold text-gray-900">Rs. {listing.mandiComparison.appPricePerKg}/kg</p></div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Mandi price / kg</p><p className="mt-1 text-lg font-bold text-gray-900">Rs. {listing.mandiComparison.mandiPricePerKg || "--"}/kg</p></div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Buyer benefit</p><p className="mt-1 text-lg font-bold text-emerald-700">{listing.mandiComparison.buyerSavingsPerKg > 0 ? "+" : ""}{listing.mandiComparison.buyerSavingsPerKg} Rs./kg</p></div>
                  </div>
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <div className="flex items-start gap-2"><Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" /><p className="text-sm leading-relaxed text-emerald-800">{listing.freshnessNote} Nearby buyers see this supplier earlier because the location score is high for {listing.location}.</p></div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 lg:p-8">
                  <div className="mb-4"><p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">Offer workflow</p><h3 className="mt-2 text-2xl font-bold text-white">Open a negotiation</h3></div>
                  <p className="mb-4 text-sm leading-relaxed text-gray-300">Start with your target landed price and use the mandi benchmark to justify the offer with local market context.</p>
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-stone-200"><p className="font-semibold text-white">Negotiation anchor</p><p className="mt-2">Mandi is Rs. {listing.mandiComparison.mandiPricePerKg || "--"}/kg and this app listing is Rs. {listing.mandiComparison.appPricePerKg}/kg.</p></div>
                  <div className="mt-6">
                    {session?.role === "buyer" ? (
                      <OfferForm productId={listing.id} />
                    ) : (
                      <div className="rounded-xl border border-white/10 bg-white/5 p-5"><div className="mb-3 flex items-center gap-3"><div className="rounded-full bg-emerald-500/20 p-2"><Lock className="h-5 w-5 text-emerald-400" /></div><p className="text-sm font-semibold text-white">Buyer verification required</p></div><p className="mb-4 text-sm text-gray-300">Buyer accounts can place offers here.</p><Link className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700" href="/login">Login as a buyer<ArrowRight className="h-4 w-4" /></Link></div>
                    )}
                  </div>
                  <div className="mt-6 border-t border-white/10 pt-6"><div className="flex items-center gap-2 text-xs text-gray-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span>Verified farmer • Direct sourcing</span></div><div className="mt-3 flex items-center gap-2 text-xs text-gray-400"><Calendar className="h-4 w-4" /><span>Harvested {listing.harvestDate}</span></div></div>
                </div>
              </div>
            </article>
          ))}
          {filteredListings.length === 0 && <div className="py-20 text-center"><div className="mb-4 inline-flex rounded-full bg-gray-100 p-4"><Search className="h-8 w-8 text-gray-400" /></div><h3 className="mb-2 text-xl font-semibold text-gray-900">No listings found</h3><p className="mb-6 text-gray-500">Try adjusting your filters to find more results</p><Link className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-emerald-700" href="/listings">Clear all filters</Link></div>}
        </div>
      </div>
    </div>
  );
}
