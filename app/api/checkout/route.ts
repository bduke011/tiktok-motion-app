import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  successUrl: process.env.POLAR_SUCCESS_URL || "/settings/billing?success=true",
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "production",
});
