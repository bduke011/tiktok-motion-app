import { CustomerPortal } from "@polar-sh/nextjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  server: (process.env.POLAR_SERVER as "sandbox" | "production") || "sandbox",
  getCustomerId: async (req: NextRequest) => {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return "";
    }

    // Get user's Polar customer ID
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { polarCustomerId: true },
    });

    return user?.polarCustomerId || "";
  },
});
