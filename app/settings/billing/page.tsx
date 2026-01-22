"use client";

import { useEffect, useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CreditCard,
  Coins,
  Calendar,
  ArrowRight,
  CheckCircle,
  Settings,
} from "lucide-react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface BillingInfo {
  credits: number;
  tier: string;
  maxCredits: number | null;
  resetDate: string | null;
  costs: {
    avatar: number;
    video: number;
    combine: number;
  };
}

const TIER_NAMES: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  business: "Business",
  corporate: "Corporate",
  enterprise: "Enterprise",
};

const TIER_PRICES: Record<string, string> = {
  free: "$0",
  pro: "$20",
  business: "$50",
  corporate: "$100",
  enterprise: "Custom",
};

function BillingContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const showSuccess = searchParams.get("success") === "true";

  useEffect(() => {
    async function fetchBillingInfo() {
      try {
        const response = await fetch("/api/credits");
        if (response.ok) {
          const data = await response.json();
          setBillingInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch billing info:", error);
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchBillingInfo();
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-28 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 w-48 bg-[var(--surface)] rounded" />
              <div className="h-48 bg-[var(--surface)] rounded-2xl" />
              <div className="h-32 bg-[var(--surface)] rounded-2xl" />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/settings/billing");
    return null;
  }

  const tier = billingInfo?.tier || "free";
  const credits = billingInfo?.credits || 0;
  const maxCredits = billingInfo?.maxCredits;
  const percentage = maxCredits ? Math.round((credits / maxCredits) * 100) : 100;

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">
                Your subscription has been updated successfully!
              </p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Billing & Usage</h1>
            <p className="text-[var(--text-muted)]">
              Manage your subscription and track your credit usage
            </p>
          </div>

          {/* Current Plan */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm text-[var(--text-muted)] mb-1">Current Plan</p>
                <h2 className="text-2xl font-bold">{TIER_NAMES[tier]}</h2>
                <p className="text-[var(--text-muted)]">
                  {TIER_PRICES[tier]}/month
                </p>
              </div>

              {tier !== "enterprise" && (
                <Link
                  href="/pricing"
                  className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg text-sm font-medium text-white"
                >
                  {tier === "free" ? "Upgrade" : "Change Plan"}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            {tier !== "free" && (
              <div className="pt-4 border-t border-white/10">
                <Link
                  href="/api/portal"
                  className="flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Manage subscription in billing portal</span>
                </Link>
              </div>
            )}
          </div>

          {/* Credit Usage */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-2xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[var(--primary)]/20 rounded-lg">
                <Coins className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <h3 className="font-semibold">Credit Balance</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {maxCredits
                    ? `${credits.toLocaleString()} of ${maxCredits.toLocaleString()} credits remaining`
                    : `${credits.toLocaleString()} credits remaining`}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {maxCredits && (
              <div className="mb-4">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage < 20
                        ? "bg-red-500"
                        : percentage < 50
                        ? "bg-yellow-500"
                        : "bg-[var(--primary)]"
                    }`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-2">
                  {percentage}% remaining this billing period
                </p>
              </div>
            )}

            {/* Reset Date */}
            {billingInfo?.resetDate && (
              <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                <Calendar className="w-4 h-4" />
                <span>
                  Credits reset on{" "}
                  {new Date(billingInfo.resetDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Credit Costs */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-white/10 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Credit Costs</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  How many credits each action uses
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {billingInfo?.costs?.avatar || 95}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Avatar (4 images)
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {billingInfo?.costs?.video || 55}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Video (5 seconds)
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-2xl font-bold text-[var(--primary)]">
                  {billingInfo?.costs?.combine || 25}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Combine (1 image)
                </p>
              </div>
            </div>
          </div>

          {/* Need Help */}
          <div className="mt-8 text-center">
            <p className="text-[var(--text-muted)]">
              Need help with billing?{" "}
              <a
                href="mailto:support@example.com"
                className="text-[var(--primary)] hover:underline"
              >
                Contact support
              </a>
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function BillingLoading() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-[var(--surface)] rounded" />
            <div className="h-48 bg-[var(--surface)] rounded-2xl" />
            <div className="h-32 bg-[var(--surface)] rounded-2xl" />
          </div>
        </div>
      </main>
    </>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingLoading />}>
      <BillingContent />
    </Suspense>
  );
}
