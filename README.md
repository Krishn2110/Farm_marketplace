This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` using `.env.example` and set:

```bash
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB=farm_marketplace
SESSION_SECRET=replace_with_a_long_random_secret
MANDI_API_KEY=your_data_gov_in_api_key
```

3. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## MongoDB

- App now stores data in MongoDB collection `store`.
- On first run, seed data is inserted automatically if no store document exists.

## Live Mandi Price Comparison

- Listings page compares each direct farm listing with mandi benchmark data.
- Live mandi data is fetched from the official Government of India data platform / AGMARKNET dataset.
- Configure `MANDI_API_KEY` in `.env.local` to enable live fetching.
- If the mandi API is unavailable or the key is missing, the app falls back to internal benchmark mappings for supported commodities.

## Auth Hardening

- Login attempts are rate-limited (5 tries per 10 minutes per email+IP).
- Farmer login is blocked until admin approval.
- Forgot password flow is available at `/forgot-password`.
- Reset password flow is available at `/reset-password?token=...`.
- In development, generated reset token is written to server logs.

## Listing Images

- Farmer listing form supports image upload.
- Supported formats: JPG, PNG, WEBP.
- Max 4 images per listing, max 5MB per image.
- Images are stored under `public/uploads/listings`.

## Offer Rules

- Buyer offer price must be greater than 0.
- A buyer cannot place an offer on their own listing.
- If a pending offer already exists for the same buyer and product, it is updated.
- Offer send is rate-limited (8 attempts per 10 minutes per buyer/product/IP).
- Offer-thread messages are rate-limited (20 messages per 10 minutes per user/offer/IP).
- Only the buyer, farmer, or admin can message in an offer thread.

## Farmer Flow Guards

- Farmer must be approved before creating listings or accepting/rejecting offers.
- Only pending offers can be accepted or rejected.
- Order is created only from accepted offers.
- Duplicate order creation for the same offer is blocked.

## Admin Flow Guards

- Farmer approval only works for valid non-approved farmer accounts.
- Admin approval actions are rate-limited (40 actions per 10 minutes per admin/IP).
- Approval success/failure is audit-logged for traceability.

## Legacy Next.js template notes

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
