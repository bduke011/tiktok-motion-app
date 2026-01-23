"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { SpeechStatus, SpeechErrorType, UseSpeechToTextReturn } from "@/types";

// Type definitions for Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechToTextOptions {
  continuous?: boolean;
  interimResults?: boolean;
  language?: string;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: SpeechErrorType, message: string) => void;
}

function mapErrorType(error: string): SpeechErrorType {
  switch (error) {
    case "not-allowed":
      return "permission-denied";
    case "no-speech":
      return "no-speech";
    case "audio-capture":
      return "audio-capture";
    case "network":
      return "network";
    case "aborted":
      return "aborted";
    default:
      return "unknown";
  }
}

function getErrorMessage(errorType: SpeechErrorType): string {
  switch (errorType) {
    case "permission-denied":
      return "Microphone permission denied. Please allow access.";
    case "no-speech":
      return "No speech detected. Please try again.";
    case "audio-capture":
      return "No microphone found. Please connect one.";
    case "network":
      return "Network error. Please check your connection.";
    case "aborted":
      return "Speech recognition was stopped.";
    case "not-supported":
      return "Speech recognition is not supported in this browser.";
    default:
      return "An error occurred. Please try again.";
  }
}

export function useSpeechToText(
  options: UseSpeechToTextOptions = {}
): UseSpeechToTextReturn {
  const {
    continuous = true,
    interimResults = true,
    language = "en-US",
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<SpeechStatus>("idle");
  const [error, setError] = useState<SpeechErrorType | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [transcript, setTranscript] = useState("");

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isSupported =
    typeof window !== "undefined" &&
    (!!window.SpeechRecognition || !!window.webkitSpeechRecognition);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!isSupported) {
      setStatus("unsupported");
      return;
    }

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();

    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setError(null);
      setErrorMessage(null);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript;
        } else {
          interimTranscript += result[0].transcript;
        }
      }

      const newTranscript = finalTranscript || interimTranscript;
      setTranscript(newTranscript);

      if (onResult) {
        onResult(newTranscript, !!finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorType = mapErrorType(event.error);
      const message = getErrorMessage(errorType);

      setError(errorType);
      setErrorMessage(message);
      setStatus("error");
      setIsListening(false);

      if (onError) {
        onError(errorType, message);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setStatus((prev) => (prev === "error" ? prev : "idle"));
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.abort();
    };
  }, [isSupported, continuous, interimResults, language, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setStatus("unsupported");
      return;
    }

    setError(null);
    setErrorMessage(null);
    setTranscript("");

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error("Failed to start recognition:", err);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
  }, []);

  return {
    isListening,
    isSupported,
    status,
    error,
    errorMessage,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
  };
}
