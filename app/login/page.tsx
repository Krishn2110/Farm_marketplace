import Link from "next/link";

import { DemoLoginButtons, LoginForm } from "@/app/ui/forms";

export default function LoginPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-12">
      <section className="panel-auth relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.34),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.18),_transparent_42%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between gap-10">
          <div>
            <p className="eyebrow text-emerald-100">Welcome back</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Login and pick up exactly where your sourcing flow left off.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-emerald-50/88">
              Buyers can continue sourcing, farmers can respond to new offers,
              and admins can review marketplace health from one shared workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "Track live offers without leaving the dashboard",
              "Monitor logistics and payment confirmation in one flow",
              "Access multilingual, India-first marketplace tools",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.5rem] border border-white/12 bg-white/8 px-4 py-4 text-sm leading-7 text-emerald-50"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel panel-strong self-start rounded-[2rem] p-7 sm:p-8">
        <p className="eyebrow text-stone-500">Login</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
          Access your role-based dashboard
        </h2>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Use your account credentials or jump into a seeded demo account.
        </p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <div className="mt-8 border-t border-stone-900/8 pt-6">
          <p className="text-sm font-medium text-stone-700">Quick demo access</p>
          <div className="mt-4">
            <DemoLoginButtons />
          </div>
        </div>

        <p className="mt-8 text-sm text-stone-600">
          New here?{" "}
          <Link className="font-semibold text-emerald-800" href="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </div>
  );
}
