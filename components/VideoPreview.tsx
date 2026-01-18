"use client";

import { Download, RefreshCw, Play } from "lucide-react";

interface VideoPreviewProps {
  url: string;
  fileName?: string;
  onCreateAnother: () => void;
}

export function VideoPreview({
  url,
  fileName = "tiktok-video.mp4",
  onCreateAnother,
}: VideoPreviewProps) {
  const handleDownload = async () => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      // Fallback to direct link
      window.open(url, "_blank");
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-surface rounded-2xl overflow-hidden shadow-2xl">
        {/* Video Player */}
        <div className="relative aspect-[9/16] max-h-[500px] bg-black flex items-center justify-center">
          <video
            src={url}
            controls
            autoPlay
            loop
            playsInline
            className="w-full h-full object-contain"
          >
            Your browser does not support the video tag.
          </video>

          {/* Play indicator overlay - shows briefly */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-20 h-20 rounded-full bg-primary/80 flex items-center justify-center">
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 space-y-4">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-text-primary">
              Your video is ready!
            </h3>
            <p className="text-text-muted text-sm">
              Download it or create another masterpiece
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDownload}
              className="flex-1 btn-primary py-3 px-6 rounded-xl font-medium text-white flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download Video
            </button>

            <button
              onClick={onCreateAnother}
              className="flex-1 py-3 px-6 rounded-xl font-medium text-text-primary bg-surface border border-text-muted/30 hover:border-secondary hover:text-secondary transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              Create Another
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
