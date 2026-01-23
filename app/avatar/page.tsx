"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload, Wand2, Download, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { DictationButton } from "@/components/DictationButton";
import { useFalUpload } from "@/hooks/useFalUpload";

type Mode = "create" | "edit";

const QUICK_PROMPTS = [
  "Professional headshot, studio lighting, clean background",
  "Anime style portrait, vibrant colors, detailed",
  "Cyberpunk avatar, neon lights, futuristic",
  "Fantasy character, magical aura, ethereal",
  "Pixel art avatar, retro gaming style",
  "Watercolor portrait, soft artistic style",
];

export default function AvatarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("create");
  const [prompt, setPrompt] = useState("");
  const [sourceImageUrl, setSourceImageUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading, progress: uploadProgress } = useFalUpload();

  // Handle image upload for edit mode
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const url = await upload(file);
        setSourceImageUrl(url);
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Failed to upload image");
      }
    },
    [upload]
  );

  // Generate avatar
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    if (mode === "edit" && !sourceImageUrl) {
      setError("Please upload an image to edit");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const response = await fetch("/api/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          mode,
          sourceImageUrl: mode === "edit" ? sourceImageUrl : undefined,
        }),
      });

      const data = await response.json();
      console.log("Avatar API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      if (data.warning) {
        console.warn("Avatar save warning:", data.warning);
      }

      setGeneratedImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [prompt, mode, sourceImageUrl]);

  // Download image
  const handleDownload = useCallback(async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `avatar-${Date.now()}-${index + 1}.png`;
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
    router.push("/login?callbackUrl=/avatar");
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12 md:pt-28">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Avatar Creator
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Create unique AI avatars from text or transform your photos into stunning artwork.
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-[var(--surface)] rounded-xl p-1 flex">
              <button
                onClick={() => setMode("create")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  mode === "create"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Wand2 className="w-4 h-4 inline mr-2" />
                Create
              </button>
              <button
                onClick={() => setMode("edit")}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  mode === "edit"
                    ? "bg-[var(--primary)] text-white"
                    : "text-[var(--text-muted)] hover:text-white"
                }`}
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Edit Photo
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Edit Mode: Image Upload */}
          {mode === "edit" && (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Source Image</label>
              <div className="relative">
                {sourceImageUrl ? (
                  <div className="relative w-48 h-48 rounded-xl overflow-hidden border border-[var(--primary)]">
                    <img
                      src={sourceImageUrl}
                      alt="Source"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => setSourceImageUrl(null)}
                      className="absolute top-2 right-2 p-1 bg-black/50 rounded-full hover:bg-black/70"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-48 h-48 border-2 border-dashed border-[var(--text-muted)]/30 rounded-xl cursor-pointer hover:border-[var(--primary)] transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                    {uploading ? (
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-sm text-[var(--text-muted)]">{uploadProgress}%</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                        <span className="text-sm text-[var(--text-muted)]">Upload Image</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              {mode === "create" ? "Describe your avatar" : "Describe the transformation"}
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={
                  mode === "create"
                    ? "A professional headshot with warm lighting, friendly smile..."
                    : "Transform into anime style with vibrant colors..."
                }
                className="w-full px-4 py-3 pr-14 bg-[var(--surface)] border border-[var(--text-muted)]/30 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                rows={3}
              />
              <div className="absolute right-3 bottom-3">
                <DictationButton
                  onTranscript={(text) => setPrompt((prev) => prev ? `${prev} ${text}` : text)}
                  disabled={generating}
                />
              </div>
            </div>
          </div>

          {/* Quick Prompts */}
          <div className="mb-8">
            <label className="block text-sm font-medium mb-3">Quick Prompts</label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  onClick={() => setPrompt(quickPrompt)}
                  className="px-3 py-1.5 text-sm bg-[var(--surface)] border border-[var(--text-muted)]/20 rounded-lg hover:border-[var(--primary)] transition-colors"
                >
                  {quickPrompt.slice(0, 30)}...
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || (mode === "edit" && !sourceImageUrl)}
            className="w-full btn-primary py-4 px-8 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Avatar
              </>
            )}
          </button>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Your Avatar</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {generatedImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl overflow-hidden border border-white/10"
                  >
                    <img
                      src={url}
                      alt={`Generated avatar ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={() => handleDownload(url, index)}
                        className="px-4 py-2 bg-white text-black rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
