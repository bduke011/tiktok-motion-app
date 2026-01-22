"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Users, CreditCard, TrendingUp, Image, Video, UserPlus } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { UserTable } from "@/components/admin/UserTable";
import { UserEditModal } from "@/components/admin/UserEditModal";
import { AwardCreditsModal } from "@/components/admin/AwardCreditsModal";

interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  credits: number;
  createdAt: string;
  _count: {
    avatarGenerations: number;
    videoGenerations: number;
  };
}

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  tierBreakdown: Record<string, number>;
  recentSignups: number;
  totalAvatarGenerations: number;
  totalVideoGenerations: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("");

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [awardingUser, setAwardingUser] = useState<User | null>(null);

  // Fetch users
  const fetchUsers = useCallback(async (page = 1, searchQuery = "", tier = "") => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (searchQuery) params.set("search", searchQuery);
      if (tier) params.set("tier", tier);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (session?.user?.isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [session, fetchUsers, fetchStats]);

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchUsers(page, search, tierFilter);
  };

  // Handle search
  const handleSearch = (searchQuery: string) => {
    setSearch(searchQuery);
    fetchUsers(1, searchQuery, tierFilter);
  };

  // Handle tier filter
  const handleFilterTier = (tier: string) => {
    setTierFilter(tier);
    fetchUsers(1, search, tier);
  };

  // Handle user update
  const handleSaveUser = async (userId: string, updates: Partial<User>) => {
    const response = await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, updates }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to update user");
    }

    // Refresh users list
    fetchUsers(pagination.page, search, tierFilter);
  };

  // Handle award credits
  const handleAwardCredits = async (userId: string, amount: number, reason: string) => {
    const response = await fetch(`/api/admin/users/${userId}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, reason }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to award credits");
    }

    // Refresh users list
    fetchUsers(pagination.page, search, tierFilter);
  };

  // Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/admin/login");
    return null;
  }

  if (!session.user.isAdmin) {
    router.push("/admin/login");
    return null;
  }

  return (
    <>
      <AdminHeader />
      <main className="min-h-screen pt-28 p-6 md:p-12 md:pt-28">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-[var(--text-muted)] mt-1">
              Manage users and monitor platform activity
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-[var(--text-muted)]">Total Users</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>

              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-[var(--text-muted)]">Paid Subs</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>

              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <UserPlus className="w-5 h-5 text-purple-400" />
                  <span className="text-sm text-[var(--text-muted)]">New (7d)</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.recentSignups}</p>
              </div>

              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Image className="w-5 h-5 text-amber-400" />
                  <span className="text-sm text-[var(--text-muted)]">Avatars</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalAvatarGenerations}</p>
              </div>

              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Video className="w-5 h-5 text-pink-400" />
                  <span className="text-sm text-[var(--text-muted)]">Videos</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalVideoGenerations}</p>
              </div>

              <div className="bg-[var(--surface)] border border-white/10 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <span className="text-sm text-[var(--text-muted)]">Pro Users</span>
                </div>
                <p className="text-2xl font-bold text-white">
                  {(stats.tierBreakdown.pro || 0) +
                    (stats.tierBreakdown.business || 0) +
                    (stats.tierBreakdown.corporate || 0)}
                </p>
              </div>
            </div>
          )}

          {/* User Table */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">Users</h2>
            <UserTable
              users={users}
              pagination={pagination}
              onPageChange={handlePageChange}
              onSearch={handleSearch}
              onFilterTier={handleFilterTier}
              onEditUser={setEditingUser}
              onAwardCredits={setAwardingUser}
              loading={loading}
              search={search}
              tierFilter={tierFilter}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      {editingUser && (
        <UserEditModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveUser}
        />
      )}

      {awardingUser && (
        <AwardCreditsModal
          user={awardingUser}
          onClose={() => setAwardingUser(null)}
          onAward={handleAwardCredits}
        />
      )}
    </>
  );
}
