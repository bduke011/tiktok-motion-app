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
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    // Get user's Polar customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { polarCustomerId: true, email: true },
    });

    if (!user?.polarCustomerId) {
      // No Polar customer ID - redirect to pricing page with error
      console.error(`No Polar customer ID for user ${session.user.id} (${user?.email})`);
      return NextResponse.redirect(new URL("/pricing?error=no_subscription", req.url));
    }

    // Create a customer portal session
    const portalSession = await polar.customerSessions.create({
      customerId: user.polarCustomerId,
    });

    // Redirect to the portal URL
    return NextResponse.redirect(portalSession.customerPortalUrl);
  } catch (error) {
    console.error("Portal error:", error);
    return NextResponse.redirect(new URL("/pricing?error=portal_error", req.url));
  }
}
