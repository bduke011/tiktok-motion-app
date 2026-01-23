"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Download, Trash2, Video, Play, Plus } from "lucide-react";

interface VideoGeneration {
  id: string;
  prompt: string | null;
  characterOrientation: string;
  sourceImageUrl: string;
  sourceVideoUrl: string;
  resultUrl: string;
  fileName: string | null;
  createdAt: string;
}

export default function VideosPage() {
  const { data: session } = useSession();

  const [videos, setVideos] = useState<VideoGeneration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch("/api/video");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch");
        }

        setVideos(data.generations);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    if (session) {
      fetchVideos();
    }
  }, [session]);

  // Download video
  const handleDownload = useCallback(async (url: string, fileName: string | null) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = fileName || `video-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, []);

  // Delete video
  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    setDeleting(id);
    try {
      const response = await fetch(`/api/video?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete");
      }

      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete video");
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
          <h1 className="text-3xl font-bold text-white">Your Videos</h1>
          <p className="text-[var(--text-muted)] mt-1">
            {videos.length} video{videos.length !== 1 ? "s" : ""} created
          </p>
        </div>
        <Link
          href="/create"
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
      {!error && videos.length === 0 && (
        <div className="text-center py-24">
          <Video className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">No videos yet</h2>
          <p className="text-[var(--text-muted)] mb-6">
            Create your first video to see it here.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-xl font-medium text-white"
          >
            Create Video
          </Link>
        </div>
      )}

      {/* Video Grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-[var(--surface)] rounded-2xl overflow-hidden border border-white/5 hover:border-white/10 transition-colors"
            >
              {/* Video Preview */}
              <div className="relative aspect-[9/16] bg-black">
                {playingId === video.id ? (
                  <video
                    src={video.resultUrl}
                    className="w-full h-full object-contain"
                    controls
                    autoPlay
                    onEnded={() => setPlayingId(null)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center cursor-pointer group relative"
                    onClick={() => setPlayingId(video.id)}
                  >
                    {/* Thumbnail - use source image as preview */}
                    <img
                      src={video.sourceImageUrl}
                      alt=""
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="relative w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </div>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 mb-2">
                  {video.prompt || "No prompt"}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[var(--text-muted)]/50">
                    {new Date(video.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownload(video.resultUrl, video.fileName)}
                      className="p-2 text-[var(--text-muted)] hover:text-white transition-colors"
                      title="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(video.id)}
                      disabled={deleting === video.id}
                      className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deleting === video.id ? (
                        <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
