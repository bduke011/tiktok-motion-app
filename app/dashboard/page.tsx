"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  CreditCard,
  Image,
  Video,
  Sparkles,
  ArrowRight,
  Crown,
} from "lucide-react";
import { TIER_CREDITS } from "@/lib/credits";

interface Stats {
  credits: number;
  subscriptionTier: string;
  subscriptionStatus: string;
  createdAt: string;
  avatarCount: number;
  videoCount: number;
}

const TIER_NAMES: Record<string, string> = {
  free: "Starter",
  pro: "Pro",
  business: "Business",
  corporate: "Corporate",
  enterprise: "Enterprise",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/user/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const maxCredits = stats?.subscriptionTier
    ? TIER_CREDITS[stats.subscriptionTier as keyof typeof TIER_CREDITS] || 250
    : 250;

  const creditsPercent = stats ? Math.min((stats.credits / maxCredits) * 100, 100) : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session?.user?.name || session?.user?.email?.split("@")[0]}!
        </h1>
        <p className="text-[var(--text-muted)] mt-1">
          Here&apos;s an overview of your account
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-[var(--surface)] border border-white/10 rounded-xl p-6 animate-pulse"
            >
              <div className="h-4 w-20 bg-white/10 rounded mb-4" />
              <div className="h-8 w-16 bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Credits */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-[var(--primary)]" />
              <span className="text-[var(--text-muted)]">Credits</span>
            </div>
            <p className="text-3xl font-bold text-white mb-2">
              {stats?.credits.toLocaleString()}
            </p>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--primary)] transition-all"
                style={{ width: `${creditsPercent}%` }}
              />
            </div>
            <p className="text-sm text-[var(--text-muted)] mt-2">
              of {maxCredits.toLocaleString()} monthly
            </p>
          </div>

          {/* Avatars */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Image className="w-5 h-5 text-amber-400" />
              <span className="text-[var(--text-muted)]">Avatars Created</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.avatarCount || 0}</p>
            <Link
              href="/dashboard/avatars"
              className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
            >
              View gallery →
            </Link>
          </div>

          {/* Videos */}
          <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Video className="w-5 h-5 text-pink-400" />
              <span className="text-[var(--text-muted)]">Videos Created</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats?.videoCount || 0}</p>
            <Link
              href="/dashboard/videos"
              className="text-sm text-[var(--primary)] hover:underline mt-2 inline-block"
            >
              View gallery →
            </Link>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/avatar"
            className="flex items-center justify-between p-4 bg-[var(--surface)] border border-white/10 rounded-xl hover:border-[var(--primary)]/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--primary)]/20 rounded-lg flex items-center justify-center">
                <Image className="w-5 h-5 text-[var(--primary)]" />
              </div>
              <div>
                <p className="font-medium text-white">Create Avatar</p>
                <p className="text-sm text-[var(--text-muted)]">Generate AI avatars</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
          </Link>

          <Link
            href="/create"
            className="flex items-center justify-between p-4 bg-[var(--surface)] border border-white/10 rounded-xl hover:border-[var(--primary)]/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center">
                <Video className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <p className="font-medium text-white">Create Video</p>
                <p className="text-sm text-[var(--text-muted)]">Animate your images</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-pink-400 transition-colors" />
          </Link>
        </div>
      </div>

      {/* Subscription */}
      <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-semibold text-white">Your Plan</h2>
          </div>
          {stats?.subscriptionStatus === "active" && stats?.subscriptionTier !== "free" && (
            <span className="px-2 py-1 text-xs font-medium bg-green-500/20 text-green-400 rounded">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-white">
              {TIER_NAMES[stats?.subscriptionTier || "free"]} Plan
            </p>
            <p className="text-[var(--text-muted)]">
              {maxCredits.toLocaleString()} credits per month
            </p>
          </div>

          <div className="flex gap-3">
            {stats?.subscriptionTier !== "free" && stats?.subscriptionStatus === "active" ? (
              <a
                href="/api/portal"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
              >
                Manage Subscription
              </a>
            ) : (
              <Link
                href="/pricing"
                className="px-4 py-2 btn-primary rounded-lg text-white font-medium flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
