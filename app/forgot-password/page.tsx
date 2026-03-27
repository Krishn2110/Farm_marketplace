import Link from "next/link";

import { ForgotPasswordForm } from "@/app/ui/forms";

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
      <section className="panel panel-strong rounded-[2rem] p-7 sm:p-8">
        <p className="eyebrow text-stone-500">Account recovery</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
          Reset your password
        </h1>
        <p className="mt-3 text-sm leading-7 text-stone-600">
          Enter your account email to generate a secure reset link.
        </p>
        <div className="mt-8">
          <ForgotPasswordForm />
        </div>
        <p className="mt-8 text-sm text-stone-600">
          Remember your password?{" "}
          <Link className="font-semibold text-emerald-800" href="/login">
            Back to login
          </Link>
        </p>
      </section>
    </div>
  );
}
