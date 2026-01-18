"use client";

import { Loader2, CloudUpload, Sparkles, Clock } from "lucide-react";

interface ProgressIndicatorProps {
  status: "uploading" | "queued" | "processing";
  queuePosition?: number | null;
  message?: string;
}

export function ProgressIndicator({
  status,
  queuePosition,
  message,
}: ProgressIndicatorProps) {
  const getStatusInfo = () => {
    switch (status) {
      case "uploading":
        return {
          icon: CloudUpload,
          title: "Uploading files...",
          description: "Preparing your media for processing",
          color: "text-secondary",
        };
      case "queued":
        return {
          icon: Clock,
          title: "In Queue",
          description:
            queuePosition !== null && queuePosition !== undefined
              ? `Position ${queuePosition} in queue`
              : "Waiting for processing slot",
          color: "text-yellow-400",
        };
      case "processing":
        return {
          icon: Sparkles,
          title: "Creating your video...",
          description: "AI is working its magic",
          color: "text-primary",
        };
    }
  };

  const info = getStatusInfo();
  const Icon = info.icon;

  return (
    <div className="w-full max-w-md mx-auto text-center py-12">
      {/* Animated icon container */}
      <div className="relative mb-8">
        {/* Outer glow ring */}
        <div
          className={`absolute inset-0 w-32 h-32 mx-auto rounded-full ${info.color} opacity-20 animate-ping`}
          style={{ animationDuration: "2s" }}
        />

        {/* Inner circle with icon */}
        <div
          className={`relative w-32 h-32 mx-auto rounded-full bg-surface border-2 border-current ${info.color} flex items-center justify-center animate-pulse-glow`}
        >
          {status === "processing" ? (
            <Loader2 className={`w-12 h-12 ${info.color} animate-spin`} />
          ) : status === "uploading" ? (
            <Icon className={`w-12 h-12 ${info.color} animate-bounce`} />
          ) : (
            <Icon className={`w-12 h-12 ${info.color}`} />
          )}
        </div>
      </div>

      {/* Status text */}
      <h3 className="text-2xl font-bold text-text-primary mb-2">
        {info.title}
      </h3>
      <p className="text-text-muted mb-4">{info.description}</p>

      {message && (
        <p className="text-sm text-text-muted bg-surface px-4 py-2 rounded-lg inline-block">
          {message}
        </p>
      )}

      {/* Progress bar for visual feedback */}
      {status === "processing" && (
        <div className="mt-8 w-full h-1 bg-surface rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"
            style={{
              width: "100%",
              animation: "shimmer 2s infinite linear",
              background:
                "linear-gradient(90deg, #fe2c55 0%, #25f4ee 50%, #fe2c55 100%)",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
