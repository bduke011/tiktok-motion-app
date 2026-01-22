import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Polar } from "@polar-sh/sdk";

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "production",
});

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    console.log("Portal: session user id:", session?.user?.id);

    if (!session?.user?.id) {
      console.log("Portal: No session, redirecting to login");
      return NextResponse.redirect(new URL("/login", req.url), { status: 307 });
    }

    // Get user's Polar customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { polarCustomerId: true, email: true },
    });
    console.log("Portal: user polarCustomerId:", user?.polarCustomerId);

    if (!user?.polarCustomerId) {
      // No Polar customer ID - redirect to pricing page with error
      console.error(`Portal: No Polar customer ID for user ${session.user.id} (${user?.email})`);
      return NextResponse.redirect(new URL("/pricing?error=no_subscription", req.url), { status: 307 });
    }

    // Create a customer portal session
    console.log("Portal: Creating customer session for:", user.polarCustomerId);
    const portalSession = await polar.customerSessions.create({
      customerId: user.polarCustomerId,
    });
    console.log("Portal: Got portal URL:", portalSession.customerPortalUrl);

    // Redirect to the portal URL (use 307 for external redirect)
    return NextResponse.redirect(portalSession.customerPortalUrl, { status: 307 });
  } catch (error) {
    console.error("Portal error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.redirect(new URL(`/pricing?error=portal_error&message=${encodeURIComponent(errorMessage)}`, req.url), { status: 307 });
  }
}
