import type { Metadata } from "next";
import Link from "next/link";

import "./globals.css";
import { logoutAction } from "@/app/actions";
import { getOptionalSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Farm Marketplace",
  description:
    "Direct farm-to-business marketplace with role-based dashboards, negotiation, and logistics coordination.",
};

async function Header() {
  const session = await getOptionalSession();

  return (
    <header className="sticky top-0 z-40 border-b border-stone-900/8 bg-[rgba(247,243,234,0.88)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-10 lg:px-12">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-stone-50 shadow-lg shadow-emerald-900/10">
            FM
          </div>
          <div>
            <p className="text-lg font-semibold tracking-tight text-stone-950">
              Farm Marketplace
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-500">
              Farmers / Buyers / Admin
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3">
          <Link className="nav-link" href="/">
            Home
          </Link>
          <Link className="nav-link" href="/listings">
            Listings
          </Link>
          <Link className="nav-link" href="/market-data">
            Market Data
          </Link>
          {session ? (
            <>
              <Link className="nav-link" href="/dashboard">
                Dashboard
              </Link>
              <form action={logoutAction}>
                <button className="btn-secondary" type="submit">
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link className="nav-link" href="/login">
                Login
              </Link>
              <Link className="btn-primary" href="/signup">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-stone-900/8 bg-white/60">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-stone-600 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-12">
        <div>
          <p className="font-medium text-stone-900">Farm Marketplace</p>
          <p className="mt-1">Fresh sourcing for farmers, shops, and restaurants.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link className="hover:text-emerald-800" href="/">
            Home
          </Link>
          <Link className="hover:text-emerald-800" href="/listings">
            Listings
          </Link>
          <Link className="hover:text-emerald-800" href="/market-data">
            Market Data
          </Link>
          <Link className="hover:text-emerald-800" href="/login">
            Login
          </Link>
          <Link className="hover:text-emerald-800" href="/signup">
            Sign up
          </Link>
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
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-[linear-gradient(180deg,#fff8ee_0%,#f6f3eb_52%,#eef7f0_100%)] text-stone-950">
        <div className="absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(circle_at_top,_rgba(246,190,92,0.18),_transparent_46%),radial-gradient(circle_at_left,_rgba(21,128,61,0.16),_transparent_35%)]" />
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1 pb-16">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
