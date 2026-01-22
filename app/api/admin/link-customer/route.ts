import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Admin endpoint to manually link a Polar customer ID to a user
// Only works for the currently authenticated user (for self-service)
// or could be extended for admin use

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { polarCustomerId } = body;

    if (!polarCustomerId) {
      return NextResponse.json({ error: "Missing polarCustomerId" }, { status: 400 });
    }

    // Update the user's Polar customer ID
    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { polarCustomerId },
      select: { id: true, email: true, polarCustomerId: true },
    });

    console.log(`Linked Polar customer ${polarCustomerId} to user ${user.email}`);

    return NextResponse.json({
      success: true,
      message: `Linked customer ID to ${user.email}`,
      user: { id: user.id, email: user.email, polarCustomerId: user.polarCustomerId }
    });
  } catch (error) {
    console.error("Link customer error:", error);
    return NextResponse.json({ error: "Failed to link customer" }, { status: 500 });
  }
}

// GET to check current status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        polarCustomerId: true,
        subscriptionTier: true,
        subscriptionStatus: true,
        credits: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error("Get customer error:", error);
    return NextResponse.json({ error: "Failed to get customer info" }, { status: 500 });
  }
}
