import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { 
  LayoutDashboard, 
  Home, 
  ShoppingBag, 
  LogIn, 
  UserPlus, 
  LogOut,
  Menu,
  Leaf,
  TrendingUp,
  Truck,
  ArrowRight,
  ShieldCheck,
  Globe
} from "lucide-react";

import "./globals.css";
import { logoutAction } from "@/app/actions";
import { getOptionalSession } from "@/lib/auth";
import { LoadingLink, NavigationProgressProvider } from "@/app/ui/navigation-progress";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FarmDirect | Premium Farm-to-Business Marketplace",
  description: "India's leading direct farm-to-business marketplace with transparent negotiation and real-time logistics.",
};

async function Header() {
  const session = await getOptionalSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-4">
          {/* Logo Section */}
          <LoadingLink href="/" className="group flex items-center gap-3 transition-opacity hover:opacity-90">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform group-hover:scale-105">
              <Leaf className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight text-stone-950">
                FarmDirect
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Premium Sourcing
              </span>
            </div>
          </LoadingLink>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-2 md:flex">
            <div className="mr-4 flex items-center gap-1 border-r border-stone-200 pr-4">
              <LoadingLink 
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900" 
                href="/"
              >
                Home
              </LoadingLink>
              <LoadingLink 
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900" 
                href="/listings"
              >
                Marketplace
              </LoadingLink>
              <LoadingLink 
                className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900" 
                href="/market-data"
              >
                Market Data
              </LoadingLink>
            </div>

            {session ? (
              <div className="flex items-center gap-3">
                <LoadingLink 
                  className="flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-stone-800" 
                  href="/dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </LoadingLink>
                <form action={logoutAction}>
                  <button 
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-all hover:bg-red-50 hover:text-red-600" 
                    type="submit"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <LoadingLink 
                  className="text-sm font-bold text-stone-600 transition-colors hover:text-stone-950" 
                  href="/login"
                >
                  Sign in
                </LoadingLink>
                <LoadingLink 
                  className="flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition-all hover:bg-emerald-700 hover:shadow-none" 
                  href="/signup"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </LoadingLink>
              </div>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 transition-colors hover:bg-stone-200 md:hidden">
            <Menu className="h-5 w-5 text-stone-900" />
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-200 bg-[#fafaf9] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Brand Info */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Leaf className="h-4 w-4" />
              </div>
              <p className="text-xl font-bold tracking-tight text-stone-900">FarmDirect</p>
            </div>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-stone-600">
              The modern standard for agricultural commerce. We enable direct relationships between India&apos;s finest producers and leading businesses.
            </p>
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Verified Supply
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-400">
                <Globe className="h-4 w-4 text-emerald-600" />
                Pan-India Network
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-950">Platform</h3>
              <ul className="space-y-3">
                <li><LoadingLink className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="/listings">Marketplace</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="/logistics">Logistics</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="/market-data">Market Data</LoadingLink></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-950">Company</h3>
              <ul className="space-y-3">
                <li><a className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="#">About Us</a></li>
                <li><a className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="#">Partner Program</a></li>
                <li><a className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="#">Contact</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-stone-950">Support</h3>
              <ul className="space-y-3">
                <li><LoadingLink className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="/help">Help Center</LoadingLink></li>
                <li><a className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="#">Privacy</a></li>
                <li><a className="text-sm text-stone-600 transition-colors hover:text-emerald-600" href="#">Terms</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 flex flex-col items-center justify-between gap-6 border-t border-stone-200 pt-8 sm:flex-row">
          <p className="text-xs font-medium text-stone-500">
            © {new Date().getFullYear()} FarmDirect Marketplace India. All rights reserved.
          </p>
          <div className="flex gap-8">
            {/* Social or Status indicators can go here */}
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-tighter text-stone-400">Systems Operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${poppins.className} min-h-full bg-white text-stone-950 antialiased`}>
        <NavigationProgressProvider>
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </NavigationProgressProvider>
      </body>
    </html>
  );
}
