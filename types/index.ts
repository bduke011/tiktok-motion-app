export interface UploadedFile {
  file: File;
  url: string;
  preview?: string;
}

export interface SubmitParams {
  image_url: string;
  video_url: string;
  prompt?: string;
  character_orientation: "image" | "video";
}

export interface StatusResponse {
  success: boolean;
  request_id: string;
  status: "QUEUED" | "IN_QUEUE" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  queue_position?: number;
  message?: string;
  video?: VideoResult;
}

export interface VideoResult {
  url: string;
  file_name: string;
  content_type: string;
  file_size: number;
}

export type GenerationStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "error";

export type CharacterOrientation = "image" | "video";
