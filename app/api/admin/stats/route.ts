import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Get stats in parallel
    const [
      totalUsers,
      activeSubscriptions,
      tierCounts,
      recentSignups,
      totalGenerations,
    ] = await Promise.all([
      // Total users
      prisma.user.count(),

      // Active paid subscriptions
      prisma.user.count({
        where: {
          subscriptionStatus: "active",
          subscriptionTier: { not: "free" },
        },
      }),

      // Users by tier
      prisma.user.groupBy({
        by: ["subscriptionTier"],
        _count: { id: true },
      }),

      // Recent signups (last 7 days)
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),

      // Total generations
      Promise.all([
        prisma.avatarGeneration.count(),
        prisma.videoGeneration.count(),
      ]),
    ]);

    // Transform tier counts
    const tierBreakdown = tierCounts.reduce(
      (acc, item) => {
        acc[item.subscriptionTier] = item._count.id;
        return acc;
      },
      {} as Record<string, number>
    );

    return NextResponse.json({
      totalUsers,
      activeSubscriptions,
      tierBreakdown,
      recentSignups,
      totalAvatarGenerations: totalGenerations[0],
      totalVideoGenerations: totalGenerations[1],
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
