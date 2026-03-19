import type { FileCategory } from "@/types";

// ─── File Size Formatter ─── //

/**
 * Converts a raw byte count into a human-readable string.
 *
 * How it works:
 * - We find which unit to use by dividing Math.log(bytes) by Math.log(1024).
 *   Each step up the array (B → KB → MB → GB) is a factor of 1024.
 * - Math.floor gives us the index into the units array.
 * - We then divide bytes by 1024^i to get the scaled value.
 *
 * Examples: 1536 → "1.5 KB", 2621440 → "2.5 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  // Show no decimal for plain bytes; 1 decimal for KB and above
  return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// ─── File Category from MIME type ─── //

/**
 * Determines a file's category from its MIME type string.
 *
 * MIME types follow the pattern "type/subtype", e.g.:
 *   - "image/png"  → starts with "image/" → "image"
 *   - "video/mp4"  → starts with "video/" → "video"
 *   - "application/pdf" → contains "pdf"  → "document"
 *
 * Anything that doesn't match the known patterns falls back to "other".
 */
export function getFileCategory(mimeType: string): FileCategory {
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("video/")) return "video";
  if (
    mimeType.includes("pdf") ||
    mimeType.includes("word") ||
    mimeType.includes("document") ||
    mimeType.includes("sheet") ||
    mimeType.includes("text") ||
    mimeType.includes("excel") ||
    mimeType.includes("powerpoint")
  )
    return "document";
  return "other";
}

// ─── Date Formatter ─── //

/**
 * Formats an ISO 8601 date string (the format Appwrite returns for $createdAt)
 * into a short, readable label like "Mar 19" or "Yesterday".
 *
 * We use toLocaleDateString with specific options so it always renders
 * in a consistent, locale-aware format regardless of the device region.
 */
export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();

  // Check if the file was uploaded today — show "Today" for recency context
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();
  if (isToday) return "Today";

  // Check if uploaded yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();
  if (isYesterday) return "Yesterday";

  // For anything older, return a short date like "Mar 10"
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ─── Current Date Label ─── //

/**
 * Returns today's date formatted as "Monday, March 19" for the
 * home screen header subtitle.
 */
export function formatCurrentDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
