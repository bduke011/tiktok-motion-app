"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  subscriptionTier: string;
  subscriptionStatus: string;
  credits: number;
}

interface UserEditModalProps {
  user: User;
  onClose: () => void;
  onSave: (userId: string, updates: Partial<User>) => Promise<void>;
}

export function UserEditModal({ user, onClose, onSave }: UserEditModalProps) {
  const [name, setName] = useState(user.name || "");
  const [tier, setTier] = useState(user.subscriptionTier);
  const [status, setStatus] = useState(user.subscriptionStatus);
  const [credits, setCredits] = useState(user.credits.toString());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      await onSave(user.id, {
        name: name || null,
        subscriptionTier: tier,
        subscriptionStatus: status,
        credits: parseInt(credits) || 0,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--surface)] border border-white/10 rounded-2xl p-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[var(--text-muted)] hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Edit User</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">{user.email}</p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="User's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Subscription Tier
            </label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Subscription Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[var(--primary)]"
            >
              <option value="free">Free</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Credits
            </label>
            <input
              type="number"
              value={credits}
              onChange={(e) => setCredits(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              min="0"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 btn-primary rounded-lg text-white font-medium disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
