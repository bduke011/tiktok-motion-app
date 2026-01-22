"use client";

import { useState } from "react";
import { X, Gift } from "lucide-react";

interface User {
  id: string;
  email: string;
  name: string | null;
  credits: number;
}

interface AwardCreditsModalProps {
  user: User;
  onClose: () => void;
  onAward: (userId: string, amount: number, reason: string) => Promise<void>;
}

export function AwardCreditsModal({ user, onClose, onAward }: AwardCreditsModalProps) {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      setError("Please enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      await onAward(user.id, numAmount, reason);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to award credits");
    } finally {
      setSaving(false);
    }
  };

  const presetAmounts = [100, 250, 500, 1000];

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

        <div className="flex items-center gap-3 mb-1">
          <Gift className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Award Credits</h2>
        </div>
        <p className="text-sm text-[var(--text-muted)] mb-2">
          {user.name || user.email}
        </p>
        <p className="text-sm text-[var(--text-muted)] mb-6">
          Current balance: <span className="text-white font-medium">{user.credits.toLocaleString()} credits</span>
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Amount
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="Enter amount (negative to deduct)"
            />
            <div className="flex gap-2 mt-2">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  className="px-3 py-1 text-sm bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
              Reason (optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--primary)]"
              placeholder="e.g., Customer support, Promotion"
            />
          </div>

          {amount && !isNaN(parseInt(amount)) && (
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-sm text-[var(--text-muted)]">
                New balance will be:{" "}
                <span className="text-white font-medium">
                  {(user.credits + parseInt(amount)).toLocaleString()} credits
                </span>
              </p>
            </div>
          )}

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
              disabled={saving || !amount}
              className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-white font-medium disabled:opacity-50 transition-colors"
            >
              {saving ? "Awarding..." : "Award Credits"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
