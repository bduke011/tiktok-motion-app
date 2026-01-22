"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Download, Trash2, ImageIcon, Plus } from "lucide-react";

interface AvatarImage {
  id: string;
  url: string;
  createdAt: string;
}

interface AvatarGeneration {
  id: string;
  mode: string;
  prompt: string;
  sourceImageUrl: string | null;
  createdAt: string;
  images: AvatarImage[];
}

export default function AvatarsPage() {
  const { data: session } = useSession();

  const [generations, setGenerations] = useState<AvatarGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch generations
  useEffect(() => {
    async function fetchGenerations() {
      try {
        const response = await fetch("/api/avatar");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch");
        }

        setGenerations(data.generations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchGenerations();
    }
  }, [session]);

  // Download image
  const handleDownload = useCallback(async (url: string, prompt: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `avatar-${prompt.slice(0, 20).replace(/\s/g, "-")}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  // Delete generation
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this avatar? This cannot be undone.")) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/avatar?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setGenerations((prev) => prev.filter((g) => g.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete avatar");
    } finally {
      setDeleting(null);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Your Avatars</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {generations.length} avatar{generations.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link
          href="/avatar"
          className="flex items-center gap-2 px-4 py-2 btn-primary rounded-lg text-white font-medium"
        >
          <Plus className="w-4 h-4" />
          Create New
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!error && generations.length === 0 && (
        <div className="text-center py-24">
          <ImageIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No avatars yet</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Create your first avatar to see it here.
          </p>
          <Link
            href="/avatar"
            className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-xl font-medium text-white"
          >
            Create Avatar
          </Link>
        </div>
      )}

      {/* Gallery Grid */}
      {generations.length > 0 && (
        <div className="space-y-8">
          {generations.map((generation) => (
            <div key={generation.id} className="bg-[var(--surface)] rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-[var(--primary)]/20 text-[var(--primary)] rounded mb-2">
                    {generation.mode === "edit" ? "Edited" : "Created"}
                  </span>
                  <p className="text-[var(--text-muted)] text-sm line-clamp-2">
                    {generation.prompt}
                  </p>
                  <p className="text-[var(--text-muted)]/50 text-xs mt-1">
                    {new Date(generation.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(generation.id)}
                  disabled={deleting === generation.id}
                  className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                  title="Delete"
                >
                  {deleting === generation.id ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {generation.images.map((image) => (
                  <div
                    key={image.id}
                    className="relative group rounded-xl overflow-hidden aspect-square"
                  >
                    <img
                      src={image.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleDownload(image.url, generation.prompt)}
                        className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4 text-black" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
