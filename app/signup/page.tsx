import Link from "next/link";
import { 
  UserPlus, 
  Shield, 
  Truck, 
  ShoppingBag, 
  Leaf, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  MapPin,
  Clock
} from "lucide-react";
import { SignupForm } from "@/app/ui/forms";

export default function SignupPage() {
  const features = [
    {
      title: "Farmers",
      text: "Publish produce, share harvest freshness, set delivery options, and respond to buyer offers fast.",
      icon: Leaf,
      color: "emerald"
    },
    {
      title: "Buyers",
      text: "Browse local listings, negotiate target pricing, save suppliers, and manage recurring orders.",
      icon: ShoppingBag,
      color: "blue"
    },
    {
      title: "Admins",
      text: "Approve farmers, monitor trust and transaction signals, and keep the marketplace healthy.",
      icon: Shield,
      color: "purple"
    },
    {
      title: "India-ready",
      text: "Designed for multilingual onboarding, local delivery coordination, and Razorpay-friendly payment flow.",
      icon: MapPin,
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Column - Signup Form */}
          <div className="order-2 lg:order-1">
            <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8 md:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-4">
                  <UserPlus className="h-4 w-4" />
                  Create account
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
                  Join the future of
                  <span className="block text-emerald-600 mt-1">farm-to-table commerce</span>
                </h1>
                <p className="mt-4 text-base text-gray-600 leading-relaxed">
                  Set your role, location, and profile details so the platform can match
                  you to the right sourcing, delivery, and trust workflows.
                </p>
              </div>

              <div className="mt-8">
                <SignupForm />
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <p className="text-center text-sm text-gray-600">
                  Already have an account?{" "}
                  <Link 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1" 
                    href="/login"
                  >
                    Sign in
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Benefits */}
          <div className="order-1 lg:order-2 space-y-8">
            {/* Hero Card */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-8 md:p-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-emerald-100 mb-6">
                  <Sparkles className="h-4 w-4" />
                  Built for trust
                </div>
                
                <h2 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                  Start with onboarding that makes
                  <span className="block text-emerald-200 mt-2">matching smarter</span>
                </h2>
                
                <p className="mt-6 text-base text-emerald-100/90 leading-relaxed max-w-xl">
                  Location-aware sourcing, better negotiation context, smarter
                  delivery options, and future AI pricing all depend on a strong
                  onboarding foundation.
                </p>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 gap-4 sm:flex sm:gap-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm text-emerald-100">Verified farmers</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm text-emerald-100">Pan-India delivery</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-emerald-300" />
                    <span className="text-sm text-emerald-100">24/7 support</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid gap-5 sm:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon;
                const colorClasses: Record<string, string> = {
                  emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600",
                  blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600",
                  purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600",
                  amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-600"
                };
                const colorClass = colorClasses[feature.color as keyof typeof colorClasses];
                
                return (
                  <div
                    key={feature.title}
                    className="group rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 p-6 border border-gray-100 hover:-translate-y-1"
                  >
                    <div className={`inline-flex rounded-xl p-3 transition-all duration-300 ${colorClass} group-hover:text-white`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {feature.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Trust Badge */}
            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="rounded-full bg-emerald-100 p-3">
                    <Users className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">
                    Join 500+ businesses already on FarmDirect
                  </h4>
                  <p className="text-sm text-gray-600">
                    From small farms to large distributors, we're building India's most trusted agricultural marketplace.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add global styles for animations */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
          font-family: 'Poppins', sans-serif;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}