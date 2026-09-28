This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

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

## Token Purchase Setup

Set the company transfer details in `.env.local` to show them on the Tokens page:

```env
NEXT_PUBLIC_MY_TOKENS_ENDPOINT=/api/v1/tokens
NEXT_PUBLIC_TOKEN_ACCOUNT_BANK=
NEXT_PUBLIC_TOKEN_ACCOUNT_NAME=
NEXT_PUBLIC_TOKEN_ACCOUNT_NUMBER=
```

`NEXT_PUBLIC_MY_TOKENS_ENDPOINT` defaults to `/api/v1/tokens`. It can be a full URL or a path relative to `NEXT_PUBLIC_API_BASE_URL`. The request includes the signed-in member's Bearer access token. The response can be an array of token records or an object containing an `items` array.

The other `NEXT_PUBLIC_` values are included in the browser bundle, so only use them for company account details intended to be visible to members. Receipt selection is available in the UI; submitting receipts requires a backend upload endpoint, which is not configured yet.

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
