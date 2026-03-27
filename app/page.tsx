import Link from "next/link";
import Image from "next/image";
import { getOptionalSession } from "@/lib/auth";
import { getFeaturedProducts, getMarketplaceSnapshot } from "@/lib/market";
import { 
  ArrowRight, 
  Leaf, 
  TrendingUp, 
  Truck, 
  Users, 
  Star,
  Calendar,
  MapPin,
  Package,
  Shield,
  Sparkles,
  ChevronRight,
  Clock,
  Award,
  ShoppingBag,
  CheckCircle2,
  Heart,
  Percent,
  Globe
} from "lucide-react";

type FeatureColor = 'emerald' | 'blue' | 'amber';
type StatColor = 'emerald' | 'blue' | 'amber';

const features = [
  {
    icon: Leaf,
    title: "Direct Farm Sourcing",
    description: "Connect directly with local farmers for the freshest produce, eliminating middlemen and reducing costs by up to 40%.",
    color: "emerald" as FeatureColor,
    image: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=600&h=400&fit=crop"
  },
  {
    icon: TrendingUp,
    title: "Smart Negotiation",
    description: "Built-in offer and negotiation flow with real-time updates, making deals transparent and efficient.",
    color: "blue" as FeatureColor,
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
  },
  {
    icon: Truck,
    title: "Streamlined Logistics",
    description: "Simple logistics coordination and end-to-end order tracking for seamless delivery management.",
    color: "amber" as FeatureColor,
    image: "https://images.unsplash.com/photo-1526570207772-784d36084510?w=600&h=400&fit=crop"
  }
];

const stats = [
  { label: "Active Farmers", icon: Users, key: "farmers" as const, value: 0, color: "emerald" as StatColor },
  { label: "Fresh Listings", icon: Package, key: "products" as const, value: 0, color: "blue" as StatColor },
  { label: "Pending Offers", icon: TrendingUp, key: "pendingOffers" as const, value: 0, color: "amber" as StatColor }
];

export default async function Home() {
  const [snapshot, featuredProducts, session] = await Promise.all([
    getMarketplaceSnapshot(),
    getFeaturedProducts(),
    getOptionalSession(),
  ]);

  // Define color mappings with proper types
  const getColorGradient = (color: StatColor): string => {
    const gradients: Record<StatColor, string> = {
      emerald: "from-emerald-500 to-emerald-600",
      blue: "from-blue-500 to-blue-600",
      amber: "from-amber-500 to-amber-600"
    };
    return gradients[color];
  };

  const getFeatureColorClasses = (color: FeatureColor): string => {
    const classes: Record<FeatureColor, string> = {
      emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white",
      blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
      amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white"
    };
    return classes[color];
  };

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Hero Section with Full Background Image */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background Image */}
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

        {/* Animated Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-amber-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-float" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-12 w-full">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in-up">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 px-5 py-2.5 text-sm font-medium text-white">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                Welcome to FarmDirect
              </div>
              
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl leading-tight">
                Fresh produce sourcing
                <span className="block mt-2 bg-gradient-to-r from-emerald-400 via-emerald-300 to-amber-300 bg-clip-text text-transparent">
                  made simple.
                </span>
              </h1>
              
              <p className="text-xl leading-relaxed text-gray-200 max-w-2xl">
                Connect farmers, restaurants, and shops in one seamless workflow. 
                From listings to delivery, experience the future of farm-to-table commerce.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:shadow-2xl hover:scale-105 hover:from-emerald-600 hover:to-emerald-700 shadow-lg"
                  href={session ? "/dashboard" : "/signup"}
                >
                  {session ? "Go to dashboard" : "Start sourcing"}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-md px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:scale-105 hover:border-white/50"
                  href="/listings"
                >
                  Browse listings
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 border-2 border-white flex items-center justify-center">
                        <span className="text-xs font-bold text-white">✓</span>
                      </div>
                    ))}
                  </div>
                  <span className="text-sm text-gray-200">Trusted by 500+ businesses</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm text-gray-200">24/7 Customer Support</span>
                </div>
              </div>
            </div>

            {/* Right Content - Stats and Image Cards */}
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  const value = snapshot[stat.key];
                  const gradientClass = getColorGradient(stat.color);
                  
                  return (
                    <div
                      key={stat.label}
                      className="group relative overflow-hidden rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-6 transition-all hover:bg-white/20 hover:scale-105 hover:border-white/40"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-xs font-medium text-gray-300 uppercase tracking-wide">{stat.label}</p>
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

              {/* Featured Image Card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 p-1 transition-all hover:scale-105">
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
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <p className="text-xs font-semibold text-emerald-300 uppercase tracking-wide">Today's harvest</p>
                  </div>
                  <p className="text-lg font-semibold text-white">Fresh from local farms</p>
                  <p className="text-sm text-gray-300 mt-1">Direct delivery within 24 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section with Images */}
      <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10 lg:px-12">
        <div className="text-center mb-20">
          <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Why choose us</p>
          <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything you need to scale
          </h2>
          <div className="mt-4 w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto rounded-full"></div>
          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
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
                className="group relative rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 border border-gray-100 overflow-hidden"
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
                  <div className={`inline-flex rounded-xl p-3 transition-all duration-300 -mt-12 relative z-10 shadow-lg ${colorClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="mt-3 text-gray-600 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm text-emerald-600 font-semibold">
                    <span>Learn more</span>
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Stats Section with Background Image */}
      <section className="relative py-32 overflow-hidden">
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
              { label: "Satisfied Customers", value: "98%", icon: Heart }
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center group">
                  <div className="inline-flex rounded-full bg-white/10 backdrop-blur-sm p-4 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <p className="text-4xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-200 mt-2">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products Section with Enhanced Images */}
      <section className="mx-auto max-w-7xl px-6 py-32 sm:px-10 lg:px-12">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between mb-12">
          <div>
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide flex items-center gap-2">
              <Star className="h-4 w-4 fill-emerald-600" />
              Hand-picked selections
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
              Fresh harvests available now
            </h2>
            <div className="mt-2 w-20 h-0.5 bg-emerald-500"></div>
            <p className="mt-4 text-lg text-gray-600">
              Discover the finest produce from local farms
            </p>
          </div>
          <Link
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-3 text-sm font-semibold text-white transition-all hover:shadow-xl hover:scale-105"
            href="/listings"
          >
            View all listings
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {featuredProducts.map((product, index) => {
            const productImages = [
              "https://images.unsplash.com/photo-1542838132-92c53300491e",
              "https://images.unsplash.com/photo-1566386473540-6f97f42d8c7f",
              "https://images.unsplash.com/photo-1597362876212-7c0b9775c32b"
            ];
            
            return (
              <article
                key={product.id}
                className="group relative rounded-2xl bg-white shadow-xl transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              >
                {/* Product Image */}
                <div className="relative h-64 w-full overflow-hidden bg-gray-100">
                  <Image
                    src={`${productImages[index % productImages.length]}?w=800&h=600&fit=crop`}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Freshness Badge */}
                  {product.freshnessNote && (
                    <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 shadow-lg">
                      <Sparkles className="h-3 w-3 text-amber-500" />
                      <span className="text-xs font-semibold text-amber-700">{product.freshnessNote}</span>
                    </div>
                  )}
                  
                  {/* Category Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex rounded-full bg-white/95 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-emerald-700">
                      {product.category}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {product.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-2.5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>{product.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>{product.quantity} {product.unit} available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                      <span>Harvested on {product.harvestDate}</span>
                    </div>
                  </div>

                  {/* Price and Action */}
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        ₹{product.price}
                        <span className="text-sm font-normal text-gray-500">/{product.unit}</span>
                      </p>
                    </div>
                    <Link
                      className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-600 hover:text-white hover:shadow-md"
                      href={`/listings/${product.id}`}
                    >
                      View details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        </div>
        
        <div className="relative mx-auto max-w-7xl px-6 sm:px-10 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Simple process</p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              How FarmDirect works
            </h2>
            <div className="mt-4 w-24 h-1 bg-gradient-to-r from-emerald-500 to-emerald-600 mx-auto rounded-full"></div>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
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
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
              },
              {
                step: "02",
                title: "Make an Offer",
                description: "Negotiate prices directly with farmers",
                icon: TrendingUp,
                image: "https://images.unsplash.com/photo-1556741533-6e6a3bd8b0b2?w=400&h=300&fit=crop"
              },
              {
                step: "03",
                title: "Confirm Order",
                description: "Finalize details and schedule delivery",
                icon: Package,
                image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop"
              },
              {
                step: "04",
                title: "Track Delivery",
                description: "Real-time tracking from farm to your doorstep",
                icon: Truck,
                image: "https://images.unsplash.com/photo-1526570207772-784d36084510?w=400&h=300&fit=crop"
              }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="group relative text-center">
                  <div className="relative h-52 w-full overflow-hidden rounded-2xl mb-6 shadow-lg">
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
                  <div className="inline-flex rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 mb-4 shadow-lg">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section with Background Image */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=1920&h=800&fit=crop"
            alt="Farm field"
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/95 to-emerald-800/95" />
        </div>
        
        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 lg:px-12 text-center">
          <Shield className="h-16 w-16 text-emerald-300 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to transform your sourcing?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of farmers and businesses already using FarmDirect to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-lg font-semibold text-emerald-900 transition-all hover:shadow-2xl hover:scale-105"
              href={session ? "/dashboard" : "/signup"}
            >
              {session ? "Go to dashboard" : "Get started now"}
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-white/20 hover:scale-105"
              href="/contact"
            >
              Contact sales
              <Percent className="h-5 w-5" />
            </Link>
          </div>
          
          {/* Trust Badges */}
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

      {/* Add global styles for animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        
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
        
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
      `}</style>
    </div>
  );
}