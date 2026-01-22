import { Webhooks } from "@polar-sh/nextjs";
import { prisma } from "@/lib/prisma";
import {
  TIER_CREDITS,
  type SubscriptionTier,
} from "@/lib/credits";

// Map Polar product IDs to tiers
const PRODUCT_TO_TIER: Record<string, SubscriptionTier> = {
  "4ca665cb-283c-46f2-9197-6ca2d162b9fd": "free",
  "b8782531-38b4-4bee-8186-d7a777ba3d85": "pro",
  "435e232e-1240-452c-bf01-f1ee9f15976b": "business",
  "ec3ce22d-57f8-45ff-a11f-0953ca4003a5": "corporate",
};

function getTierFromProductId(productId: string): SubscriptionTier {
  return PRODUCT_TO_TIER[productId] || "free";
}

export const POST = Webhooks({
  webhookSecret: process.env.POLAR_WEBHOOK_SECRET!,

  onPayload: async (payload) => {
    console.log("Polar webhook received:", payload.type);
  },

  onCheckoutCreated: async (payload) => {
    console.log("Checkout created:", payload.data.id);
  },

  onCheckoutUpdated: async (payload) => {
    const checkout = payload.data;
    console.log("Checkout updated:", checkout.id, checkout.status);

    // When checkout is confirmed, link customer to user
    if (checkout.status === "confirmed" && checkout.customer_id) {
      const customerEmail = checkout.customer_email;

      if (customerEmail) {
        await prisma.user.updateMany({
          where: { email: customerEmail },
          data: { polarCustomerId: checkout.customer_id },
        });
        console.log(`Linked Polar customer ${checkout.customer_id} to ${customerEmail}`);
      }
    }
  },

  onSubscriptionCreated: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription created:", subscription.id);
  },

  onSubscriptionActive: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription active:", subscription.id);

    const customerId = subscription.customer_id;
    const productId = subscription.product_id;
    const tier = getTierFromProductId(productId);
    const credits = TIER_CREDITS[tier];

    // Find user by Polar customer ID
    const user = await prisma.user.findFirst({
      where: { polarCustomerId: customerId },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionTier: tier,
          subscriptionStatus: "active",
          subscriptionId: subscription.id,
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end)
            : null,
          credits: credits === -1 ? 999999 : credits,
          creditsResetDate: new Date(),
        },
      });
      console.log(`Updated user ${user.email} to tier ${tier} with ${credits} credits`);
    } else {
      console.warn(`No user found for Polar customer ${customerId}`);
    }
  },

  onSubscriptionUpdated: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription updated:", subscription.id, subscription.status);

    // Handle subscription renewal (reset credits)
    if (subscription.status === "active") {
      const user = await prisma.user.findFirst({
        where: { polarCustomerId: subscription.customer_id },
      });

      if (user) {
        const tier = getTierFromProductId(subscription.product_id);
        const credits = TIER_CREDITS[tier];

        // Check if this is a new billing period
        const newPeriodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end)
          : null;

        if (
          newPeriodEnd &&
          user.currentPeriodEnd &&
          newPeriodEnd > user.currentPeriodEnd
        ) {
          // New billing period - reset credits
          await prisma.user.update({
            where: { id: user.id },
            data: {
              currentPeriodEnd: newPeriodEnd,
              credits: credits === -1 ? 999999 : credits,
              creditsResetDate: new Date(),
            },
          });
          console.log(`Reset credits for ${user.email} - new billing period`);
        }
      }
    }
  },

  onSubscriptionCanceled: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription canceled:", subscription.id);

    // Mark as canceled but keep access until period end
    await prisma.user.updateMany({
      where: { polarCustomerId: subscription.customer_id },
      data: { subscriptionStatus: "canceled" },
    });
  },

  onSubscriptionRevoked: async (payload) => {
    const subscription = payload.data;
    console.log("Subscription revoked:", subscription.id);

    // Revert to free tier immediately
    await prisma.user.updateMany({
      where: { polarCustomerId: subscription.customer_id },
      data: {
        subscriptionTier: "free",
        subscriptionStatus: "free",
        subscriptionId: null,
        currentPeriodEnd: null,
        credits: TIER_CREDITS.free,
        creditsResetDate: new Date(),
      },
    });
  },

  onOrderPaid: async (payload) => {
    const order = payload.data;
    console.log("Order paid:", order.id);
    // Handle one-time purchases if needed
  },
});
