import Link from "next/link";
import { 
  LogIn, 
  ArrowRight, 
  CheckCircle2, 
  TrendingUp, 
  Truck, 
  Globe,
  Sparkles,
  Shield,
  Clock,
  Users,
  BarChart3,
  MessageSquare
} from "lucide-react";
import { DemoLoginButtons, LoginForm } from "@/app/ui/forms";
import { LoadingLink } from "@/app/ui/navigation-progress";

export default function LoginPage() {
  const features = [
    {
      title: "Track live offers without leaving the dashboard",
      icon: TrendingUp,
      color: "emerald"
    },
    {
      title: "Monitor logistics and payment confirmation in one flow",
      icon: Truck,
      color: "blue"
    },
    {
      title: "Access multilingual, India-first marketplace tools",
      icon: Globe,
      color: "amber"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left Column - Hero Section */}
          <div className="order-2 lg:order-1">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 p-8 md:p-10 h-full">
              {/* Animated Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-400/20 rounded-full blur-2xl" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 flex flex-col h-full justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-semibold text-emerald-100 mb-6">
                    <Sparkles className="h-4 w-4" />
                    Welcome back
                  </div>
                  
                  <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-5xl leading-tight">
                    Login and pick up exactly where
                    <span className="block text-emerald-200 mt-2">your sourcing flow left off</span>
                  </h1>
                  
                  <p className="mt-6 text-base text-emerald-100/90 leading-relaxed max-w-xl">
                    Buyers can continue sourcing, farmers can respond to new offers,
                    and admins can review marketplace health from one shared workspace.
                  </p>
                </div>

                {/* Features Grid */}
                <div className="grid gap-4 sm:grid-cols-3">
                  {features.map((feature) => {
                    const Icon = feature.icon;
                    const colorClasses: Record<string, string> = {
                      emerald: "bg-emerald-500/10 border-emerald-400/20 hover:bg-emerald-500/20",
                      blue: "bg-blue-500/10 border-blue-400/20 hover:bg-blue-500/20",
                      amber: "bg-amber-500/10 border-amber-400/20 hover:bg-amber-500/20"
                    };
                    const colorClass = colorClasses[feature.color];
                    
                    return (
                      <div
                        key={feature.title}
                        className={`group rounded-2xl border backdrop-blur-sm p-4 transition-all duration-300 hover:scale-105 ${colorClasses}`}
                      >
                        <Icon className="h-6 w-6 text-emerald-300 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm leading-relaxed text-emerald-50">
                          {feature.title}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Trust Indicators */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-300" />
                    <span className="text-xs text-emerald-200">Secure login</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-300" />
                    <span className="text-xs text-emerald-200">500+ active users</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-emerald-300" />
                    <span className="text-xs text-emerald-200">24/7 support</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="order-1 lg:order-2">
            <div className="rounded-3xl bg-white shadow-xl border border-gray-100 p-8 md:p-10">
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700 mb-4">
                  <LogIn className="h-4 w-4" />
                  Login
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
                  Access your role-based
                  <span className="block text-emerald-600 mt-1">dashboard</span>
                </h2>
                <p className="mt-3 text-sm text-gray-600 leading-relaxed">
                  Use your account credentials or jump into a seeded demo account to explore the platform.
                </p>
              </div>

              {/* Login Form */}
              <div className="mt-6">
                <LoginForm />
              </div>

              {/* Demo Access Section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-gray-200"></div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Quick demo access</p>
                  <div className="h-px flex-1 bg-gray-200"></div>
                </div>
                
                <div className="mt-4">
                  <DemoLoginButtons />
                </div>
                
                <p className="mt-4 text-xs text-center text-gray-500">
                  Demo accounts let you explore the platform without creating a new account
                </p>
              </div>

              {/* Sign Up Link */}
              <div className="mt-8 pt-4 text-center">
                <p className="text-sm text-gray-600">
                  New here?{" "}
                  <Link 
                    className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors inline-flex items-center gap-1" 
                    href="/signup"
                  >
                    Create an account
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </p>
              </div>

              {/* Additional Features */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-600">Role-based access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-600">Real-time updates</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-600">Market insights</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-500" />
                    <span className="text-xs text-gray-600">Logistics tracking</span>
                  </div>
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
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.05);
          }
        }
        
        .animate-pulse {
          animation: pulse 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}