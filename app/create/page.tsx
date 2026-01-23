"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles, AlertCircle } from "lucide-react";
import { Header } from "@/components/Header";
import { DictationButton } from "@/components/DictationButton";
import { FileUploader } from "@/components/FileUploader";
import { VideoPreview } from "@/components/VideoPreview";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useFalUpload } from "@/hooks/useFalUpload";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import type { CharacterOrientation } from "@/types";

export default function CreatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // File states
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Form states
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] = useState<CharacterOrientation>("image");

  // Upload hooks
  const {
    upload: uploadImage,
    uploading: uploadingImage,
    progress: imageProgress,
    error: imageError,
  } = useFalUpload();
  const {
    upload: uploadVideo,
    uploading: uploadingVideo,
    progress: videoProgress,
    error: videoError,
  } = useFalUpload();

  // Combined upload error
  const uploadError = imageError || videoError;

  // Generation hook
  const {
    submit,
    reset,
    status: genStatus,
    queuePosition,
    message,
    result,
    error,
  } = useVideoGeneration();

  const isUploading = uploadingImage || uploadingVideo;
  const canGenerate = imageUrl && videoUrl && !isUploading && genStatus === "idle";

  // Track if we've saved this result to avoid duplicates
  const savedResultRef = useRef<string | null>(null);

  // Save video to database when generation completes
  useEffect(() => {
    async function saveVideo() {
      if (genStatus === "complete" && result && imageUrl && videoUrl) {
        // Avoid saving the same result twice
        if (savedResultRef.current === result.url) return;
        savedResultRef.current = result.url;

        console.log("Saving video to database...", { resultUrl: result.url });

        try {
          const response = await fetch("/api/video", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: prompt || null,
              characterOrientation: orientation,
              sourceImageUrl: imageUrl,
              sourceVideoUrl: videoUrl,
              resultUrl: result.url,
              fileName: result.file_name,
            }),
          });

          const data = await response.json();
          console.log("Video save response:", data);

          if (!response.ok) {
            console.error("Failed to save video:", data.error);
          }
        } catch (err) {
          console.error("Failed to save video:", err);
        }
      }
    }
    saveVideo();
  }, [genStatus, result, imageUrl, videoUrl, prompt, orientation]);

  // Handle image selection
  const handleImageSelect = useCallback(
    async (file: File) => {
      try {
        const url = await uploadImage(file);
        setImageUrl(url);
      } catch (err) {
        console.error("Image upload failed:", err);
      }
    },
    [uploadImage]
  );

  // Handle video selection
  const handleVideoSelect = useCallback(
    async (file: File) => {
      try {
        const url = await uploadVideo(file);
        setVideoUrl(url);
      } catch (err) {
        console.error("Video upload failed:", err);
      }
    },
    [uploadVideo]
  );

  // Handle generate
  const handleGenerate = useCallback(async () => {
    if (!imageUrl || !videoUrl) return;

    await submit({
      image_url: imageUrl,
      video_url: videoUrl,
      prompt: prompt || undefined,
      character_orientation: orientation,
    });
  }, [imageUrl, videoUrl, prompt, orientation, submit]);

  // Handle reset
  const handleReset = useCallback(() => {
    reset();
    setImageUrl(null);
    setVideoUrl(null);
    setPrompt("");
    setOrientation("image");
    savedResultRef.current = null;
  }, [reset]);

  // Redirect if not authenticated
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    router.push("/login?callbackUrl=/create");
    return null;
  }

  // Show result view
  if (genStatus === "complete" && result) {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-28 p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Your Video is Ready!
              </h1>
            </div>

            <VideoPreview
              url={result.url}
              fileName={result.file_name}
              onCreateAnother={handleReset}
            />
          </div>
        </main>
      </>
    );
  }

  // Show processing view
  if (genStatus === "processing" || genStatus === "uploading") {
    return (
      <>
        <Header />
        <main className="min-h-screen pt-28 p-6 md:p-12 flex items-center justify-center">
          <div className="max-w-4xl mx-auto w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                Creating Your Video
              </h1>
            </div>

            <ProgressIndicator
              status={isUploading ? "uploading" : queuePosition ? "queued" : "processing"}
              queuePosition={queuePosition}
              message={message || undefined}
            />
          </div>
        </main>
      </>
    );
  }

  // Show main form
  return (
    <>
      <Header />
      <main className="min-h-screen pt-28 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              Motion Creator
            </h1>
            <p className="text-[var(--text-muted)] text-lg max-w-2xl mx-auto">
              Transform any photo into a viral video using AI motion control.
              Upload a character image and a reference video to get started.
            </p>
          </div>

          {/* Error message */}
          {(error || uploadError) && (
            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-400">{error || uploadError}</p>
            </div>
          )}

          {/* Upload section */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <FileUploader
              accept="image"
              label="Character Image"
              description="JPG, PNG, WEBP - Your character's appearance"
              onFileSelect={handleImageSelect}
              uploading={uploadingImage}
              uploadProgress={imageProgress}
              uploadedUrl={imageUrl || undefined}
            />

            <FileUploader
              accept="video"
              label="Motion Reference"
              description="MP4, MOV, WEBM - The dance or motion to copy"
              onFileSelect={handleVideoSelect}
              uploading={uploadingVideo}
              uploadProgress={videoProgress}
              uploadedUrl={videoUrl || undefined}
            />
          </div>

          {/* Options section */}
          <div className="bg-[var(--surface)] rounded-2xl p-6 mb-8">
            {/* Prompt */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Prompt (optional)
              </label>
              <div className="relative">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe any additional context for the video..."
                  className="w-full px-4 py-3 pr-14 bg-black/50 border border-[var(--text-muted)]/30 rounded-xl focus:outline-none focus:border-[var(--primary)] transition-colors resize-none"
                  rows={2}
                />
                <div className="absolute right-3 bottom-3">
                  <DictationButton
                    onTranscript={(text) => setPrompt((prev) => prev ? `${prev} ${text}` : text)}
                    disabled={genStatus !== "idle"}
                  />
                </div>
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Character Orientation
              </label>
              <div className="flex gap-4 flex-wrap">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="orientation"
                    value="image"
                    checked={orientation === "image"}
                    onChange={() => setOrientation("image")}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  <div>
                    <span className="group-hover:text-[var(--primary)] transition-colors">
                      Match Image Pose
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      Keeps your character&apos;s original pose (max 10s)
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="orientation"
                    value="video"
                    checked={orientation === "video"}
                    onChange={() => setOrientation("video")}
                    className="w-5 h-5 accent-[var(--primary)]"
                  />
                  <div>
                    <span className="group-hover:text-[var(--primary)] transition-colors">
                      Match Video Motion
                    </span>
                    <p className="text-xs text-[var(--text-muted)]">
                      Full motion transfer from reference (max 30s)
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full btn-primary py-4 px-8 rounded-xl font-semibold text-lg text-white flex items-center justify-center gap-3"
          >
            <Sparkles className="w-6 h-6" />
            Generate Video
          </button>

          {/* Helper text */}
          {!canGenerate && !isUploading && (
            <p className="text-center text-[var(--text-muted)] text-sm mt-4">
              {!imageUrl && !videoUrl
                ? "Upload both a character image and motion reference to continue"
                : !imageUrl
                ? "Upload a character image to continue"
                : "Upload a motion reference video to continue"}
            </p>
          )}
        </div>
      </main>
    </>
  );
}
