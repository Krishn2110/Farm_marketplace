import {
  AdminApprovalForm,
  FarmerListingForm,
  FarmerOfferActions,
  OrderReviewForm,
  OfferMessageForm,
  ProfileForm,
} from "@/app/ui/forms";
import { ensureSession } from "@/lib/auth";
import { getDashboardData } from "@/lib/market";
import { LoadingLink } from "@/app/ui/navigation-progress";

export default async function DashboardPage() {
  const session = await ensureSession();
  const dashboard = await getDashboardData(session.userId);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-8 sm:px-10 lg:px-12">
      <section className="panel panel-strong">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-700">
              {dashboard.user.role} dashboard
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-950">
              Welcome back, {dashboard.user.name}
            </h1>
            <p className="mt-3 max-w-2xl leading-8 text-stone-700">
              {dashboard.heroText}
            </p>
          </div>
          <div className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4 text-sm text-stone-700">
            <p className="font-semibold text-stone-950">
              Languages: {dashboard.user.languages.join(", ") || "English"}
            </p>
            <p className="mt-1">
              Location: {dashboard.user.location} | Trust score {dashboard.user.rating}
            </p>
            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-stone-500">
              {dashboard.user.reviewCount > 0
                ? `${dashboard.user.reviewCount} review${dashboard.user.reviewCount === 1 ? "" : "s"} received`
                : "No submitted reviews yet"}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {dashboard.metrics.map((metric) => (
            <div
              key={metric.label}
              className="rounded-2xl border border-stone-900/10 bg-white px-5 py-5"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                {metric.label}
              </p>
              <p className="mt-3 text-3xl font-semibold text-stone-950">
                {metric.value}
              </p>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                {metric.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="panel panel-strong">
          <h2 className="text-2xl font-semibold text-stone-950">Profile</h2>
          <p className="mt-2 text-sm leading-7 text-stone-600">
            Keep location, farm type, and language preferences accurate for better
            buyer matching.
          </p>
          <div className="mt-6">
            <ProfileForm user={dashboard.user} />
          </div>
        </div>

        {dashboard.user.role === "farmer" ? (
          <div className="panel panel-strong">
            <h2 className="text-2xl font-semibold text-stone-950">Add product</h2>
            <p className="mt-2 text-sm leading-7 text-stone-600">
              Publish vegetables, fruits, or grains with live inventory and
              delivery options.
            </p>
            <div className="mt-6">
              <FarmerListingForm location={dashboard.user.location} />
            </div>
          </div>
        ) : (
          <div className="panel panel-strong">
            <h2 className="text-2xl font-semibold text-stone-950">
              Marketplace signals
            </h2>
            <div className="mt-6 grid gap-4">
              {dashboard.signals.map((signal) => (
                <div
                  key={signal.title}
                  className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4"
                >
                  <p className="text-sm font-semibold text-stone-950">{signal.title}</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    {signal.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {dashboard.user.role === "farmer" ? (
        <section className="panel panel-strong">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-950">
                Your listings
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Only products published by your account are shown here.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-900">
              {dashboard.myProducts.length} live listing
              {dashboard.myProducts.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {dashboard.myProducts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-900/15 bg-white px-4 py-6 text-sm text-stone-600">
                You have not published any products yet.
              </div>
            ) : (
              dashboard.myProducts.map((product) => (
                <article
                  key={product.id}
                  className="rounded-2xl border border-stone-900/10 bg-white px-5 py-5"
                >
                  <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                    {product.category}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold text-stone-950">
                    {product.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-stone-600">
                    {product.location}
                  </p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    Harvested on {product.harvestDate}
                  </p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-stone-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Price
                      </p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">
                        Rs. {product.price}/{product.unit}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-stone-50 px-4 py-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-stone-500">
                        Stock
                      </p>
                      <p className="mt-2 text-lg font-semibold text-stone-950">
                        {product.quantity}
                        {product.unit}
                      </p>
                    </div>
                  </div>
                  <p className="mt-5 rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-4 text-sm leading-7 text-emerald-950">
                    {product.freshnessNote}
                  </p>
                </article>
              ))
            )}
          </div>
        </section>
      ) : null}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="panel panel-strong">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-stone-950">
                Negotiations and orders
              </h2>
              <p className="mt-2 text-sm leading-7 text-stone-600">
                Every offer keeps messages, response state, and order conversion in one place.
              </p>
            </div>
            {dashboard.user.role === "farmer" ? (
              <span className="text-sm font-semibold text-stone-500">
                Farmer negotiations
              </span>
            ) : (
              <LoadingLink className="text-sm font-semibold text-emerald-800" href="/listings">
                Browse listings
              </LoadingLink>
            )}
          </div>

          <div className="mt-6 grid gap-5">
            {dashboard.offers.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-stone-900/15 bg-white px-4 py-6 text-sm text-stone-600">
                No offers yet. Start by publishing produce or browsing listings.
              </div>
            ) : (
              dashboard.offers.map((offer) => (
                <article
                  key={offer.id}
                  className="rounded-[1.4rem] border border-stone-900/10 bg-white px-5 py-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold text-stone-950">
                          {offer.productTitle}
                        </h3>
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
                          {offer.status}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-stone-600">
                        {offer.counterpartyLabel} | Offer at Rs. {offer.offeredPrice}/
                        {offer.unit}
                      </p>
                    </div>
                    <LoadingLink
                      className="btn-secondary"
                      href={`/dashboard/offers/${offer.id}`}
                    >
                      Open thread
                    </LoadingLink>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4 text-sm leading-7 text-stone-700">
                      <p className="font-semibold text-stone-950">Latest note</p>
                      <p className="mt-2">{offer.latestMessage}</p>
                    </div>
                    {dashboard.user.role === "farmer" && offer.status === "pending" ? (
                      <div className="rounded-2xl border border-emerald-900/10 bg-emerald-50 px-4 py-4">
                        <p className="text-sm font-semibold text-emerald-950">
                          Convert to order
                        </p>
                        <div className="mt-4">
                          <FarmerOfferActions
                            defaultAddress={dashboard.defaultAddress}
                            offerId={offer.id}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4">
                        <OfferMessageForm offerId={offer.id} />
                      </div>
                    )}
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <div className="grid gap-6">
          <section className="panel panel-strong">
            <h2 className="text-2xl font-semibold text-stone-950">
              Logistics and payments
            </h2>
            <div className="mt-6 grid gap-4">
              {dashboard.orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-semibold text-stone-950">{order.productTitle}</p>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
                      {order.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-7 text-stone-600">
                    {order.address}
                  </p>
                  <p className="mt-2 text-sm text-stone-700">
                    Ordered quantity {order.quantity}
                    {order.unit}
                  </p>
                  <p className="mt-2 text-sm text-stone-700">
                    ETA {order.eta} | {order.deliveryType} | {order.paymentProvider}{" "}
                    {order.paymentStatus}
                  </p>
                  {dashboard.user.role !== "admin" ? (
                    <div className="mt-4 rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-4">
                      <OrderReviewForm
                        existingReview={order.existingReview}
                        orderId={order.id}
                        targetName={order.reviewTargetName}
                        targetRole={order.reviewTargetRole}
                      />
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          {dashboard.user.role !== "admin" ? (
            <section className="panel panel-strong">
              <h2 className="text-2xl font-semibold text-stone-950">
                Received feedback
              </h2>
              <div className="mt-6 grid gap-4">
                {dashboard.receivedReviews.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-stone-900/15 bg-white px-4 py-6 text-sm text-stone-600">
                    No one has reviewed this account yet.
                  </div>
                ) : (
                  dashboard.receivedReviews.map((review) => (
                    <div
                      key={review.id}
                      className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-semibold text-stone-950">
                          {review.reviewerName}
                        </p>
                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-500">
                        {review.reviewerRole} review
                      </p>
                      <p className="mt-3 text-sm leading-7 text-stone-700">
                        {review.feedback}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </section>
          ) : null}

          {dashboard.user.role === "admin" ? (
            <section className="panel panel-strong">
              <h2 className="text-2xl font-semibold text-stone-950">
                Pending farmer approvals
              </h2>
              <div className="mt-6 grid gap-4">
                {dashboard.pendingFarmers.map((farmer) => (
                  <div
                    key={farmer.id}
                    className="rounded-2xl border border-stone-900/10 bg-white px-4 py-4"
                  >
                    <p className="font-semibold text-stone-950">{farmer.name}</p>
                    <p className="mt-1 text-sm text-stone-600">
                      {farmer.location} | {farmer.farmType || "Mixed produce"}
                    </p>
                    <div className="mt-4">
                      <AdminApprovalForm userId={farmer.id} />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>
    </div>
  );
}
