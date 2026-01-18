"use client";

import { useState, useCallback } from "react";
import { Sparkles, AlertCircle } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { VideoPreview } from "@/components/VideoPreview";
import { ProgressIndicator } from "@/components/ProgressIndicator";
import { useFalUpload } from "@/hooks/useFalUpload";
import { useVideoGeneration } from "@/hooks/useVideoGeneration";
import type { CharacterOrientation } from "@/types";

export default function Home() {
  // File states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Form states
  const [prompt, setPrompt] = useState("");
  const [orientation, setOrientation] =
    useState<CharacterOrientation>("image");

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
    status,
    queuePosition,
    message,
    result,
    error,
  } = useVideoGeneration();

  const isUploading = uploadingImage || uploadingVideo;
  const canGenerate = imageUrl && videoUrl && !isUploading && status === "idle";

  // Handle image selection
  const handleImageSelect = useCallback(
    async (file: File) => {
      setImageFile(file);
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
      setVideoFile(file);
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
    setImageFile(null);
    setVideoFile(null);
    setImageUrl(null);
    setVideoUrl(null);
    setPrompt("");
    setOrientation("image");
  }, [reset]);

  // Show result view
  if (status === "complete" && result) {
    return (
      <main className="min-h-screen p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              TikTok Motion Creator
            </h1>
          </div>

          <VideoPreview
            url={result.url}
            fileName={result.file_name}
            onCreateAnother={handleReset}
          />
        </div>
      </main>
    );
  }

  // Show processing view
  if (status === "processing" || status === "uploading") {
    return (
      <main className="min-h-screen p-6 md:p-12 flex items-center justify-center">
        <div className="max-w-4xl mx-auto w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
              TikTok Motion Creator
            </h1>
          </div>

          <ProgressIndicator
            status={isUploading ? "uploading" : queuePosition ? "queued" : "processing"}
            queuePosition={queuePosition}
            message={message || undefined}
          />
        </div>
      </main>
    );
  }

  // Show main form
  return (
    <main className="min-h-screen p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            TikTok Motion Creator
          </h1>
          <p className="text-text-muted text-lg max-w-2xl mx-auto">
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
        <div className="bg-surface rounded-2xl p-6 mb-8">
          {/* Prompt */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Prompt (optional)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe any additional context for the video..."
              className="w-full px-4 py-3 bg-background border border-text-muted/30 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:border-primary transition-colors resize-none"
              rows={2}
            />
          </div>

          {/* Orientation */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-3">
              Character Orientation
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="orientation"
                  value="image"
                  checked={orientation === "image"}
                  onChange={() => setOrientation("image")}
                  className="w-5 h-5 accent-primary"
                />
                <div>
                  <span className="text-text-primary group-hover:text-primary transition-colors">
                    Match Image Pose
                  </span>
                  <p className="text-xs text-text-muted">
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
                  className="w-5 h-5 accent-primary"
                />
                <div>
                  <span className="text-text-primary group-hover:text-primary transition-colors">
                    Match Video Motion
                  </span>
                  <p className="text-xs text-text-muted">
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
          <p className="text-center text-text-muted text-sm mt-4">
            {!imageUrl && !videoUrl
              ? "Upload both a character image and motion reference to continue"
              : !imageUrl
              ? "Upload a character image to continue"
              : "Upload a motion reference video to continue"}
          </p>
        )}
      </div>
    </main>
  );
}
