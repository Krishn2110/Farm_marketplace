import Image from "next/image";

import { OfferForm } from "@/app/ui/forms";
import { getOptionalSession } from "@/lib/auth";
import {
  getCategories,
  getListingsMarketPulse,
  getLocationOptions,
} from "@/lib/market";
import { LoadingLink } from "@/app/ui/navigation-progress";

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              Buyer sourcing board
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
              Browse local produce and compare with mandi benchmarks.
            </h1>
            <p className="mt-3 max-w-2xl leading-8 text-stone-700">
              Filter by category, location, and target price to find the best-fit
              suppliers. Each listing now shows a mandi benchmark so buyers can see
              where direct farm pricing is saving money or charging a freshness premium.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            {filteredListings.length} listings match your current filters
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-4">
          <div className="rounded-[1.5rem] border border-stone-900/10 bg-white px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
              Live mandi coverage
            </p>
            <p className="mt-3 text-3xl font-semibold text-stone-950">
              {marketPulse.liveCount}
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Listings currently backed by live AGMARKNET mandi records.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-emerald-900/12 bg-emerald-50 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-800">
              Buyer savings
            </p>
            <p className="mt-3 text-3xl font-semibold text-emerald-950">
              {marketPulse.savingsCount}
            </p>
            <p className="mt-2 text-sm leading-7 text-emerald-900/80">
              Listings currently priced below their nearest mandi benchmark.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-amber-900/10 bg-amber-50 px-5 py-5">
            <p className="text-xs uppercase tracking-[0.24em] text-amber-800">
              Freshness premium
            </p>
            <p className="mt-3 text-3xl font-semibold text-amber-950">
              {marketPulse.premiumCount}
            </p>
            <p className="mt-2 text-sm leading-7 text-amber-900/80">
              Listings charging above mandi rates, likely due to quality or direct delivery.
            </p>
          </div>
          <div className="rounded-[1.5rem] border border-stone-900/10 bg-stone-950 px-5 py-5 text-stone-50">
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">
              Avg price gap
            </p>
            <p className="mt-3 text-3xl font-semibold">
              {marketPulse.averageGap > 0 ? "+" : ""}
              {marketPulse.averageGap}%
            </p>
            <p className="mt-2 text-sm leading-7 text-stone-300">
              Average direct-vs-mandi gap across the currently loaded listings.
            </p>
          </div>
        </div>

        {marketPulse.liveCount === 0 ? (
          <div className="mt-6 rounded-[1.5rem] border border-amber-900/10 bg-amber-50 px-5 py-4 text-sm leading-7 text-amber-950">
            Live mandi API data is not available right now, so these comparisons are
            using internal commodity benchmarks. Add `MANDI_API_KEY` in `.env.local`
            to enable official live mandi pricing.
          </div>
        ) : null}

        <form className="mt-8 grid gap-4 lg:grid-cols-4">
          <div>
            <label className="label" htmlFor="category">
              Category
            </label>
            <select className="field mt-2" defaultValue={category} id="category" name="category">
              <option value="">All categories</option>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="location">
              Location
            </label>
            <select className="field mt-2" defaultValue={location} id="location" name="location">
              <option value="">All locations</option>
              {locations.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="maxPrice">
              Max price / kg
            </label>
            <input
              className="field mt-2"
              defaultValue={maxPrice || ""}
              id="maxPrice"
              name="maxPrice"
              placeholder="e.g. 55"
              type="number"
            />
          </div>
          <div className="flex items-end gap-3">
            <button className="btn-primary w-full" type="submit">
              Apply filters
            </button>
          </div>
        </form>
      </section>

      <section className="grid gap-5">
        {filteredListings.map((listing) => (
          <article
            key={listing.id}
            className="panel panel-strong grid gap-6 lg:grid-cols-[1fr_0.85fr]"
          >
            <div>
              <div className="relative mb-5 h-56 overflow-hidden rounded-2xl border border-stone-900/10 bg-stone-100">
                <Image
                  alt={listing.title}
                  className="object-cover"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  src={listing.images[0] || "/produce-placeholder.svg"}
                />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-stone-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-stone-50">
                  {listing.category}
                </span>
                {listing.organic ? (
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                    Organic tagged
                  </span>
                ) : null}
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                  Sustainability {listing.sustainabilityScore}/100
                </span>
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                  {listing.mandiComparison.comparisonLabel}
                </span>
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                    {listing.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Supplied by {listing.farmerName} | {listing.location}
                  </p>
                  <p className="text-sm leading-7 text-stone-600">
                    Rating {listing.farmerRating}/5
                    {listing.farmerReviewCount > 0
                      ? ` from ${listing.farmerReviewCount} review${listing.farmerReviewCount === 1 ? "" : "s"}`
                      : " | awaiting first review"}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-3 text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Market guidance
                  </p>
                  <p className="mt-1 text-2xl font-semibold text-stone-950">
                    Rs. {listing.suggestedPrice}/{listing.unit}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Available stock
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    Only {listing.quantity}
                    {listing.unit} left
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Farmer price
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    Rs. {listing.price}/{listing.unit}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Mandi modal price
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    Rs. {listing.mandiComparison.modalPrice || "--"}/{listing.unit}
                  </p>
                  <p className="mt-2 text-xs leading-6 text-stone-500">
                    {listing.mandiComparison.marketName}, {listing.mandiComparison.district}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Direct vs mandi
                  </p>
                  <p
                    className={`mt-2 text-xl font-semibold ${
                      listing.mandiComparison.priceGap < 0
                        ? "text-emerald-700"
                        : listing.mandiComparison.priceGap > 0
                          ? "text-amber-700"
                          : "text-stone-950"
                    }`}
                  >
                    {listing.mandiComparison.priceGap > 0 ? "+" : ""}
                    {listing.mandiComparison.priceGapPercent}%
                  </p>
                  <p className="mt-2 text-xs leading-6 text-stone-500">
                    {listing.mandiComparison.arrivalDate}
                  </p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <p className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-950">
                  {listing.mandiComparison.insight}
                </p>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4 text-sm leading-7 text-stone-700">
                  <p className="font-semibold text-stone-950">Mandi range</p>
                  <p className="mt-2">
                    Rs. {listing.mandiComparison.minPrice} to Rs. {listing.mandiComparison.maxPrice}/
                    {listing.unit}
                  </p>
                  <p className="mt-2 text-stone-500">
                    Based on {listing.mandiComparison.commodityQuery} benchmarks from{" "}
                    {listing.mandiComparison.state}.
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700">
                {listing.freshnessNote}. Nearby buyers see this supplier earlier because
                the location score is high for {listing.location}.
              </p>
            </div>

            <div className="panel bg-stone-950 text-stone-50">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-emerald-200">
                    Offer workflow
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold">
                    Open a negotiation
                  </h3>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-stone-100">
                  {listing.deliveryOptions.join(" / ")}
                </span>
              </div>
              <p className="mt-4 text-sm leading-7 text-stone-300">
                Start with your target landed price and use the mandi benchmark to
                justify your first offer with real local-market context.
              </p>
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-stone-200">
                <p className="font-semibold text-white">Negotiation anchor</p>
                <p className="mt-2">
                  Mandi benchmark is Rs. {listing.mandiComparison.modalPrice || "--"}/
                  {listing.unit}. Direct listing is Rs. {listing.price}/{listing.unit}.
                </p>
              </div>
              <div className="mt-6">
                {session?.role === "buyer" ? (
                  <OfferForm productId={listing.id} />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-stone-200">
                    Buyer accounts can place offers here.{" "}
                    <LoadingLink className="font-semibold text-emerald-200" href="/auth">
                      Login as a buyer
                    </LoadingLink>{" "}
                    to begin negotiating.
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
