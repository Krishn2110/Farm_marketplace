import Link from "next/link";

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
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              Buyer sourcing board
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
              Browse local produce and negotiate directly.
            </h1>
            <p className="mt-3 max-w-2xl leading-8 text-stone-700">
              Filter by category, location, and target price to find the best-fit
              suppliers. Farmers publish freshness notes, stock levels, and
              delivery options right on each listing.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-3 text-sm text-emerald-950">
            {filteredListings.length} listings match your current filters
          </div>
        </div>

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
              </div>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-stone-950">
                    {listing.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Supplied by {listing.farmerName} • {listing.location}
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
                    Harvest date
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {listing.harvestDate}
                  </p>
                </div>
                <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    Delivery ETA
                  </p>
                  <p className="mt-2 text-xl font-semibold text-stone-950">
                    {listing.estimatedDelivery}
                  </p>
                </div>
              </div>

              <p className="mt-6 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-950">
                {listing.freshnessNote}. Nearby buyers see this supplier first because
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
                Start with your target landed price and add context like volume,
                weekly demand, or preferred delivery method.
              </p>
              <div className="mt-6">
                {session?.role === "buyer" ? (
                  <OfferForm productId={listing.id} />
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-7 text-stone-200">
                    Buyer accounts can place offers here.{" "}
                    <Link className="font-semibold text-emerald-200" href="/auth">
                      Login as a buyer
                    </Link>{" "}
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
