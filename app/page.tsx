import Link from "next/link";

import { getOptionalSession } from "@/lib/auth";
import { getFeaturedProducts, getMarketplaceSnapshot } from "@/lib/market";

const features = [
  "Direct farmer-to-buyer sourcing",
  "Built-in offer and negotiation flow",
  "Simple logistics and order tracking",
];

export default async function Home() {
  const [snapshot, featuredProducts, session] = await Promise.all([
    getMarketplaceSnapshot(),
    getFeaturedProducts(),
    getOptionalSession(),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-10 sm:px-10 lg:px-12">
      <section className="panel-hero overflow-hidden text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.22),_transparent_30%),radial-gradient(circle_at_bottom_left,_rgba(251,191,36,0.18),_transparent_38%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow text-emerald-100">Farm Marketplace</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-tight sm:text-6xl">
              Fresh produce sourcing made simple.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/82">
              Connect farmers, restaurants, and shops in one clean workflow for
              listings, offers, delivery coordination, and orders.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                className="btn-light"
                href={session ? "/dashboard" : "/signup"}
              >
                {session ? "Go to dashboard" : "Get started"}
              </Link>
              <Link className="btn-outline-light" href="/listings">
                Browse listings
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="stat-glass">
              <p className="eyebrow text-white/65">Farmers</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {snapshot.farmers}
              </p>
            </div>
            <div className="stat-glass">
              <p className="eyebrow text-white/65">Listings</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {snapshot.products}
              </p>
            </div>
            <div className="stat-glass">
              <p className="eyebrow text-white/65">Open offers</p>
              <p className="mt-3 text-3xl font-semibold text-white">
                {snapshot.pendingOffers}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature} className="panel panel-strong">
            <p className="eyebrow text-emerald-700">Feature</p>
            <p className="mt-4 text-lg font-medium leading-8 text-stone-900">
              {feature}
            </p>
          </div>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow text-stone-500">Featured Listings</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
              Fresh harvests available now
            </h2>
          </div>
          <Link className="text-sm font-semibold text-emerald-800" href="/listings">
            View all listings
          </Link>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article key={product.id} className="panel panel-product">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow text-stone-500">{product.category}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                    {product.title}
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                  {product.freshnessNote}
                </span>
              </div>

              <div className="mt-5 space-y-2 text-sm leading-7 text-stone-600">
                <p>{product.location}</p>
                <p>
                  {product.quantity}
                  {product.unit} available
                </p>
                <p>Harvested on {product.harvestDate}</p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <p className="text-2xl font-semibold text-stone-950">
                  Rs. {product.price}/{product.unit}
                </p>
                <Link className="btn-secondary" href="/listings">
                  View
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
