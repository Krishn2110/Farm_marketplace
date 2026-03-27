import { Spinner } from "@/app/ui/spinner";

export default function GlobalLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-7xl items-center justify-center px-6 py-20 sm:px-10 lg:px-12">
      <div className="panel panel-strong flex min-w-[18rem] flex-col items-center gap-4 text-center">
        <Spinner className="text-emerald-700" label="Loading content" size="lg" />
        <div>
          <p className="text-lg font-semibold text-stone-950">Loading</p>
          <p className="mt-1 text-sm leading-7 text-stone-600">
            We are preparing the next view for you.
          </p>
        </div>
      </div>
    </div>
  );
}
