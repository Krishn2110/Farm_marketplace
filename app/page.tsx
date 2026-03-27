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
      "Connect directly with local farmers for fresher produce and fewer middlemen.",
    color: "emerald" as FeatureColor,
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop",
  },
  {
    icon: TrendingUp,
    title: "Smart Negotiation",
    description:
      "Built-in offer and negotiation flow with transparent updates and faster deal closure.",
    color: "blue" as FeatureColor,
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop",
  },
  {
    icon: Truck,
    title: "Streamlined Logistics",
    description:
      "Coordinate delivery, track orders, and keep supply moving without extra tools.",
    color: "amber" as FeatureColor,
    image:
      "https://images.unsplash.com/photo-1526570207772-784d36084510?w=600&h=400&fit=crop",
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

export default async function Home() {
  const [snapshot, featuredProducts, session] = await Promise.all([
    getMarketplaceSnapshot(),
    getFeaturedProducts(),
    getOptionalSession(),
  ]);

  const getColorGradient = (color: StatColor): string => {
    const gradients: Record<StatColor, string> = {
      emerald: "from-emerald-500 to-emerald-600",
      blue: "from-blue-500 to-blue-600",
      amber: "from-amber-500 to-amber-600",
    };
    return gradients[color];
  };

  const getFeatureColorClasses = (color: FeatureColor): string => {
    const classes: Record<FeatureColor, string> = {
      emerald:
        "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      amber:
        "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white",
    };
    return classes[color];
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <section className="relative flex min-h-screen items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=1920&h=1080&fit=crop"
            alt="Fresh farm produce background"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.15),transparent_50%)]" />
        </div>

        <div className="absolute inset-0 overflow-hidden">
          <div className="animate-float absolute left-10 top-20 h-72 w-72 rounded-full bg-emerald-500 opacity-10 blur-3xl" />
          <div
            className="animate-float absolute bottom-20 right-10 h-96 w-96 rounded-full bg-amber-500 opacity-10 blur-3xl"
            style={{ animationDelay: "2s" }}
          />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-24 sm:px-10 lg:px-12">
          <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-20">
            <div className="animate-fade-in-up space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-md">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Welcome to FarmDirect
              </div>

              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                Fresh produce sourcing
                <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                  made simple.
                </span>
              </h1>

              <p className="max-w-2xl text-xl leading-relaxed text-gray-200">
                Connect farmers, restaurants, and shops in one seamless workflow.
                From listings to delivery, experience a cleaner farm-to-business
                supply chain.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <LoadingLink
                  className="btn-light inline-flex items-center gap-2"
                  href={session ? "/dashboard" : "/signup"}
                >
                  {session ? "Go to dashboard" : "Get started"}
                  <ArrowRight className="h-4 w-4" />
                </LoadingLink>
                <LoadingLink className="btn-outline-light" href="/listings">
                  Browse listings
                </LoadingLink>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  const value = snapshot[stat.key];
                  const gradientClass = getColorGradient(stat.color);

                  return (
                    <div
                      key={stat.label}
                      className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-md transition-all hover:scale-105 hover:border-white/40 hover:bg-white/20"
                    >
                      <div className="absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-white/0 via-white/5 to-white/0 transition-transform duration-1000 group-hover:translate-x-[100%]" />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium uppercase tracking-wide text-gray-300">
                            {stat.label}
                          </p>
                          <p className="mt-2 text-3xl font-bold text-white">{value}</p>
                        </div>
                        <div className={`rounded-lg bg-gradient-to-br ${gradientClass} p-2`}>
                          <Icon className="h-5 w-5 text-white" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-1 backdrop-blur-md transition-all hover:scale-105">
                <div className="relative h-52 w-full overflow-hidden rounded-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=800&h=600&fit=crop"
                    alt="Fresh organic vegetables"
                    fill
                    className="object-cover transition-transform duration-700 hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
                <div className="p-5">
                  <div className="mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-300">
                      Today&apos;s harvest
                    </p>
                  </div>
                  <p className="text-lg font-semibold text-white">Fresh from local farms</p>
                  <p className="mt-1 text-sm text-gray-300">Direct delivery within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="flex h-10 w-6 justify-center rounded-full border-2 border-white/30">
            <div className="mt-2 h-2 w-1 animate-pulse rounded-full bg-white/50" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10 lg:px-12">
        <div className="mb-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            Why choose us
          </p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything you need to scale
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
          <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
            Powerful features designed to streamline your farm-to-table operations
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            const colorClass = getFeatureColorClasses(feature.color);

            return (
              <div
                key={feature.title}
                className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl transition-all hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                </div>
                <div className="p-6">
                  <div
                    className={`relative z-10 -mt-12 inline-flex rounded-xl p-3 shadow-lg transition-all duration-300 ${colorClass}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 leading-relaxed text-gray-600">
                    {feature.description}
                  </p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-emerald-600">
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&h=800&fit=crop"
            alt="Farm landscape"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Active Users", value: "10K+", icon: Users },
              { label: "Partner Farms", value: "500+", icon: Leaf },
              { label: "Successful Deals", value: "25K+", icon: CheckCircle2 },
              { label: "Satisfied Customers", value: "98%", icon: Heart },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="group text-center">
                  <div className="mb-4 inline-flex rounded-full bg-white/10 p-4 backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 text-sm text-gray-200">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10 lg:px-12">
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-600">
              <Star className="h-4 w-4 fill-emerald-600" />
              Hand-picked selections
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
              Fresh harvests available now
            </h2>
            <div className="mt-2 h-0.5 w-20 bg-emerald-500" />
            <p className="mt-4 text-lg text-gray-600">
              Discover the finest produce from local farms
            </p>
          </div>
          <LoadingLink
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105 hover:shadow-xl"
            href="/listings"
          >
            View all listings
            <ArrowRight className="h-4 w-4" />
          </LoadingLink>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {featuredProducts.map((product) => (
            <article
              key={product.id}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-2xl"
            >
              <div className="relative h-52 w-full overflow-hidden">
                <Image
                  src={product.images[0] || "/produce-placeholder.svg"}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
                <div className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-emerald-800">
                  {product.freshnessNote}
                </div>
              </div>

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  {product.category}
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-stone-950">
                  {product.title}
                </h3>

                <div className="mt-4 space-y-2.5 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>{product.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>
                      {product.quantity} {product.unit} available
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span>Harvested on {product.harvestDate}</span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    Rs. {product.price}
                    <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                  </p>

                  <LoadingLink
                    className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-md"
                    href="/listings"
                  >
                    View details
                    <ArrowRight className="h-4 w-4" />
                  </LoadingLink>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white py-32">
        <div className="absolute inset-0">
          <div className="absolute left-0 top-0 h-96 w-96 rounded-full bg-emerald-100 opacity-30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-amber-100 opacity-30 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="mb-20 text-center">
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Simple process
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How FarmDirect works
            </h2>
            <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600" />
            <p className="mx-auto mt-6 max-w-3xl text-xl text-gray-600">
              Get fresh produce from farm to table in four simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                step: "01",
                title: "Browse Listings",
                description: "Explore fresh produce from local farmers near you",
                icon: ShoppingBag,
                image:
                  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
              },
              {
                step: "02",
                title: "Make an Offer",
                description: "Negotiate prices directly with farmers",
                icon: TrendingUp,
                image:
                  "https://images.unsplash.com/photo-1556741533-6e6a3bd8b0b2?w=400&h=300&fit=crop",
              },
              {
                step: "03",
                title: "Confirm Order",
                description: "Finalize details and schedule delivery",
                icon: Package,
                image:
                  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
              },
              {
                step: "04",
                title: "Track Delivery",
                description: "Real-time tracking from farm to your doorstep",
                icon: Truck,
                image:
                  "https://images.unsplash.com/photo-1526570207772-784d36084510?w=400&h=300&fit=crop",
              },
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="group relative text-center">
                  <div className="relative mb-6 h-52 w-full overflow-hidden rounded-2xl shadow-lg">
                    <Image
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-3 left-3 text-4xl font-bold text-white/90">
                      {step.step}
                    </div>
                  </div>
                  <div className="mb-4 inline-flex rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=800&fit=crop"
            alt="Farm field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center sm:px-10 lg:px-12">
          <Shield className="mx-auto mb-6 h-16 w-16 text-emerald-300" />
          <h2 className="mb-4 text-4xl font-bold text-white md:text-5xl">
            Ready to transform your sourcing?
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-emerald-100">
            Join farmers and businesses already using FarmDirect to simplify their
            operations.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <LoadingLink
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-emerald-900 transition-all hover:scale-105 hover:shadow-2xl"
              href={session ? "/dashboard" : "/signup"}
            >
              {session ? "Go to dashboard" : "Get started now"}
              <ArrowRight className="h-5 w-5" />
            </LoadingLink>
            <LoadingLink
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition-all hover:scale-105 hover:bg-white/20"
              href="/login"
            >
              Contact sales
              <Percent className="h-5 w-5" />
            </LoadingLink>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-emerald-300" />
              <span className="text-sm text-white">Pan India Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-300" />
              <span className="text-sm text-white">Quality Guaranteed</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-emerald-300" />
              <span className="text-sm text-white">24/7 Support</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out;
        }
      `}</style>
    </div>
  );
}
