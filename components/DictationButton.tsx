"use client";

import { useCallback, useEffect, useRef } from "react";
import { Mic, MicOff } from "lucide-react";
import { useSpeechToText } from "@/hooks/useSpeechToText";

interface DictationButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  disabled?: boolean;
}

export function DictationButton({
  onTranscript,
  className = "",
  disabled = false,
}: DictationButtonProps) {
  const lastTranscriptRef = useRef<string>("");

  const {
    isListening,
    isSupported,
    error,
    errorMessage,
    transcript,
    startListening,
    stopListening,
  } = useSpeechToText({
    continuous: true,
    interimResults: true,
  });

  // When transcript updates and we stop listening, send the final result
  useEffect(() => {
    if (transcript && transcript !== lastTranscriptRef.current) {
      lastTranscriptRef.current = transcript;
      onTranscript(transcript);
    }
  }, [transcript, onTranscript]);

  // Reset the last transcript ref when we start listening
  useEffect(() => {
    if (isListening) {
      lastTranscriptRef.current = "";
    }
  }, [isListening]);

  const handleClick = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Don't render if speech recognition not supported
  if (!isSupported) {
    return null;
  }

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        title={isListening ? "Stop recording" : "Start dictation"}
        className={`
          p-2 rounded-lg transition-all duration-200
          ${
            isListening
              ? "bg-[var(--primary)] text-white animate-pulse-mic"
              : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-white hover:bg-white/10"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          border border-white/10
          ${className}
        `}
      >
        {error ? (
          <MicOff className="w-5 h-5 text-red-400" />
        ) : (
          <Mic className="w-5 h-5" />
        )}
      </button>

      {/* Recording indicator */}
      {isListening && (
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--primary)] opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--primary)]" />
        </span>
      )}

      {/* Error tooltip */}
      {error && errorMessage && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-red-500/90 text-white text-xs rounded-lg whitespace-nowrap z-10">
          {errorMessage}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-red-500/90" />
        </div>
      )}
    </div>
  );
}
