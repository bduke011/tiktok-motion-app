import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: userId } = await params;
    const { amount, reason } = await request.json();

    if (typeof amount !== "number") {
      return NextResponse.json({ error: "Amount must be a number" }, { status: 400 });
    }

    // Get current user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const previousBalance = user.credits;
    const newBalance = previousBalance + amount;

    // Update user credits
    await prisma.user.update({
      where: { id: userId },
      data: { credits: newBalance },
    });

    console.log(
      `Admin ${session.user.email} awarded ${amount} credits to ${user.email}. ` +
      `Previous: ${previousBalance}, New: ${newBalance}. Reason: ${reason || "N/A"}`
    );

    return NextResponse.json({
      success: true,
      previousBalance,
      newBalance,
      amountAwarded: amount,
    });
  } catch (error) {
    console.error("Admin award credits error:", error);
    return NextResponse.json(
      { error: "Failed to award credits" },
      { status: 500 }
    );
  }
}
