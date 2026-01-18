"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon, Video, X, Check } from "lucide-react";

interface FileUploaderProps {
  accept: "image" | "video";
  onFileSelect: (file: File) => void;
  onUrlReady?: (url: string) => void;
  uploading?: boolean;
  uploadProgress?: number;
  uploadedUrl?: string;
  label: string;
  description: string;
}

export function FileUploader({
  accept,
  onFileSelect,
  uploading = false,
  uploadProgress = 0,
  uploadedUrl,
  label,
  description,
}: FileUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const acceptTypes =
    accept === "image"
      ? "image/jpeg,image/png,image/webp,image/gif"
      : "video/mp4,video/quicktime,video/webm";

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        processFile(file);
      }
    },
    [accept]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        processFile(file);
      }
    },
    [accept]
  );

  const processFile = (file: File) => {
    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (accept === "image" && !isImage) {
      alert("Please select an image file");
      return;
    }
    if (accept === "video" && !isVideo) {
      alert("Please select a video file");
      return;
    }

    // Create preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setFileName(file.name);

    onFileSelect(file);
  };

  const clearFile = () => {
    setPreview(null);
    setFileName(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const Icon = accept === "image" ? ImageIcon : Video;

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-text-primary mb-2">
        {label}
      </label>

      <div
        className={`
          drop-zone relative rounded-xl p-6 cursor-pointer
          min-h-[200px] flex flex-col items-center justify-center
          ${isDragOver ? "drag-over" : ""}
          ${uploadedUrl ? "has-file" : ""}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept={acceptTypes}
          onChange={handleFileChange}
          className="hidden"
        />

        {preview ? (
          <div className="relative w-full">
            {accept === "image" ? (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-40 object-contain rounded-lg"
              />
            ) : (
              <video
                src={preview}
                className="w-full h-40 object-contain rounded-lg"
                controls={false}
                muted
                loop
                autoPlay
                playsInline
              />
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                clearFile();
              }}
              className="absolute top-2 right-2 p-1 bg-surface rounded-full hover:bg-primary transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <div className="w-full h-2 bg-surface rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-text-muted">
                    Uploading... {uploadProgress}%
                  </span>
                </div>
              </div>
            )}

            {uploadedUrl && !uploading && (
              <div className="absolute top-2 left-2 p-1 bg-green-500 rounded-full">
                <Check className="w-4 h-4 text-white" />
              </div>
            )}

            <p className="text-xs text-text-muted mt-2 text-center truncate">
              {fileName}
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-surface flex items-center justify-center mb-4">
              {uploading ? (
                <Upload className="w-8 h-8 text-primary animate-bounce" />
              ) : (
                <Icon className="w-8 h-8 text-text-muted" />
              )}
            </div>

            <p className="text-text-primary font-medium mb-1">
              {isDragOver ? "Drop it here!" : "Drag & drop or click to upload"}
            </p>
            <p className="text-text-muted text-sm text-center">{description}</p>
          </>
        )}
      </div>
    </div>
  );
}
