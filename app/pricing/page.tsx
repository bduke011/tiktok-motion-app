"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Check, Sparkles, Zap, Building2, Crown } from "lucide-react";
import { Header } from "@/components/Header";
import Link from "next/link";

interface UserInfo {
  credits: number;
  tier: string;
  maxCredits: number | null;
}

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    credits: 250,
    icon: Sparkles,
    features: [
      "250 credits/month",
      "~2 avatar generations",
      "~4 video generations",
      "Basic support",
    ],
    cta: "Current Plan",
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "$20",
    period: "/month",
    credits: 2000,
    icon: Zap,
    features: [
      "2,000 credits/month",
      "~20 avatar generations",
      "~36 video generations",
      "Photo combiner access",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    productId: "b8782531-38b4-4bee-8186-d7a777ba3d85",
  },
  {
    id: "business",
    name: "Business",
    price: "$50",
    period: "/month",
    credits: 5000,
    popular: true,
    icon: Building2,
    features: [
      "5,000 credits/month",
      "~50 avatar generations",
      "~90 video generations",
      "All Pro features",
      "Priority queue",
    ],
    cta: "Upgrade to Business",
    productId: "435e232e-1240-452c-bf01-f1ee9f15976b",
  },
  {
    id: "corporate",
    name: "Corporate",
    price: "$100",
    period: "/month",
    credits: 10000,
    icon: Crown,
    features: [
      "10,000 credits/month",
      "~100 avatar generations",
      "~180 video generations",
      "All Business features",
      "Dedicated support",
    ],
    cta: "Upgrade to Corporate",
    productId: "ec3ce22d-57f8-45ff-a11f-0953ca4003a5",
  },
];

const CREDIT_COSTS = [
  { action: "Avatar (4 images)", credits: 95 },
  { action: "Video (5 seconds)", credits: 55 },
  { action: "Combine (1 image)", credits: 25 },
];

export default function PricingPage() {
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  useEffect(() => {
    async function fetchUserInfo() {
      if (!session) return;
      try {
        const response = await fetch("/api/credits");
        if (response.ok) {
          const data = await response.json();
          setUserInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }
    fetchUserInfo();
  }, [session]);

  const currentTier = userInfo?.tier || "free";

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Simple, Transparent Pricing
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Pay for what you use. $1 = 100 credits. No hidden fees.
            </p>
          </div>

          {/* Current Credits */}
          {session && userInfo && (
            <div className="mb-8 p-4 bg-[var(--surface)] border border-white/10 rounded-xl text-center">
              <p className="text-[var(--text-muted)]">
                Your current balance:{" "}
                <span className="text-white font-bold text-xl">{userInfo.credits.toLocaleString()} credits</span>
                {userInfo.maxCredits && (
                  <span className="text-[var(--text-muted)]"> / {userInfo.maxCredits.toLocaleString()}</span>
                )}
              </p>
              <p className="text-sm text-[var(--text-muted)] mt-1">
                Current plan: <span className="text-[var(--primary)] capitalize">{currentTier}</span>
              </p>
            </div>
          )}

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {TIERS.map((tier) => {
              const Icon = tier.icon;
              const isCurrentTier = tier.id === currentTier;
              const isUpgrade = TIERS.findIndex((t) => t.id === tier.id) > TIERS.findIndex((t) => t.id === currentTier);

              return (
                <div
                  key={tier.id}
                  className={`relative p-6 rounded-2xl border ${
                    tier.popular
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-white/10 bg-[var(--surface)]"
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--primary)] text-white text-sm font-medium rounded-full">
                      Most Popular
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div
                      className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                        tier.popular ? "bg-[var(--primary)]/20" : "bg-white/10"
                      }`}
                    >
                      <Icon className={`w-6 h-6 ${tier.popular ? "text-[var(--primary)]" : "text-white"}`} />
                    </div>
                    <h3 className="text-xl font-bold">{tier.name}</h3>
                    <div className="mt-3">
                      <span className="text-4xl font-bold">{tier.price}</span>
                      <span className="text-[var(--text-muted)]">{tier.period}</span>
                    </div>
                    <p className="text-sm text-[var(--text-muted)] mt-2">
                      {tier.credits.toLocaleString()} credits/month
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[var(--text-muted)]">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentTier ? (
                    <div className="w-full py-3 px-4 rounded-xl text-center font-medium bg-white/10 text-[var(--text-muted)]">
                      Current Plan
                    </div>
                  ) : tier.id === "free" ? (
                    <div className="w-full py-3 px-4 rounded-xl text-center font-medium bg-white/5 text-[var(--text-muted)]">
                      Free Forever
                    </div>
                  ) : session ? (
                    <Link
                      href={`/api/checkout?products=${tier.productId}&customerEmail=${session.user?.email}`}
                      className={`block w-full py-3 px-4 rounded-xl text-center font-medium transition-colors ${
                        tier.popular
                          ? "btn-primary text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      {tier.cta}
                    </Link>
                  ) : (
                    <Link
                      href="/login?callbackUrl=/pricing"
                      className={`block w-full py-3 px-4 rounded-xl text-center font-medium transition-colors ${
                        tier.popular
                          ? "btn-primary text-white"
                          : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                    >
                      Sign in to Upgrade
                    </Link>
                  )}
                </div>
              );
            })}
          </div>

          {/* Credit Costs */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-center mb-6">Credit Costs</h2>
            <p className="text-center text-[var(--text-muted)] mb-8">
              $1 = 100 credits. Here&apos;s what each action costs:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {CREDIT_COSTS.map((item) => (
                <div
                  key={item.action}
                  className="p-4 bg-white/5 rounded-xl text-center"
                >
                  <p className="text-2xl font-bold text-[var(--primary)]">{item.credits}</p>
                  <p className="text-sm text-[var(--text-muted)]">credits</p>
                  <p className="text-white font-medium mt-2">{item.action}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise */}
          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Need More?</h2>
            <p className="text-[var(--text-muted)] mb-6">
              Contact us for Enterprise plans with custom credits, dedicated support, and volume discounts.
            </p>
            <a
              href="mailto:contact@example.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </main>
    </>
  );
}
