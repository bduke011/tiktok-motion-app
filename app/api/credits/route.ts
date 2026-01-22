import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getCredits, CREDIT_COSTS, TIER_CREDITS } from "@/lib/credits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { credits, tier, resetDate } = await getCredits(session.user.id);
    const maxCredits = TIER_CREDITS[tier as keyof typeof TIER_CREDITS] || 250;

    return NextResponse.json({
      credits,
      tier,
      maxCredits: maxCredits === -1 ? null : maxCredits,
      resetDate,
      costs: CREDIT_COSTS,
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
