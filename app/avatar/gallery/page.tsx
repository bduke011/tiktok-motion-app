"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Download, Trash2, ArrowLeft, ImageIcon } from "lucide-react";
import { Header } from "@/components/Header";
import Link from "next/link";

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

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [generations, setGenerations] = useState<AvatarGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Auth check
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/avatar/gallery");
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12 md:pt-28">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div>
              <Link
                href="/avatar"
                className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-white transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Creator
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold gradient-text">
                Your Avatars
              </h1>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
              {error}
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && generations.length === 0 && (
            <div className="text-center py-24">
              <ImageIcon className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">No avatars yet</h2>
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
          {!loading && generations.length > 0 && (
            <div className="space-y-12">
              {generations.map((generation) => (
                <div key={generation.id} className="bg-[var(--surface)] rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
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
      </main>
    </>
  );
}
