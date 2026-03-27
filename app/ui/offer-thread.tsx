"use client";

import { useEffect, useEffectEvent, useState } from "react";

import type { OfferThreadView } from "@/lib/types";

export function OfferThread({
  offerId,
  initialThread,
}: {
  offerId: string;
  initialThread: OfferThreadView;
}) {
  const [thread, setThread] = useState(initialThread);

  const syncThread = useEffectEvent(async () => {
    const response = await fetch(`/api/offers/${offerId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return;
    }

    const nextThread = (await response.json()) as OfferThreadView;
    setThread(nextThread);
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      void syncThread();
    }, 5000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-stone-950">Live chat</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Polling refreshes the conversation every 5 seconds so both sides can
            track negotiations without reloading.
          </p>
        </div>
        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
          {thread.messages.length} updates
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {thread.messages.map((message) => (
          <article
            key={message.id}
            className={`rounded-2xl border px-4 py-4 ${
              message.isCurrentUser
                ? "border-emerald-200 bg-emerald-50"
                : "border-stone-900/10 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-stone-950">{message.senderName}</p>
              <span className="text-xs uppercase tracking-[0.18em] text-stone-500">
                {message.createdAt}
              </span>
            </div>
            <p className="mt-3 text-sm leading-7 text-stone-700">{message.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
