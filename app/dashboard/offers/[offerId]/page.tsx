import { notFound } from "next/navigation";

import { OfferMessageForm } from "@/app/ui/forms";
import { OfferThread } from "@/app/ui/offer-thread";
import { ensureSession } from "@/lib/auth";
import { getOfferThread } from "@/lib/market";

export default async function OfferThreadPage({
  params,
}: {
  params: Promise<{ offerId: string }>;
}) {
  const [{ offerId }, session] = await Promise.all([params, ensureSession()]);
  const thread = await getOfferThread(offerId, session.userId);

  if (!thread) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-stone-500">
              Negotiation thread
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
              {thread.productTitle}
            </h1>
            <p className="mt-3 text-sm leading-7 text-stone-700">
              {thread.counterpartyLabel} • Offer at Rs. {thread.offeredPrice}/
              {thread.unit} • {thread.status}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4 text-sm text-stone-700">
            Delivery: {thread.deliverySummary}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="panel panel-strong">
          <OfferThread offerId={offerId} initialThread={thread} />
        </div>
        <div className="grid gap-6">
          <section className="panel panel-strong">
            <h2 className="text-2xl font-semibold text-stone-950">Send message</h2>
            <div className="mt-6">
              <OfferMessageForm offerId={offerId} />
            </div>
          </section>

          <section className="panel panel-strong">
            <h2 className="text-2xl font-semibold text-stone-950">Workflow status</h2>
            <div className="mt-6 grid gap-4">
              {thread.timeline.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4"
                >
                  <p className="text-sm font-semibold text-stone-950">{item.label}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}
