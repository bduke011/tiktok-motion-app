import { prisma } from "./prisma";

// Credit costs per action (35% profit margin)
// $1 = 100 credits
export const CREDIT_COSTS = {
  avatar: 95, // 4 images @ $0.60 API cost → $0.95 user pays
  video: 55, // 5 seconds @ $0.35 API cost → $0.55 user pays
  combine: 25, // 1 image @ $0.15 API cost → $0.25 user pays
} as const;

// Monthly credits per tier
export const TIER_CREDITS = {
  free: 250,
  pro: 2000,
  business: 5000,
  corporate: 10000,
  enterprise: -1, // unlimited or custom
} as const;

export type CreditAction = keyof typeof CREDIT_COSTS;
export type SubscriptionTier = keyof typeof TIER_CREDITS;

/**
 * Check if user has enough credits for an action
 */
export async function checkCredits(
  userId: string,
  action: CreditAction
): Promise<{ hasCredits: boolean; currentCredits: number; required: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  });

  const required = CREDIT_COSTS[action];
  const currentCredits = user?.credits ?? 0;

  return {
    hasCredits: currentCredits >= required,
    currentCredits,
    required,
  };
}

/**
 * Deduct credits from user after successful action
 */
export async function deductCredits(
  userId: string,
  action: CreditAction
): Promise<{ success: boolean; remainingCredits: number }> {
  const cost = CREDIT_COSTS[action];

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { credits: { decrement: cost } },
      select: { credits: true },
    });

    return {
      success: true,
      remainingCredits: user.credits,
    };
  } catch (error) {
    console.error("Failed to deduct credits:", error);
    return {
      success: false,
      remainingCredits: 0,
    };
  }
}

/**
 * Get user's current credit balance
 */
export async function getCredits(userId: string): Promise<{
  credits: number;
  tier: string;
  resetDate: Date | null;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      credits: true,
      subscriptionTier: true,
      creditsResetDate: true,
    },
  });

  return {
    credits: user?.credits ?? 0,
    tier: user?.subscriptionTier ?? "free",
    resetDate: user?.creditsResetDate ?? null,
  };
}

/**
 * Reset user credits to their tier allowance (called by webhook on subscription renewal)
 */
export async function resetCredits(
  userId: string,
  tier: SubscriptionTier
): Promise<void> {
  const credits = TIER_CREDITS[tier];

  // Skip for enterprise (custom handling)
  if (credits === -1) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      credits,
      creditsResetDate: new Date(),
    },
  });
}

/**
 * Update user subscription and reset credits
 */
export async function updateSubscription(
  userId: string,
  tier: SubscriptionTier,
  subscriptionId: string,
  currentPeriodEnd: Date
): Promise<void> {
  const credits = TIER_CREDITS[tier];

  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: tier,
      subscriptionStatus: "active",
      subscriptionId,
      currentPeriodEnd,
      credits: credits === -1 ? 999999 : credits,
      creditsResetDate: new Date(),
    },
  });
}

/**
 * Cancel subscription (keeps access until period end)
 */
export async function cancelSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: "canceled",
    },
  });
}

/**
 * Revert to free tier (called when subscription expires)
 */
export async function revertToFreeTier(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionTier: "free",
      subscriptionStatus: "free",
      subscriptionId: null,
      currentPeriodEnd: null,
      credits: TIER_CREDITS.free,
      creditsResetDate: new Date(),
    },
  });
}
