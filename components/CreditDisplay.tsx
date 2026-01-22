"use client";

import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import Link from "next/link";

interface CreditInfo {
  credits: number;
  tier: string;
  maxCredits: number | null;
}

export function CreditDisplay() {
  const [creditInfo, setCreditInfo] = useState<CreditInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCredits() {
      try {
        const response = await fetch("/api/credits");
        if (response.ok) {
          const data = await response.json();
          setCreditInfo(data);
        }
      } catch (error) {
        console.error("Failed to fetch credits:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCredits();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 px-2 py-1 bg-[var(--surface)] rounded-lg animate-pulse">
        <div className="w-4 h-4 bg-white/10 rounded" />
        <div className="w-12 h-4 bg-white/10 rounded" />
      </div>
    );
  }

  if (!creditInfo) return null;

  const { credits, maxCredits } = creditInfo;
  const percentage = maxCredits ? (credits / maxCredits) * 100 : 100;
  const isLow = percentage < 20;
  const isEmpty = credits <= 0;

  return (
    <Link
      href="/pricing"
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors ${
        isEmpty
          ? "bg-red-500/20 text-red-400 hover:bg-red-500/30"
          : isLow
          ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
          : "bg-[var(--surface)] text-white hover:bg-white/10"
      }`}
      title={`${credits} credits remaining${maxCredits ? ` of ${maxCredits}` : ""}`}
    >
      <Coins className="w-4 h-4" />
      <span className="text-sm font-medium">{credits.toLocaleString()}</span>
    </Link>
  );
}
