import { NextResponse } from "next/server";

import { getSessionFromCookieStore } from "@/lib/auth";
import { getOfferThread } from "@/lib/market";

export async function GET(
  _request: Request,
  context: RouteContext<"/api/offers/[offerId]">,
) {
  const session = await getSessionFromCookieStore();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { offerId } = await context.params;
  const thread = await getOfferThread(offerId, session.userId);

  if (!thread) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(thread);
}
