"use client";

import { useState, useCallback } from "react";
import { fal } from "@/lib/fal";

interface UseFalUploadReturn {
  upload: (file: File) => Promise<string>;
  uploading: boolean;
  progress: number;
  error: string | null;
}

export function useFalUpload(): UseFalUploadReturn {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = useCallback(async (file: File): Promise<string> => {
    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate progress since fal.storage.upload doesn't provide progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const url = await fal.storage.upload(file);

      clearInterval(progressInterval);
      setProgress(100);

      return url;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload file";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setUploading(false);
    }
  }, []);

  return { upload, uploading, progress, error };
}
