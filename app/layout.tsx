import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import { 
  ShieldCheck,
  Globe,
  Wheat,
  Award,
} from "lucide-react";

import "./globals.css";
import { getOptionalSession } from "@/lib/auth";
import { LoadingLink, NavigationProgressProvider } from "@/app/ui/navigation-progress";
import { ClientHeader } from "@/app/components/ClientHeader"; // Make sure this path is correct

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "KrishiSetu | India's Premier Agri-Tech Marketplace",
  description: "Connecting Indian farmers directly to businesses. Transparent pricing, real-time logistics, and quality assurance for agricultural commerce.",
  keywords: "agriculture, farming, farm-to-business, agri-tech, Indian agriculture, farmer marketplace",
  authors: [{ name: "KrishiSetu" }],
  openGraph: {
    title: "KrishiSetu - Bridge to Better Agriculture",
    description: "Direct farm-to-business marketplace empowering Indian agriculture",
    type: "website",
  },
};

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="relative border-t border-emerald-100 bg-gradient-to-b from-white to-emerald-50/30 pt-20 pb-10">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-200 to-transparent"></div>
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 text-white shadow-lg">
                <Wheat className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent">
                  KrishiSetu
                </p>
                <p className="text-xs font-medium text-emerald-600">कृषि सेतु</p>
              </div>
            </div>
            <p className="mt-6 max-w-sm text-base leading-relaxed text-stone-600">
              Bridging the gap between India&apos;s farmers and businesses. Empowering agriculture through technology, transparency, and trust.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-emerald-100 shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Verified Supply Chain</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-full border border-emerald-100 shadow-sm">
                <Globe className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600">Pan-India Network</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-7">
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Platform</h3>
              <ul className="space-y-3">
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/listings">Marketplace</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/logistics">Logistics</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/insights">Market Insights</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/quality">Quality Assurance</LoadingLink></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">For Farmers</h3>
              <ul className="space-y-3">
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/farmer-signup">Start Selling</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/pricing">Pricing Guide</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/resources">Resources</LoadingLink></li>
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/support">Farmer Support</LoadingLink></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Company</h3>
              <ul className="space-y-3">
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">About Us</a></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Our Impact</a></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Careers</a></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Press</a></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700">Support</h3>
              <ul className="space-y-3">
                <li><LoadingLink className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block" href="/help">Help Center</LoadingLink></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Privacy Policy</a></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Terms of Service</a></li>
                <li><a className="text-sm text-stone-600 transition-all hover:text-emerald-600 hover:translate-x-1 inline-block cursor-pointer" href="#">Contact Us</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-emerald-100 pt-8 sm:flex-row">
          <p className="text-xs font-medium text-stone-500">
            © {currentYear} KrishiSetu Technologies Pvt. Ltd. All rights reserved. Empowering Indian agriculture.
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">All Systems Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">ISO 22000 Certified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOptionalSession();

  return (
    <html lang="en" className="h-full scroll-smooth">
      <body className={`${poppins.variable} ${inter.variable} font-sans min-h-full bg-gradient-to-b from-white to-emerald-50/20 text-stone-950 antialiased`}>
        <NavigationProgressProvider>
          <div className="relative flex min-h-screen flex-col">
            <ClientHeader session={session} />
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