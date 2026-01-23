"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  Upload,
  Download,
  AlertCircle,
  Image as ImageIcon,
  X,
  Plus,
} from "lucide-react";
import { Header } from "@/components/Header";
import { DictationButton } from "@/components/DictationButton";
import { useFalUpload } from "@/hooks/useFalUpload";

const QUICK_PROMPTS = [
  "Combine these two people in the same photo",
  "Put both subjects together in a studio setting",
  "Merge these images into one cohesive scene",
  "Place both characters side by side",
  "Create a group photo with these people",
  "Blend these images together naturally",
];

export default function CombinePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { upload, uploading, progress: uploadProgress } = useFalUpload();

  // Handle image upload
  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (imageUrls.length >= 4) {
        setError("Maximum 4 images allowed");
        return;
      }

      try {
        setError(null);
        const url = await upload(file);
        setImageUrls((prev) => [...prev, url]);
      } catch (err) {
        console.error("Upload failed:", err);
        setError("Failed to upload image");
      }

      // Reset input
      e.target.value = "";
    },
    [upload, imageUrls.length]
  );

  // Remove image
  const handleRemoveImage = useCallback((index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Generate combined image
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt describing how to combine the images");
      return;
    }

    if (imageUrls.length < 2) {
      setError("Please upload at least 2 images to combine");
      return;
    }

    setGenerating(true);
    setError(null);
    setGeneratedImages([]);

    try {
      const response = await fetch("/api/combine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageUrls,
        }),
      });

      const data = await response.json();
      console.log("Combine API response:", data);

      if (!response.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setGeneratedImages(data.images);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setGenerating(false);
    }
  }, [prompt, imageUrls]);

  // Download image
  const handleDownload = useCallback(async (url: string, index: number) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `combined-${Date.now()}-${index + 1}.png`;
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
    router.push("/login?callbackUrl=/combine");
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
              Photo Combiner
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Combine multiple photos into one using AI. Upload 2-4 images and describe how you want them merged.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {/* Image Upload Grid */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Source Images ({imageUrls.length}/4)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden border border-[var(--primary)]"
                >
                  <img
                    src={url}
                    alt={`Source ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-black/70 rounded-full hover:bg-black/90 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    Image {index + 1}
                  </div>
                </div>
              ))}

              {imageUrls.length < 4 && (
                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-[var(--text-muted)]/30 rounded-xl cursor-pointer hover:border-[var(--primary)] transition-colors">
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
                      <span className="text-sm text-[var(--text-muted)]">
                        {uploadProgress}%
                      </span>
                    </div>
                  ) : (
                    <>
                      <Plus className="w-8 h-8 text-[var(--text-muted)] mb-2" />
                      <span className="text-sm text-[var(--text-muted)]">
                        Add Image
                      </span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">
              Describe how to combine the images
            </label>
            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Combine these two people into a group photo in a park setting..."
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
            <label className="block text-sm font-medium mb-3">
              Quick Prompts
            </label>
            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.map((quickPrompt) => (
                <button
                  key={quickPrompt}
                  onClick={() => setPrompt(quickPrompt)}
                  className="px-3 py-1.5 text-sm bg-[var(--surface)] border border-[var(--text-muted)]/20 rounded-lg hover:border-[var(--primary)] transition-colors"
                >
                  {quickPrompt.slice(0, 35)}...
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating || !prompt.trim() || imageUrls.length < 2}
            className="w-full btn-primary py-4 px-8 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Combining Images...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Combine Images
              </>
            )}
          </button>

          {/* Generated Images */}
          {generatedImages.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Combined Result</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {generatedImages.map((url, index) => (
                  <div
                    key={index}
                    className="relative group rounded-2xl overflow-hidden border border-white/10"
                  >
                    <img
                      src={url}
                      alt={`Combined result ${index + 1}`}
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
