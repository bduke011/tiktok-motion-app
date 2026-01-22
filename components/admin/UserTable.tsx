"use client";

import { useState } from "react";
import { Search, Edit2, Gift, ChevronLeft, ChevronRight } from "lucide-react";

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

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UserTableProps {
  users: User[];
  pagination: Pagination;
  onPageChange: (page: number) => void;
  onSearch: (search: string) => void;
  onFilterTier: (tier: string) => void;
  onEditUser: (user: User) => void;
  onAwardCredits: (user: User) => void;
  loading: boolean;
  search: string;
  tierFilter: string;
}

const TIER_COLORS: Record<string, string> = {
  free: "bg-gray-500/20 text-gray-400",
  pro: "bg-blue-500/20 text-blue-400",
  business: "bg-purple-500/20 text-purple-400",
  corporate: "bg-amber-500/20 text-amber-400",
};

export function UserTable({
  users,
  pagination,
  onPageChange,
  onSearch,
  onFilterTier,
  onEditUser,
  onAwardCredits,
  loading,
  search,
  tierFilter,
}: UserTableProps) {
  const [searchInput, setSearchInput] = useState(search);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  return (
    <div className="bg-[var(--surface)] border border-white/10 rounded-2xl overflow-hidden">
      {/* Filters */}
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row gap-4">
        <form onSubmit={handleSearchSubmit} className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by email or name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
            />
          </div>
        </form>

        <select
          value={tierFilter}
          onChange={(e) => onFilterTier(e.target.value)}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
        >
          <option value="">All Tiers</option>
          <option value="free">Free</option>
          <option value="pro">Pro</option>
          <option value="business">Business</option>
          <option value="corporate">Corporate</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                User
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                Tier
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                Credits
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                Generations
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-muted)]">
                Joined
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="w-6 h-6 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto" />
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {user.image ? (
                        <img
                          src={user.image}
                          alt=""
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-sm font-medium">
                          {user.email[0].toUpperCase()}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium">
                          {user.name || "No name"}
                        </p>
                        <p className="text-sm text-[var(--text-muted)]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-medium rounded ${
                        TIER_COLORS[user.subscriptionTier] || TIER_COLORS.free
                      }`}
                    >
                      {user.subscriptionTier}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white">
                    {user.credits.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-sm">
                    {user._count.avatarGenerations} avatars,{" "}
                    {user._count.videoGenerations} videos
                  </td>
                  <td className="px-4 py-3 text-[var(--text-muted)] text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onAwardCredits(user)}
                        className="p-2 text-[var(--text-muted)] hover:text-green-400 transition-colors"
                        title="Award Credits"
                      >
                        <Gift className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEditUser(user)}
                        className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t border-white/10 flex items-center justify-between">
          <p className="text-sm text-[var(--text-muted)]">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-2 text-[var(--text-muted)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-white">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="p-2 text-[var(--text-muted)] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
