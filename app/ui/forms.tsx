"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { 
  Mail, 
  Lock, 
  User, 
  MapPin, 
  Building, 
  Globe, 
  Package, 
  DollarSign, 
  Calendar, 
  Image, 
  Leaf, 
  Truck, 
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Upload,
  X,
  Plus
} from "lucide-react";

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
  submitReviewAction,
  updateProfileAction,
  type FormState,
} from "@/app/actions";
import { LoadingLink } from "@/app/ui/navigation-progress";
import { Spinner } from "@/app/ui/spinner";
import type { UserRecord } from "@/lib/types";

const initialState: FormState = {};

function FormFeedback({ state }: { state: FormState }) {
  if (!state.error && !state.success) {
    return null;
  }

  return (
    <div
      className={`mt-4 rounded-xl p-4 flex items-start gap-3 ${
        state.error
          ? "bg-red-50 border border-red-200"
          : "bg-emerald-50 border border-emerald-200"
      }`}
    >
      {state.error ? (
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      ) : (
        <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
      )}
      <p className={`text-sm ${state.error ? "text-red-700" : "text-emerald-800"}`}>
        {state.error ?? state.success}
      </p>
    </div>
  );
}

function ButtonLabel({
  pending,
  idle,
  loading,
}: {
  pending: boolean;
  idle: string;
  loading: string;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {pending ? <Spinner className="text-current" label={loading} size="sm" /> : null}
      <span>{pending ? loading : idle}</span>
    </span>
  );
}

function PendingSubmitButton({
  className,
  idle,
  loading,
  variant = "primary",
}: {
  className?: string;
  idle: string;
  loading: string;
  variant?: "primary" | "secondary" | "danger";
}) {
  const { pending } = useFormStatus();
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-sm hover:shadow-md",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
    danger: "bg-red-600 hover:bg-red-700 text-white"
  };

  return (
    <button 
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className || ''}`}
      disabled={pending} 
      type="submit"
    >
      <ButtonLabel idle={idle} loading={loading} pending={pending} />
    </button>
  );
}

function FormInput({ 
  id, 
  name, 
  label, 
  type = "text", 
  required = false, 
  placeholder = "",
  defaultValue = "",
  icon: Icon,
  autoComplete,
  min,
  max,
  step
}: { 
  id: string; 
  name: string; 
  label: string; 
  type?: string; 
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  icon?: any;
  autoComplete?: string;
  min?: number | string;
  max?: number | string;
  step?: number | string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <input
          autoComplete={autoComplete}
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${Icon ? 'pl-10' : ''}`}
          defaultValue={defaultValue}
          id={id}
          max={max}
          min={min}
          name={name}
          placeholder={placeholder}
          required={required}
          step={step}
          type={type}
        />
      </div>
    </div>
  );
}

function FormSelect({ 
  id, 
  name, 
  label, 
  options, 
  required = false, 
  defaultValue = "",
  icon: Icon
}: { 
  id: string; 
  name: string; 
  label: string; 
  options: { value: string; label: string }[]; 
  required?: boolean;
  defaultValue?: string;
  icon?: any;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
        )}
        <select
          className={`w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 appearance-none ${Icon ? 'pl-10' : ''}`}
          defaultValue={defaultValue}
          id={id}
          name={name}
          required={required}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function FormTextarea({ 
  id, 
  name, 
  label, 
  required = false, 
  placeholder = "",
  defaultValue = "",
  rows = 4
}: { 
  id: string; 
  name: string; 
  label: string; 
  required?: boolean;
  placeholder?: string;
  defaultValue?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={id}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-gray-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all resize-y"
        defaultValue={defaultValue}
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
    </div>
  );
}

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <FormInput
        id="login-email"
        name="email"
        label="Email Address"
        type="email"
        required
        autoComplete="email"
        icon={Mail}
      />
      <FormInput
        id="login-password"
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="current-password"
        icon={Lock}
      />
      <PendingSubmitButton idle="Sign in" loading="Signing in..." />
      <LoadingLink 
        className="inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors" 
        href="/forgot-password"
      >
        Forgot password?
      </LoadingLink>
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
    <form action={action} className="space-y-5">
      <FormInput
        id="forgot-email"
        name="email"
        label="Account Email"
        type="email"
        required
        autoComplete="email"
        icon={Mail}
      />
      <PendingSubmitButton idle="Send reset link" loading="Sending..." />
      <p className="text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        Development mode: reset link is logged on the server console
      </p>
      <FormFeedback state={state} />
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <input name="token" type="hidden" value={token} />
      <FormInput
        id="reset-password"
        name="password"
        label="New Password"
        type="password"
        required
        autoComplete="new-password"
        icon={Lock}
      />
      <FormInput
        id="reset-confirm-password"
        name="confirmPassword"
        label="Confirm Password"
        type="password"
        required
        autoComplete="new-password"
        icon={Lock}
      />
      <PendingSubmitButton idle="Update password" loading="Updating..." />
      <FormFeedback state={state} />
    </form>
  );
}

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="signup-name"
          name="name"
          label="Full Name"
          required
          autoComplete="name"
          icon={User}
        />
        <FormInput
          id="signup-email"
          name="email"
          label="Email"
          type="email"
          required
          autoComplete="email"
          icon={Mail}
        />
      </div>
      
      <FormInput
        id="signup-password"
        name="password"
        label="Password"
        type="password"
        required
        autoComplete="new-password"
        icon={Lock}
      />
      
      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          id="signup-role"
          name="role"
          label="Role"
          options={[
            { value: "farmer", label: "Farmer" },
            { value: "buyer", label: "Buyer" },
            { value: "admin", label: "Admin" },
          ]}
          required
          defaultValue="farmer"
          icon={User}
        />
        <FormInput
          id="signup-location"
          name="location"
          label="Location"
          required
          autoComplete="address-level2"
          icon={MapPin}
        />
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="signup-farm-type"
          name="farmType"
          label="Farm Type"
          placeholder="e.g., Organic Farm, Mixed Crop"
          icon={Leaf}
        />
        <FormInput
          id="signup-business-type"
          name="businessType"
          label="Business Type"
          placeholder="e.g., Restaurant, Retail, Wholesale"
          icon={Building}
        />
      </div>
      
      <FormInput
        id="signup-languages"
        name="languages"
        label="Languages"
        placeholder="English, Hindi, Gujarati"
        defaultValue="English, Hindi"
        icon={Globe}
      />
      
      <PendingSubmitButton idle="Create account" loading="Creating account..." />
      <FormFeedback state={state} />
    </form>
  );
}

export function DemoLoginButtons() {
  return (
    <div className="flex flex-wrap gap-3">
      {[
        { label: "Farmer demo", value: "farmer", color: "emerald" },
        { label: "Buyer demo", value: "buyer", color: "blue" },
        { label: "Admin demo", value: "admin", color: "purple" },
      ].map((item) => (
        <form action={quickDemoLoginAction} key={item.value}>
          <input name="role" type="hidden" value={item.value} />
          <PendingSubmitButton
            className={`bg-${item.color}-50 text-${item.color}-700 hover:bg-${item.color}-100 border-${item.color}-200`}
            idle={item.label}
            loading="Loading..."
            variant="secondary"
          />
        </form>
      ))}
    </div>
  );
}

export function ProfileForm({ user }: { user: UserRecord }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <FormInput
        id="profile-location"
        name="location"
        label="Location"
        defaultValue={user.location}
        icon={MapPin}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="profile-farmType"
          name="farmType"
          label="Farm Type"
          defaultValue={user.farmType ?? ""}
          icon={Leaf}
        />
        <FormInput
          id="profile-businessType"
          name="businessType"
          label="Business Type"
          defaultValue={user.businessType ?? ""}
          icon={Building}
        />
      </div>
      <FormInput
        id="profile-languages"
        name="languages"
        label="Languages"
        defaultValue={user.languages.join(", ")}
        icon={Globe}
      />
      <PendingSubmitButton idle="Save changes" loading="Saving..." />
      <FormFeedback state={state} />
    </form>
  );
}

export function FarmerListingForm({ location }: { location: string }) {
  const [state, action, pending] = useActionState(createListingAction, initialState);

  return (
    <form action={action} className="space-y-5" encType="multipart/form-data">
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="listing-title"
          name="title"
          label="Product Name"
          required
          icon={Package}
        />
        <FormSelect
          id="listing-category"
          name="category"
          label="Category"
          options={[
            { value: "Vegetables", label: "Vegetables" },
            { value: "Fruits", label: "Fruits" },
            { value: "Grains", label: "Grains" },
          ]}
          required
          defaultValue="Vegetables"
        />
      </div>
      
      <div className="grid gap-5 sm:grid-cols-3">
        <FormInput
          id="listing-price"
          name="price"
          label="Price"
          type="number"
          min={0.01}
          step="0.01"
          required
          icon={DollarSign}
        />
        <FormInput
          id="listing-quantity"
          name="quantity"
          label="Quantity"
          type="number"
          min={0.01}
          step="0.01"
          required
          icon={Package}
        />
        <FormInput
          id="listing-unit"
          name="unit"
          label="Unit"
          defaultValue="kg"
          required
        />
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <FormInput
          id="listing-harvest"
          name="harvestDate"
          label="Harvest Date"
          type="date"
          required
          icon={Calendar}
        />
        <FormInput
          id="listing-location"
          name="location"
          label="Location"
          defaultValue={location}
          required
          icon={MapPin}
        />
      </div>
      
      <FormTextarea
        id="listing-freshness"
        name="freshnessNote"
        label="Freshness Note"
        required
        defaultValue="Freshly harvested today"
        placeholder="Describe the freshness, quality, and any special characteristics..."
      />
      
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Product Images
        </label>
        <div className="relative">
          <input
            accept="image/jpeg,image/png,image/webp"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
            id="listing-images"
            multiple
            name="images"
            type="file"
          />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Optional. Upload up to 4 images (JPG, PNG, WEBP), max 5MB each.
        </p>
      </div>
      
      <div className="grid gap-5 sm:grid-cols-2">
        <FormSelect
          id="listing-organic"
          name="organic"
          label="Organic"
          options={[
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          defaultValue="yes"
        />
        <div>
          <span className="block text-sm font-semibold text-gray-700 mb-2">Delivery Options</span>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input defaultChecked name="deliveryOptions" type="checkbox" value="self" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span>Self-delivery</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input defaultChecked name="deliveryOptions" type="checkbox" value="platform" className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
              <span>Platform delivery</span>
            </label>
          </div>
        </div>
      </div>
      
      <PendingSubmitButton idle="Publish listing" loading="Publishing..." />
      <FormFeedback state={state} />
    </form>
  );
}

export function OfferForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(createOfferAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input name="productId" type="hidden" value={productId} />
      <FormInput
        id={`offer-price-${productId}`}
        name="offeredPrice"
        label="Offer Price (₹)"
        type="number"
        min={0.01}
        step="0.01"
        required
        placeholder="e.g., 42"
        icon={DollarSign}
      />
      <FormTextarea
        id={`offer-message-${productId}`}
        name="message"
        label="Message"
        placeholder="Need 30kg every week for restaurant delivery."
        rows={3}
      />
      <PendingSubmitButton idle="Submit offer" loading="Submitting..." />
      <FormFeedback state={state} />
    </form>
  );
}

export function OfferMessageForm({ offerId }: { offerId: string }) {
  const [state, action, pending] = useActionState(addOfferMessageAction, initialState);

  return (
    <form action={action} className="space-y-3">
      <input name="offerId" type="hidden" value={offerId} />
      <FormTextarea
        id={`offer-thread-${offerId}`}
        name="text"
        label="Message"
        placeholder="Share delivery timing, quantity changes, or counter details."
        rows={3}
      />
      <PendingSubmitButton idle="Send message" loading="Sending..." variant="secondary" />
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
    <div className="space-y-3">
      <form action={acceptOfferAction} className="space-y-3">
        <input name="offerId" type="hidden" value={offerId} />
        <FormInput
          id="address"
          name="address"
          label="Delivery Address"
          defaultValue={defaultAddress}
          placeholder="Enter delivery address"
          required
          icon={MapPin}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <FormSelect
            id="deliveryType"
            name="deliveryType"
            label="Delivery Type"
            options={[
              { value: "platform", label: "Platform delivery" },
              { value: "self", label: "Self delivery" },
            ]}
            defaultValue="platform"
          />
          <FormSelect
            id="paymentProvider"
            name="paymentProvider"
            label="Payment Provider"
            options={[
              { value: "razorpay", label: "Razorpay" },
              { value: "stripe", label: "Stripe" },
            ]}
            defaultValue="razorpay"
          />
        </div>
        <PendingSubmitButton idle="Accept & create order" loading="Processing..." />
      </form>
      <form action={rejectOfferAction}>
        <input name="offerId" type="hidden" value={offerId} />
        <PendingSubmitButton idle="Reject offer" loading="Rejecting..." variant="danger" />
      </form>
    </div>
  );
}

export function AdminApprovalForm({ userId }: { userId: string }) {
  return (
    <form action={approveFarmerAction}>
      <input name="userId" type="hidden" value={userId} />
      <PendingSubmitButton idle="Approve farmer" loading="Approving..." />
    </form>
  );
}

export function OrderReviewForm({
  orderId,
  targetName,
  targetRole,
  existingReview,
}: {
  orderId: string;
  targetName: string;
  targetRole: string;
  existingReview?: {
    rating: number;
    feedback: string;
  } | null;
}) {
  const [state, action, pending] = useActionState(submitReviewAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <input name="orderId" type="hidden" value={orderId} />
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-400" />
          <p className="text-sm font-semibold text-gray-900">
            Rate {targetName} ({targetRole})
          </p>
        </div>
        {existingReview && (
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            Editing review
          </span>
        )}
      </div>
      
      <FormSelect
        id={`review-rating-${orderId}`}
        name="rating"
        label="Rating"
        options={[
          { value: "5", label: "5 - Excellent" },
          { value: "4", label: "4 - Good" },
          { value: "3", label: "3 - Average" },
          { value: "2", label: "2 - Poor" },
          { value: "1", label: "1 - Very poor" },
        ]}
        defaultValue={String(existingReview?.rating ?? 5)}
      />
      
      <FormTextarea
        id={`review-feedback-${orderId}`}
        name="feedback"
        label="Feedback"
        defaultValue={existingReview?.feedback ?? ""}
        placeholder="Share delivery quality, communication, and overall experience."
        rows={3}
      />
      
      <PendingSubmitButton 
        idle={existingReview ? "Update review" : "Submit review"} 
        loading="Saving..." 
        variant="secondary"
      />
      <FormFeedback state={state} />
    </form>
  );
}