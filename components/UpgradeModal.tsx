"use client";

import { X, Zap, Check } from "lucide-react";
import Link from "next/link";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRequired?: number;
  creditsAvailable?: number;
}

const TIERS = [
  {
    name: "Pro",
    price: "$20",
    credits: "2,000",
    features: ["2,000 credits/month", "~20 avatars or 36 videos", "Photo combiner"],
  },
  {
    name: "Business",
    price: "$50",
    credits: "5,000",
    popular: true,
    features: ["5,000 credits/month", "~50 avatars or 90 videos", "Priority support"],
  },
  {
    name: "Corporate",
    price: "$100",
    credits: "10,000",
    features: ["10,000 credits/month", "~100 avatars or 180 videos", "Dedicated support"],
  },
];

export function UpgradeModal({
  isOpen,
  onClose,
  creditsRequired,
  creditsAvailable,
}: UpgradeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-[var(--surface)] border border-white/10 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-[var(--primary)]/20 rounded-full mb-4">
            <Zap className="w-6 h-6 text-[var(--primary)]" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Upgrade Your Plan</h2>
          {creditsRequired !== undefined && creditsAvailable !== undefined && (
            <p className="text-[var(--text-muted)]">
              You need <span className="text-white font-medium">{creditsRequired} credits</span> but only have{" "}
              <span className="text-red-400 font-medium">{creditsAvailable}</span> remaining.
            </p>
          )}
        </div>

        {/* Tiers */}
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative p-4 rounded-xl border ${
                tier.popular
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-white/10 bg-white/5"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--primary)] text-white text-xs font-medium rounded-full">
                  Popular
                </div>
              )}

              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{tier.price}</span>
                  <span className="text-[var(--text-muted)]">/mo</span>
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {tier.credits} credits
                </p>
              </div>

              <ul className="space-y-2 mb-4">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-[var(--text-muted)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/pricing"
                className={`block w-full py-2 px-4 rounded-lg text-center font-medium transition-colors ${
                  tier.popular
                    ? "btn-primary text-white"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
                onClick={onClose}
              >
                Upgrade
              </Link>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-[var(--text-muted)]">
            Need more?{" "}
            <Link href="/pricing" className="text-[var(--primary)] hover:underline" onClick={onClose}>
              View all plans
            </Link>{" "}
            or{" "}
            <a href="mailto:contact@example.com" className="text-[var(--primary)] hover:underline">
              contact us for Enterprise
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
