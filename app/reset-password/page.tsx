import Link from "next/link";

import { ResetPasswordForm } from "@/app/ui/forms";

type ResetPasswordPageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const resolvedSearchParams = await searchParams;
  const token = resolvedSearchParams.token?.trim() ?? "";

  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-10 sm:px-10">
      <section className="panel panel-strong rounded-[2rem] p-7 sm:p-8">
        <p className="eyebrow text-stone-500">Secure reset</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">
          Create a new password
        </h1>

        {!token ? (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
            Reset token missing. Request a new reset link from forgot password.
          </div>
        ) : (
          <div className="mt-8">
            <ResetPasswordForm token={token} />
          </div>
        )}

        <p className="mt-8 text-sm text-stone-600">
          Need a new link?{" "}
          <Link className="font-semibold text-emerald-800" href="/forgot-password">
            Request reset again
          </Link>
        </p>
      </section>
    </div>
  );
}
