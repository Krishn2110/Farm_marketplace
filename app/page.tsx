import Image from "next/image";
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Globe,
  Heart,
  Leaf,
  MapPin,
  Package,
  Percent,
  Shield,
  ShoppingBag,
  Sparkles,
  Star,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";

import { getOptionalSession } from "@/lib/auth";
import { getFeaturedProducts, getMarketplaceSnapshot } from "@/lib/market";
import { LoadingLink } from "@/app/ui/navigation-progress";

type FeatureColor = "emerald" | "blue" | "amber";
type StatColor = "emerald" | "blue" | "amber";

const features = [
  {
    icon: Leaf,
    title: "Direct Farm Sourcing",
    description:
      "Bypass middlemen entirely. Connect with 500+ verified local farmers for the freshest produce at fair prices.",
    color: "emerald" as FeatureColor,
    chip: "🌾 Core feature",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=700&h=900&fit=crop",
    big: true,
  },
  {
    icon: TrendingUp,
    title: "Smart Negotiation",
    description:
      "Built-in offer flows with transparent pricing updates and faster deal closure.",
    color: "blue" as FeatureColor,
    chip: "📊 Business",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500&h=400&fit=crop",
    big: false,
  },
  {
    icon: Truck,
    title: "Streamlined Delivery",
    description:
      "Coordinate, track, and optimise every order in one place without extra tools.",
    color: "amber" as FeatureColor,
    chip: "🚚 Logistics",
    image:
      "https://images.unsplash.com/photo-1526570207772-784d36084510?w=500&h=400&fit=crop",
    big: false,
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Market trends and pricing intelligence at a glance.",
    color: "blue" as FeatureColor,
    chip: "📈 Insights",
    image:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=350&fit=crop",
    big: false,
  },
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Every listing verified. Every delivery protected.",
    color: "emerald" as FeatureColor,
    chip: "✅ Assurance",
    image:
      "https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=500&h=350&fit=crop",
    big: false,
  },
];

const stats = [
  {
    label: "Active Farmers",
    icon: Users,
    key: "farmers" as const,
    color: "emerald" as StatColor,
  },
  {
    label: "Fresh Listings",
    icon: Package,
    key: "products" as const,
    color: "blue" as StatColor,
  },
  {
    label: "Pending Offers",
    icon: TrendingUp,
    key: "pendingOffers" as const,
    color: "amber" as StatColor,
  },
];

const howSteps = [
  {
    step: "01",
    title: "Browse Listings",
    description: "Explore fresh produce from local farmers near you, filtered by distance and category.",
    icon: ShoppingBag,
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
  },
  {
    step: "02",
    title: "Make an Offer",
    description: "Negotiate prices directly with farmers — no hidden fees, just transparent deal-making.",
    icon: TrendingUp,
    image: "https://images.unsplash.com/photo-1556741533-6e6a3bd8b0b2?w=400&h=300&fit=crop",
  },
  {
    step: "03",
    title: "Confirm Order",
    description: "Finalise details, choose delivery slot, and lock your fresh produce in seconds.",
    icon: Package,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
  },
  {
    step: "04",
    title: "Track Delivery",
    description: "Real-time GPS tracking from the farm gate straight to your doorstep.",
    icon: Truck,
    image: "https://images.unsplash.com/photo-1526570207772-784d36084510?w=400&h=300&fit=crop",
  },
];

const marqueeItems = [
  "Direct Farm Sourcing",
  "Smart Negotiation",
  "Real-time Tracking",
  "Quality Verified",
  "Pan India Delivery",
  "24h Fresh Guarantee",
  "No Middlemen",
  "Transparent Pricing",
];

export default async function Home() {
  const [snapshot, featuredProducts, session] = await Promise.all([
    getMarketplaceSnapshot(),
    getFeaturedProducts(),
    getOptionalSession(),
  ]);

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ fontFamily: "'DM Sans', sans-serif", background: "#f5f0e8" }}>

      {/* ── GRAIN OVERLAY ── */}
      <div className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.025]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")" }}
      />

      

      {/* ── HERO ── */}
      <section className="grid min-h-screen lg:grid-cols-2">
        {/* Left */}
        <div
          className="relative flex flex-col justify-center overflow-hidden px-10 pb-20 pt-36"
          style={{ background: "#0d3d2b" }}
        >
          {/* Background blobs */}
          <div className="absolute bottom-[-80px] right-[-80px] h-72 w-72 rounded-full opacity-30" style={{ background: "#2d7a54" }} />
          <div className="absolute left-[-40px] top-[20%] h-40 w-40 rounded-full opacity-10" style={{ background: "#7fc15e", filter: "blur(40px)" }} />

          {/* Badge */}
          <div
            className="mb-8 inline-flex w-fit items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)", color: "#7fc15e", animation: "fadeUp 0.8s ease both" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#7fc15e", animation: "pulseDot 2s infinite" }} />
            Now live across India
          </div>

          {/* H1 */}
          <h1
            className="leading-none tracking-tight text-white"
            style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2.8rem, 5vw, 5rem)", fontWeight: 900, letterSpacing: "-0.03em", animation: "fadeUp 0.8s 0.1s ease both" }}
          >
            Fresh produce<br />sourcing
            <em className="mt-1 block not-italic" style={{ color: "#f0b429" }}>reimagined.</em>
          </h1>

          {/* Sub */}
          <p
            className="mt-6 max-w-md text-lg font-light leading-relaxed"
            style={{ color: "rgba(255,255,255,0.62)", animation: "fadeUp 0.8s 0.2s ease both" }}
          >
            Connect farmers, restaurants, and shops in one seamless workflow. From listings to delivery — a cleaner farm-to-business supply chain.
          </p>

          {/* Actions */}
          <div className="mt-10 flex flex-wrap gap-4" style={{ animation: "fadeUp 0.8s 0.3s ease both" }}>
            <LoadingLink
              href={session ? "/dashboard" : "/signup"}
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all hover:scale-105 hover:shadow-2xl"
              style={{ background: "#f0b429", color: "#1c1c1c", boxShadow: "0 4px 20px rgba(200,148,26,0.4)" }}
            >
              {session ? "Go to dashboard" : "Get started free"}
              <ArrowRight className="h-4 w-4" />
            </LoadingLink>
            <LoadingLink
              href="/listings"
              className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-medium transition-all"
              style={{ border: "1.5px solid rgba(255,255,255,0.24)", color: "rgba(255,255,255,0.8)", background: "transparent" }}
            >
              Browse listings
              <ArrowRight className="h-4 w-4" />
            </LoadingLink>
          </div>

          {/* Trust row */}
          <div className="mt-12 flex items-center gap-5" style={{ animation: "fadeUp 0.8s 0.4s ease both" }}>
            <div className="flex">
              {["AK", "RP", "MS", "+"].map((initials, i) => (
                <div
                  key={initials}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ border: "2px solid #0d3d2b", background: "#2d7a54", marginLeft: i === 0 ? 0 : "-8px" }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">500+ farmers joined this month</p>
              <p className="text-xs" style={{ color: "rgba(255,255,255,0.45)" }}>Rated 4.9 ★ by 2,000+ buyers</p>
            </div>
          </div>

          {/* Stat cards from snapshot */}
          <div className="mt-12 grid grid-cols-3 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              const value = snapshot[stat.key];
              return (
                <div
                  key={stat.label}
                  className="rounded-2xl p-4 transition-all hover:scale-105"
                  style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
                >
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.45)" }}>{stat.label}</p>
                  <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{value}</p>
                  <Icon className="mt-1 h-3.5 w-3.5" style={{ color: "#7fc15e" }} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right image */}
        <div className="relative hidden overflow-hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=900&h=1100&fit=crop"
            alt="Fresh vegetables"
            fill
            className="object-cover transition-transform duration-700 hover:scale-105"
            priority
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(13,61,43,0.6) 100%)" }} />

          {/* Floating stat cards */}
          {[
            { top: "28%", left: "-30px", icon: "🌿", label: "Active Farmers", value: "2,840", sub: "↑ 18% this week", delay: "0s" },
            { bottom: "20%", right: "30px", icon: "📦", label: "Orders Today", value: "142", sub: "⚡ 24h delivery", delay: "2s" },
            { top: "10%", right: "40px", icon: "✅", label: "Quality Score", value: "98%", sub: "Verified produce", delay: "4s" },
          ].map((card) => (
            <div
              key={card.label}
              className="absolute rounded-2xl px-5 py-4 shadow-2xl backdrop-blur-xl"
              style={{
                ...("top" in card ? { top: card.top } : {}),
                ...("bottom" in card ? { bottom: (card as any).bottom } : {}),
                ...("left" in card ? { left: (card as any).left } : {}),
                ...("right" in card ? { right: (card as any).right } : {}),
                background: "rgba(245,240,232,0.92)",
                animation: `floatCard 6s ease-in-out infinite`,
                animationDelay: card.delay,
              }}
            >
              <div className="text-lg">{card.icon}</div>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "#6b7c6a" }}>{card.label}</p>
              <p className="text-2xl font-bold leading-tight" style={{ fontFamily: "'Playfair Display', serif", color: "#0d3d2b" }}>{card.value}</p>
              <p className="mt-0.5 text-xs" style={{ color: "#6b7c6a" }}>{card.sub}</p>
            </div>
          ))}

          {/* Scroll hint */}
          <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Scroll</span>
            <div className="relative h-10 w-px overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <div className="absolute top-0 h-full w-full" style={{ background: "#f0b429", animation: "scrollDrop 2s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div
        className="overflow-hidden py-4"
        style={{ background: "#0d3d2b", borderTop: "1px solid rgba(255,255,255,0.07)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex w-max" style={{ animation: "marquee 28s linear infinite" }}>
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 whitespace-nowrap px-10 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.45)" }}
            >
              <span className="h-1 w-1 rounded-full" style={{ background: "#c8941a" }} />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* ── FEATURES ── */}
      <section className="px-6 py-28 sm:px-10 lg:px-16">
        <div className="reveal mb-4 flex items-center gap-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#2d7a54" }}>
          <span className="h-0.5 w-6 rounded-full" style={{ background: "#2d7a54" }} />
          Why choose us
        </div>
        <h2 className="reveal mb-12 text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif", color: "#1c1c1c", lineHeight: 1.1 }}>
          Everything you need<br />
          <em className="not-italic" style={{ color: "#2d7a54" }}>to scale your sourcing</em>
        </h2>

        {/* Mosaic grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3" style={{ gridAutoRows: "240px" }}>
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className={`reveal group relative overflow-hidden rounded-3xl transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl ${idx === 0 ? "md:row-span-2 lg:col-span-1 lg:row-span-2" : ""}`}
                style={{ cursor: "pointer" }}
              >
                <div className="absolute inset-0">
                  <Image src={feature.image} alt={feature.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(13,61,43,0.93) 0%, rgba(13,61,43,0.3) 50%, transparent 100%)" }} />
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <div
                    className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider"
                    style={{ background: "rgba(127,193,94,0.18)", border: "1px solid rgba(127,193,94,0.35)", color: "#7fc15e" }}
                  >
                    {feature.chip}
                  </div>
                  <h3
                    className="font-bold text-white"
                    style={{ fontFamily: "'Playfair Display', serif", fontSize: idx === 0 ? "1.9rem" : "1.3rem", lineHeight: 1.2 }}
                  >
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.68)" }}>
                    {feature.description}
                  </p>
                  <div
                    className="mt-4 inline-flex h-9 w-9 items-center justify-center rounded-full text-sm transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
                    style={{ background: "#f0b429", color: "#1c1c1c" }}
                  >
                    ↗
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <div
        className="relative grid grid-cols-2 overflow-hidden lg:grid-cols-4"
        style={{ background: "#1c1c1c" }}
      >
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 50%, rgba(45,122,84,0.18), transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(200,148,26,0.09), transparent 60%)" }} />
        {[
          { label: "Active Users", value: "10K", suffix: "+", icon: "🌾" },
          { label: "Partner Farms", value: "500", suffix: "+", icon: "🏡" },
          { label: "Successful Deals", value: "25K", suffix: "+", icon: "🤝" },
          { label: "Satisfaction Rate", value: "98", suffix: "%", icon: "❤️" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className="reveal relative z-10 py-16 text-center transition-all hover:bg-white/[0.03]"
            style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none" }}
          >
            <div className="mb-3 text-3xl">{stat.icon}</div>
            <p
              className="font-black text-white"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "3.2rem", lineHeight: 1, letterSpacing: "-0.03em" }}
            >
              {stat.value}<span style={{ color: "#f0b429" }}>{stat.suffix}</span>
            </p>
            <p className="mt-2 text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.38)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section className="bg-white px-6 py-28 sm:px-10 lg:px-16">
        <div className="mb-14 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="reveal mb-1 flex items-center gap-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#2d7a54" }}>
              <span className="h-0.5 w-6 rounded-full" style={{ background: "#2d7a54" }} />
              Hand-picked selections
            </div>
            <h2 className="reveal text-4xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: "#1c1c1c", lineHeight: 1.1 }}>
              Fresh harvests<br />
              <em className="not-italic" style={{ color: "#2d7a54" }}>available now</em>
            </h2>
          </div>
          <LoadingLink
            href="/listings"
            className="reveal inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold transition-all hover:scale-105 hover:shadow-xl"
            style={{ background: "#0d3d2b", color: "#f5f0e8" }}
          >
            View all listings <ArrowRight className="h-4 w-4" />
          </LoadingLink>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, idx) => (
            <article
              key={product.id}
              className="reveal group overflow-hidden rounded-3xl border transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{ background: "#f5f0e8", borderColor: "#e8e0d0" }}
            >
              <div className="relative h-56 overflow-hidden">
                <Image
                  src={product.images[0] || "/produce-placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.3) 100%)" }} />
                <div
                  className="absolute left-3.5 top-3.5 rounded-full px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-white"
                  style={{ background: "#0d3d2b" }}
                >
                  {product.category}
                </div>
                <div
                  className="absolute right-3.5 top-3.5 rounded-full px-3.5 py-1.5 text-xs font-bold"
                  style={{ background: "rgba(245,240,232,0.95)", color: "#0d3d2b", backdropFilter: "blur(4px)" }}
                >
                  {product.freshnessNote}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1c1c1c" }}>
                  {product.title}
                </h3>
                <div className="mt-4 space-y-2">
                  {[
                    { icon: MapPin, text: product.location },
                    { icon: Package, text: `${product.quantity} ${product.unit} available` },
                    { icon: Calendar, text: `Harvested on ${product.harvestDate}` },
                  ].map(({ icon: Icon, text }) => (
                    <div key={text} className="flex items-center gap-2.5 text-sm" style={{ color: "#6b7c6a" }}>
                      <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: "#2d7a54" }} />
                      {text}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between border-t pt-4" style={{ borderColor: "#e8e0d0" }}>
                  <p className="font-bold" style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", color: "#0d3d2b", lineHeight: 1 }}>
                    ₹{product.price}
                    <span className="ml-1 text-sm font-normal" style={{ color: "#6b7c6a" }}>/{product.unit}</span>
                  </p>
                  <LoadingLink
                    href="/listings"
                    className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all hover:scale-105"
                    style={{ background: "#0d3d2b", color: "#f5f0e8" }}
                  >
                    View details <ArrowRight className="h-3.5 w-3.5" />
                  </LoadingLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="relative overflow-hidden px-6 py-28 sm:px-10 lg:px-16" style={{ background: "#f5f0e8" }}>
        {/* bg decoration */}
        <div className="pointer-events-none absolute right-[-200px] top-[-200px] h-[600px] w-[600px] rounded-full" style={{ background: "radial-gradient(circle, rgba(127,193,94,0.11), transparent 70%)" }} />

        <div className="mb-16 text-center">
          <div className="reveal mx-auto mb-4 flex w-fit items-center gap-3 text-xs font-bold uppercase tracking-widest" style={{ color: "#2d7a54" }}>
            <span className="h-0.5 w-6 rounded-full" style={{ background: "#2d7a54" }} />
            Simple process
          </div>
          <h2 className="reveal text-4xl font-bold tracking-tight sm:text-5xl" style={{ fontFamily: "'Playfair Display', serif", color: "#1c1c1c", lineHeight: 1.1 }}>
            How FarmDirect <em className="not-italic" style={{ color: "#2d7a54" }}>works</em>
          </h2>
          <p className="reveal mx-auto mt-5 max-w-xl text-lg" style={{ color: "#6b7c6a" }}>
            Four simple steps from farm to your doorstep — transparent, fast, and reliable.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Connector line (desktop) */}
          <div className="absolute hidden lg:block" style={{ top: "70px", left: "12.5%", right: "12.5%", height: "2px", background: "linear-gradient(to right, #2d7a54, #f0b429)" }} />

          {howSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="reveal group text-center" style={{ transitionDelay: `${i * 0.1}s` }}>
                {/* Number bubble */}
                <div className="relative z-10 mx-auto mb-8 flex h-14 w-14 items-center justify-center rounded-full font-mono text-sm text-white transition-all duration-300 group-hover:scale-110"
                  style={{ background: "#0d3d2b", boxShadow: "0 0 0 6px #f5f0e8, 0 0 0 8px rgba(13,61,43,0.2)" }}>
                  {step.step}
                </div>
                {/* Image */}
                <div className="mb-5 overflow-hidden rounded-2xl shadow-lg">
                  <Image
                    src={step.image}
                    alt={step.title}
                    width={400}
                    height={240}
                    className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: "'Playfair Display', serif", color: "#1c1c1c" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6b7c6a" }}>{step.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── CTA ── */}
      <div className="px-6 pb-20 sm:px-10 lg:px-16">
        <div className="reveal relative min-h-[480px] overflow-hidden rounded-[2rem]">
          {/* BG image */}
          <div className="absolute inset-0">
            <Image
              src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1400&h=600&fit=crop"
              alt="Farm field"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, rgba(13,61,43,0.97) 0%, rgba(26,92,63,0.92) 55%, rgba(13,61,43,0.82) 100%)" }} />
          </div>

          {/* Content */}
          <div className="relative z-10 flex h-full min-h-[480px] flex-col justify-center px-10 py-16 md:px-20 lg:max-w-[55%]">
            <div
              className="mb-6 inline-flex w-fit items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: "rgba(127,193,94,0.14)", border: "1px solid rgba(127,193,94,0.28)", color: "#7fc15e" }}
            >
              🚀 Join thousands of buyers
            </div>
            <h2
              className="font-black leading-tight text-white"
              style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 3.5vw, 3.2rem)", letterSpacing: "-0.02em" }}
            >
              Ready to transform<br />
              <em className="not-italic" style={{ color: "#f0b429" }}>your sourcing?</em>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.62)" }}>
              Join farmers and businesses already using FarmDirect to streamline operations, cut costs, and get fresher produce.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <LoadingLink
                href={session ? "/dashboard" : "/signup"}
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold transition-all hover:scale-105 hover:shadow-2xl"
                style={{ background: "#f0b429", color: "#1c1c1c" }}
              >
                {session ? "Go to dashboard" : "Start for free"}
                <ArrowRight className="h-4 w-4" />
              </LoadingLink>
              <LoadingLink
                href="/login"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold transition-all"
                style={{ border: "1.5px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.8)", background: "transparent" }}
              >
                Contact sales
                <Percent className="h-4 w-4" />
              </LoadingLink>
            </div>

            <div className="mt-10 flex flex-wrap gap-8">
              {[
                { icon: Globe, text: "Pan India Delivery" },
                { icon: Shield, text: "Quality Guaranteed" },
                { icon: Clock, text: "24/7 Support" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 text-sm" style={{ color: "rgba(255,255,255,0.48)" }}>
                  <Icon className="h-4 w-4" style={{ color: "#7fc15e" }} />
                  {text}
                </div>
              ))}
            </div>
          </div>

          {/* Right decoration cards */}
          <div className="absolute bottom-0 right-10 top-0 hidden flex-col justify-center gap-4 lg:flex">
            {[
              { label: "Average saving", value: "32%", sub: "vs traditional sourcing" },
              { label: "Avg. delivery time", value: "18 hrs", sub: "from harvest to door" },
              { label: "Freshness score", value: "98%", sub: "buyer satisfaction" },
            ].map((card) => (
              <div
                key={card.label}
                className="min-w-[200px] rounded-2xl px-6 py-4"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.11)", backdropFilter: "blur(12px)" }}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.38)" }}>{card.label}</p>
                <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{card.value}</p>
                <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.35)" }}>{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer className="px-6 pb-8 pt-16 sm:px-10 lg:px-16" style={{ background: "#1c1c1c" }}>
        <div className="mb-12 flex flex-col justify-between gap-10 md:flex-row md:items-start">
          <div>
            <p className="text-2xl font-black" style={{ fontFamily: "'Playfair Display', serif", color: "white" }}>
              Farm<span style={{ color: "#c8941a" }}>Direct</span>
            </p>
            <p className="mt-3 max-w-[240px] text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.32)" }}>
              Connecting farms to businesses across India — fresher, faster, fairer.
            </p>
          </div>
          <div className="flex flex-wrap gap-12">
            {[
              { heading: "Platform", links: ["Browse Listings", "For Farmers", "For Buyers", "Pricing"] },
              { heading: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
              { heading: "Legal", links: ["Privacy Policy", "Terms of Use", "Cookie Policy"] },
            ].map((group) => (
              <div key={group.heading}>
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>{group.heading}</h4>
                {group.links.map((link) => (
                  <a key={link} href="#" className="mb-2.5 block text-sm transition-colors hover:text-white" style={{ color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>{link}</a>
                ))}
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.22)" }}>© 2026 FarmDirect Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-3">
            {["𝕏", "in", "f", "▶"].map((s) => (
              <a key={s} href="#" className="flex h-9 w-9 items-center justify-center rounded-full text-sm transition-all hover:text-white"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.38)", textDecoration: "none" }}>
                {s}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {/* ── FONT IMPORT + ANIMATIONS ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400&display=swap');

        @keyframes pulseDot {
          0%,100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.6); opacity: 0.55; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatCard {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes scrollDrop {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        /* Scroll reveal */
        .reveal {
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.7s ease, transform 0.7s ease;
        }
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Nav scroll shrink */
        #main-nav.scrolled {
          padding-top: 12px;
          padding-bottom: 12px;
        }
      `}</style>

      {/* ── CLIENT-SIDE SCRIPTS ── */}
      <script dangerouslySetInnerHTML={{ __html: `
        // Scroll reveal
        (function() {
          const els = document.querySelectorAll('.reveal');
          const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
          }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
          els.forEach(el => obs.observe(el));
        })();

        // Nav shrink on scroll
        (function() {
          const nav = document.getElementById('main-nav');
          window.addEventListener('scroll', () => {
            nav.classList.toggle('scrolled', window.scrollY > 60);
          }, { passive: true });
        })();
      ` }} />
    </div>
  );
}
