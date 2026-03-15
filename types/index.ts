// ─── File Types ─── //

export type FileCategory = "image" | "video" | "document" | "other";

export interface FileItem {
  $id: string;
  $createdAt: string;
  userId: string;
  name: string;
  type: string; // MIME type e.g. "image/png", "application/pdf"
  category: FileCategory;
  size: number; // in bytes
  storageFileId: string;
}

export interface SelectedFile {
  uri: string;
  name: string;
  size: number;
  mimeType: string;
}

// ─── Storage Types ───── //

export interface StorageBreakdown {
  images: number;
  videos: number;
  documents: number;
  others: number;
}

// ─── filter/sort ──── //

export type SortOption = "newest" | "oldest" | "largest" | "name";

export interface FilterOptions {
  category: FileCategory | null;
  sortBy: SortOption;
}

// ─── Upload ──── //

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface UploadItem {
  file: SelectedFile;
  progress: number; // from 0–100
  status: UploadStatus;
  error?: string;
}

// ─── Auth ──── //

export interface AuthUser {
  $id: string;
  name: string;
  email: string;
  emailVerification: boolean;
  $createdAt: string;
}

// ─── prop helpers ──── //

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "danger"
  | "outline"
  | "ghost";
export type ButtonSize = "sm" | "md" | "lg";
export type AvatarSize = "sm" | "md" | "lg" | "xl";
export type SkeletonVariant = "card" | "list-item" | "avatar" | "text";
