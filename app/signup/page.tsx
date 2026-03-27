import { SignupForm } from "@/app/ui/forms";
import { LoadingLink } from "@/app/ui/navigation-progress";

export default function SignupPage() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-8 sm:px-10 lg:grid-cols-[0.92fr_1.08fr] lg:px-12">
      <section className="panel panel-strong self-start rounded-[2rem] p-7 sm:p-8">
        <p className="eyebrow text-stone-500">Create account</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
          Join as a farmer, buyer, or marketplace admin.
        </h1>
        <p className="mt-4 text-sm leading-7 text-stone-600">
          Set your role, location, and profile details so the platform can match
          you to the right sourcing, delivery, and trust workflows.
        </p>

        <div className="mt-8">
          <SignupForm />
        </div>

        <p className="mt-8 text-sm text-stone-600">
          Already have an account?{" "}
          <LoadingLink className="font-semibold text-emerald-800" href="/login">
            Sign in
          </LoadingLink>
        </p>
      </section>

      <section className="grid gap-5">
        <div className="panel-auth relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.34),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.14),_transparent_42%)]" />
          <div className="relative z-10">
            <p className="eyebrow text-emerald-100">Built for trust</p>
            <h2 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight text-white">
              Start with onboarding that makes matching, pricing, and delivery smarter.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-emerald-50/88">
              Location-aware sourcing, better negotiation context, smarter
              delivery options, and future AI pricing all depend on a strong
              onboarding foundation.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          {[
            {
              title: "Farmers",
              text: "Publish produce, share harvest freshness, set delivery options, and respond to buyer offers fast.",
            },
            {
              title: "Buyers",
              text: "Browse local listings, negotiate target pricing, save suppliers, and manage recurring orders.",
            },
            {
              title: "Admins",
              text: "Approve farmers, monitor trust and transaction signals, and keep the marketplace healthy.",
            },
            {
              title: "India-ready",
              text: "Designed for multilingual onboarding, local delivery coordination, and Razorpay-friendly payment flow.",
            },
          ].map((item) => (
            <article key={item.title} className="panel panel-strong min-h-44">
              <p className="text-lg font-semibold text-stone-950">{item.title}</p>
              <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
