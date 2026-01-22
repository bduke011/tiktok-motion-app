import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "production",
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const productId = searchParams.get("products");
  const customerEmail = searchParams.get("customerEmail");

  if (!productId) {
    return NextResponse.json({ error: "Missing products parameter" }, { status: 400 });
  }

  try {
    const checkout = await polar.checkouts.custom.create({
      productId,
      customerEmail: customerEmail || undefined,
      successUrl: process.env.POLAR_SUCCESS_URL || `${request.nextUrl.origin}/settings/billing?success=true`,
    });

    return NextResponse.redirect(checkout.url);
  } catch (error: unknown) {
    console.error("Polar checkout error:", error);

    // Return detailed error for debugging
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorDetails = error && typeof error === 'object' && 'body' in error ? (error as { body: unknown }).body : null;

    return NextResponse.json(
      {
        error: "Failed to create checkout",
        message: errorMessage,
        details: errorDetails,
        productId,
        customerEmail,
      },
      { status: 500 }
    );
  }
}
