"use client";

import { useState, useCallback, useRef } from "react";
import type {
  SubmitParams,
  StatusResponse,
  VideoResult,
  GenerationStatus,
} from "@/types";

const N8N_SUBMIT_URL =
  process.env.NEXT_PUBLIC_N8N_SUBMIT_URL ||
  "https://duke011.app.n8n.cloud/webhook/tiktok-motion/submit";
const N8N_STATUS_URL =
  process.env.NEXT_PUBLIC_N8N_STATUS_URL ||
  "https://duke011.app.n8n.cloud/webhook/tiktok-motion/status";

interface UseVideoGenerationReturn {
  submit: (params: SubmitParams) => Promise<void>;
  reset: () => void;
  status: GenerationStatus;
  queuePosition: number | null;
  message: string | null;
  result: VideoResult | null;
  error: string | null;
}

export function useVideoGeneration(): UseVideoGenerationReturn {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<VideoResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(
    async (requestId: string) => {
      try {
        // Create abort controller with 260 second timeout (n8n waits 250s)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 260000);

        const response = await fetch(
          `${N8N_STATUS_URL}?request_id=${requestId}`,
          { signal: controller.signal }
        );

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Status check failed: ${response.statusText}`);
        }

        const data: StatusResponse = await response.json();

        if (data.status === "COMPLETED" && data.video) {
          setResult(data.video);
          setStatus("complete");
          setMessage(null);
          stopPolling();
          return;
        }

        if (data.status === "FAILED") {
          setError(data.message || "Video generation failed");
          setStatus("error");
          stopPolling();
          return;
        }

        // Update queue position and message
        if (data.queue_position !== undefined) {
          setQueuePosition(data.queue_position);
        }
        if (data.message) {
          setMessage(data.message);
        }

        // Map status
        if (data.status === "IN_QUEUE" || data.status === "QUEUED") {
          setStatus("processing");
        } else if (data.status === "IN_PROGRESS") {
          setStatus("processing");
          setQueuePosition(null);
        }

        // Continue polling every 15 seconds
        pollingRef.current = setTimeout(() => pollStatus(requestId), 15000);
      } catch (err) {
        let errorMessage = "Failed to check status";
        if (err instanceof Error) {
          if (err.name === "AbortError") {
            errorMessage = "Request timed out. Please try checking status again.";
          } else {
            errorMessage = err.message;
          }
        }
        setError(errorMessage);
        setStatus("error");
        stopPolling();
      }
    },
    [stopPolling]
  );

  const submit = useCallback(
    async (params: SubmitParams) => {
      setStatus("processing");
      setError(null);
      setResult(null);
      setQueuePosition(null);
      setMessage("Submitting to queue...");

      try {
        const response = await fetch(N8N_SUBMIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          throw new Error(`Submit failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.success || !data.request_id) {
          throw new Error(data.message || "Failed to submit request");
        }

        setMessage("Video generation started...");

        // Start polling for status
        pollingRef.current = setTimeout(
          () => pollStatus(data.request_id),
          3000
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to submit request";
        setError(errorMessage);
        setStatus("error");
      }
    },
    [pollStatus]
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus("idle");
    setQueuePosition(null);
    setMessage(null);
    setResult(null);
    setError(null);
  }, [stopPolling]);

  return {
    submit,
    reset,
    status,
    queuePosition,
    message,
    result,
    error,
  };
}
