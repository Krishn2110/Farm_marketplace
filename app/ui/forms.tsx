"use client";

import Link from "next/link";
import { useActionState } from "react";

import {
  acceptOfferAction,
  addOfferMessageAction,
  approveFarmerAction,
  createListingAction,
  createOfferAction,
  loginAction,
  quickDemoLoginAction,
  rejectOfferAction,
  requestPasswordResetAction,
  resetPasswordAction,
  signupAction,
  updateProfileAction,
  type FormState,
} from "@/app/actions";
import type { UserRecord } from "@/lib/types";

const initialState: FormState = {};

function FormFeedback({ state }: { state: FormState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <p
      className={`mt-4 rounded-2xl px-4 py-3 text-sm ${
        state.error
          ? "border border-rose-200 bg-rose-50 text-rose-700"
          : "border border-emerald-200 bg-emerald-50 text-emerald-800"
      }`}
    >
      {state.error ?? state.success}
    </p>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="label" htmlFor="login-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="field mt-2"
          id="login-email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="login-password">
          Password
        </label>
        <input
          autoComplete="current-password"
          className="field mt-2"
          id="login-password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Signing in..." : "Login"}
      </button>
      <Link className="text-sm font-medium text-emerald-800" href="/forgot-password">
        Forgot password?
      </Link>
      <FormFeedback state={state} />
    </form>
  );
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(
    requestPasswordResetAction,
    initialState,
  );

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="label" htmlFor="forgot-email">
          Account email
        </label>
        <input
          autoComplete="email"
          className="field mt-2"
          id="forgot-email"
          name="email"
          required
          type="email"
        />
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Generating link..." : "Generate reset link"}
      </button>
      <p className="text-xs leading-6 text-stone-500">
        Development mode: generated token is logged on the server console.
      </p>
      <FormFeedback state={state} />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input name="token" type="hidden" value={token} />
      <div>
        <label className="label" htmlFor="reset-password">
          New password
        </label>
        <input
          autoComplete="new-password"
          className="field mt-2"
          id="reset-password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>
      <div>
        <label className="label" htmlFor="reset-confirm-password">
          Confirm password
        </label>
        <input
          autoComplete="new-password"
          className="field mt-2"
          id="reset-confirm-password"
          minLength={6}
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Updating..." : "Update password"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="label" htmlFor="signup-name">
          Full name
        </label>
        <input
          autoComplete="name"
          className="field mt-2"
          id="signup-name"
          name="name"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="signup-email">
          Email
        </label>
        <input
          autoComplete="email"
          className="field mt-2"
          id="signup-email"
          name="email"
          required
          type="email"
        />
      </div>
      <div>
        <label className="label" htmlFor="signup-password">
          Password
        </label>
        <input
          autoComplete="new-password"
          className="field mt-2"
          id="signup-password"
          minLength={6}
          name="password"
          required
          type="password"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="signup-role">
            Role
          </label>
          <select
            className="field mt-2"
            defaultValue="farmer"
            id="signup-role"
            name="role"
            required
          >
            <option value="farmer">Farmer</option>
            <option value="buyer">Buyer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="signup-location">
            Location
          </label>
          <input
            autoComplete="address-level2"
            className="field mt-2"
            id="signup-location"
            name="location"
            required
          />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="signup-farm-type">
            Farm type
          </label>
          <input className="field mt-2" id="signup-farm-type" name="farmType" />
        </div>
        <div>
          <label className="label" htmlFor="signup-business-type">
            Business type
          </label>
          <input className="field mt-2" id="signup-business-type" name="businessType" />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="signup-languages">
          Languages
        </label>
        <input
          className="field mt-2"
          defaultValue="English, Hindi"
          id="signup-languages"
          name="languages"
          placeholder="English, Hindi, Gujarati"
        />
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Creating account..." : "Create account"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function DemoLoginButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: "Farmer demo", value: "farmer" },
        { label: "Buyer demo", value: "buyer" },
        { label: "Admin demo", value: "admin" },
      ].map((item) => (
        <form action={quickDemoLoginAction} key={item.value}>
          <input name="role" type="hidden" value={item.value} />
          <button className="btn-secondary" type="submit">
            {item.label}
          </button>
        </form>
      ))}
    </div>
  );
}

export function ProfileForm({ user }: { user: UserRecord }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div>
        <label className="label" htmlFor="profile-location">
          Location
        </label>
        <input
          className="field mt-2"
          defaultValue={user.location}
          id="profile-location"
          name="location"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="profile-farmType">
            Farm type
          </label>
          <input
            className="field mt-2"
            defaultValue={user.farmType ?? ""}
            id="profile-farmType"
            name="farmType"
          />
        </div>
        <div>
          <label className="label" htmlFor="profile-businessType">
            Business type
          </label>
          <input
            className="field mt-2"
            defaultValue={user.businessType ?? ""}
            id="profile-businessType"
            name="businessType"
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="profile-languages">
          Languages
        </label>
        <input
          className="field mt-2"
          defaultValue={user.languages.join(", ")}
          id="profile-languages"
          name="languages"
        />
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Saving..." : "Save profile"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function FarmerListingForm({ location }: { location: string }) {
  const [state, action, pending] = useActionState(createListingAction, initialState);

  return (
    <form action={action} className="grid gap-4" encType="multipart/form-data">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="listing-title">
            Product name
          </label>
          <input className="field mt-2" id="listing-title" name="title" required />
        </div>
        <div>
          <label className="label" htmlFor="listing-category">
            Category
          </label>
          <select className="field mt-2" defaultValue="Vegetables" id="listing-category" name="category">
            <option value="Vegetables">Vegetables</option>
            <option value="Fruits">Fruits</option>
            <option value="Grains">Grains</option>
          </select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="listing-price">
            Price
          </label>
          <input
            className="field mt-2"
            id="listing-price"
            min={0.01}
            name="price"
            required
            step="0.01"
            type="number"
          />
        </div>
        <div>
          <label className="label" htmlFor="listing-quantity">
            Quantity
          </label>
          <input
            className="field mt-2"
            id="listing-quantity"
            min={0.01}
            name="quantity"
            required
            step="0.01"
            type="number"
          />
        </div>
        <div>
          <label className="label" htmlFor="listing-unit">
            Unit
          </label>
          <input className="field mt-2" defaultValue="kg" id="listing-unit" name="unit" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="listing-harvest">
            Harvest date
          </label>
          <input
            className="field mt-2"
            id="listing-harvest"
            name="harvestDate"
            required
            type="date"
          />
        </div>
        <div>
          <label className="label" htmlFor="listing-location">
            Location
          </label>
          <input
            className="field mt-2"
            defaultValue={location}
            id="listing-location"
            name="location"
            required
          />
        </div>
      </div>
      <div>
        <label className="label" htmlFor="listing-freshness">
          Freshness note
        </label>
        <textarea
          className="field mt-2 min-h-28"
          defaultValue="Freshly harvested today"
          id="listing-freshness"
          name="freshnessNote"
          required
        />
      </div>
      <div>
        <label className="label" htmlFor="listing-images">
          Product images
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className="field mt-2"
          id="listing-images"
          multiple
          name="images"
          type="file"
        />
        <p className="mt-2 text-xs text-stone-500">
          Optional. Upload up to 4 images (JPG, PNG, WEBP), max 5MB each.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="listing-organic">
            Organic
          </label>
          <select className="field mt-2" defaultValue="yes" id="listing-organic" name="organic">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div>
          <span className="label">Delivery options</span>
          <div className="mt-3 flex flex-wrap gap-4 text-sm text-stone-700">
            <label className="flex items-center gap-2">
              <input defaultChecked name="deliveryOptions" type="checkbox" value="self" />
              Self-delivery
            </label>
            <label className="flex items-center gap-2">
              <input defaultChecked name="deliveryOptions" type="checkbox" value="platform" />
              Platform delivery
            </label>
          </div>
        </div>
      </div>
      <button className="btn-primary mt-2" disabled={pending} type="submit">
        {pending ? "Publishing..." : "Publish listing"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function OfferForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(createOfferAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <input name="productId" type="hidden" value={productId} />
      <div>
        <label className="label text-stone-300" htmlFor={`offer-price-${productId}`}>
          Offer price
        </label>
        <input
          className="field mt-2"
          id={`offer-price-${productId}`}
          name="offeredPrice"
          placeholder="e.g. 42"
          type="number"
        />
      </div>
      <div>
        <label className="label text-stone-300" htmlFor={`offer-message-${productId}`}>
          Message
        </label>
        <textarea
          className="field mt-2 min-h-28"
          id={`offer-message-${productId}`}
          name="message"
          placeholder="Need 30kg every week for restaurant delivery."
        />
      </div>
      <button className="btn-primary mt-1" disabled={pending} type="submit">
        {pending ? "Sending..." : "Offer price"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function OfferMessageForm({ offerId }: { offerId: string }) {
  const [state, action, pending] = useActionState(addOfferMessageAction, initialState);

  return (
    <form action={action} className="grid gap-3">
      <input name="offerId" type="hidden" value={offerId} />
      <div>
        <label className="label" htmlFor={`offer-thread-${offerId}`}>
          Chat update
        </label>
        <textarea
          className="field mt-2 min-h-24"
          id={`offer-thread-${offerId}`}
          name="text"
          placeholder="Share delivery timing, quantity changes, or counter details."
        />
      </div>
      <button className="btn-secondary justify-center" disabled={pending} type="submit">
        {pending ? "Sending..." : "Send update"}
      </button>
      <FormFeedback state={state} />
    </form>
  );
}

export function FarmerOfferActions({
  offerId,
  defaultAddress,
}: {
  offerId: string;
  defaultAddress: string;
}) {
  return (
    <div className="grid gap-3">
      <form action={acceptOfferAction} className="grid gap-3">
        <input name="offerId" type="hidden" value={offerId} />
        <input
          className="field"
          defaultValue={defaultAddress}
          name="address"
          placeholder="Delivery address"
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="field" defaultValue="platform" name="deliveryType">
            <option value="platform">Platform delivery</option>
            <option value="self">Self delivery</option>
          </select>
          <select className="field" defaultValue="razorpay" name="paymentProvider">
            <option value="razorpay">Razorpay</option>
            <option value="stripe">Stripe</option>
          </select>
        </div>
        <button className="btn-primary" type="submit">
          Accept offer
        </button>
      </form>
      <form action={rejectOfferAction}>
        <input name="offerId" type="hidden" value={offerId} />
        <button className="btn-secondary w-full justify-center" type="submit">
          Reject offer
        </button>
      </form>
    </div>
  );
}

export function AdminApprovalForm({ userId }: { userId: string }) {
  return (
    <form action={approveFarmerAction}>
      <input name="userId" type="hidden" value={userId} />
      <button className="btn-primary" type="submit">
        Approve farmer
      </button>
    </form>
  );
}
