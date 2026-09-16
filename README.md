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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | Yes | Postgres connection string (Prisma). |
| `AUTH_SECRET` / `NEXTAUTH_URL` | Yes | NextAuth config. |
| `USDA_FDC_API_KEY` | No | USDA FoodData Central key for internet food search. Free at https://fdc.nal.usda.gov/api-key-signup.html. Without it, a shared `DEMO_KEY` (rate-limited, ~30 req/min) is used. `USDA_FDC_API_KEY_2` / `_3` are tried next for additional quota. |

Internet food search in the Nutrition Intelligence module (`lib/nutrition/internet-foods.ts`) queries USDA FoodData Central and Open Food Facts (key-less, with automatic regional-mirror fallback) so foods missing from the local `FoodItem` table can still be found and logged.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
