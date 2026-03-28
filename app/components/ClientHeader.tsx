import type { ReactNode } from "react";

import {
  ArrowRight,
  LayoutDashboard,
  Leaf,
  LogOut,
  Menu,
} from "lucide-react";

import { logoutAction } from "@/app/actions";
import { LoadingLink } from "@/app/ui/navigation-progress";

type HeaderSession =
  | {
      userId: string;
      role: string;
      name: string;
      approved?: boolean;
    }
  | null;

export function ClientHeader({ session }: { session: HeaderSession }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-stone-200/60 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <LoadingLink
            href="/"
            className="group flex items-center gap-3 transition-opacity hover:opacity-90"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform group-hover:scale-105">
              <Leaf className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold leading-none tracking-tight text-stone-950">
                KrishiSetu
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                Premium Sourcing
              </span>
            </div>
          </LoadingLink>

          <nav className="hidden items-center gap-2 md:flex">
            <HeaderLink href="/">Home</HeaderLink>
            <HeaderLink href="/listings">Marketplace</HeaderLink>
            <HeaderLink href="/market-data">Market Data</HeaderLink>

            {session ? (
              <div className="ml-3 flex items-center gap-3">
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
                    title="Logout"
                    type="submit"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="ml-3 flex items-center gap-3">
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

          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 transition-colors hover:bg-stone-200 md:hidden">
            <Menu className="h-5 w-5 text-stone-900" />
          </button>
        </div>
      </div>
    </header>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <LoadingLink
      className="rounded-full px-4 py-2 text-sm font-semibold text-stone-600 transition-all hover:bg-stone-100 hover:text-stone-900"
      href={href}
    >
      {children}
    </LoadingLink>
  );
}
