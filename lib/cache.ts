import AsyncStorage from "@react-native-async-storage/async-storage";
import { File, Paths } from "expo-file-system";

const CACHE_KEY = "@cloudnest/cache_index";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface CacheEntry {
  localUri: string;
  cachedAt: string;
  sizeBytes: number;
  fileName: string;
}

export type CacheIndex = Record<string, CacheEntry>;

export async function getCacheIndex(): Promise<CacheIndex> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

async function saveCacheIndex(index: CacheIndex): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(index));
  } catch {}
}

export async function getCacheEntry(
  fileId: string,
): Promise<CacheEntry | null> {
  const index = await getCacheIndex();
  const entry = index[fileId];
  if (!entry) return null;
  try {
    const file = new File(entry.localUri);
    if (!file.exists) throw new Error("missing");
    return entry;
  } catch {
    // Stale pointer — clean up
    delete index[fileId];
    await saveCacheIndex(index);
    return null;
  }
}

export async function cacheFile(
  fileId: string,
  fileName: string,
  downloadUrl: string,
): Promise<string | null> {
  try {
    const ext = fileName.includes(".")
      ? fileName.slice(fileName.lastIndexOf("."))
      : "";
    const dest = new File(Paths.cache, `${fileId}${ext}`);
    const downloaded = await File.downloadFileAsync(downloadUrl, dest);

    let sizeBytes = 0;
    try {
      sizeBytes = downloaded.size;
    } catch {}

    const index = await getCacheIndex();
    index[fileId] = {
      localUri: downloaded.uri,
      cachedAt: new Date().toISOString(),
      sizeBytes,
      fileName,
    };
    await saveCacheIndex(index);
    return downloaded.uri;
  } catch {
    return null;
  }
}

export async function clearCache(): Promise<void> {
  const index = await getCacheIndex();
  for (const entry of Object.values(index)) {
    try {
      new File(entry.localUri).delete();
    } catch {}
  }
  await AsyncStorage.removeItem(CACHE_KEY);
}

export async function getCacheSizeAndCount(): Promise<{
  size: number;
  count: number;
}> {
  const index = await getCacheIndex();
  const entries = Object.values(index);
  return {
    size: entries.reduce((s, e) => s + e.sizeBytes, 0),
    count: entries.length,
  };
}

export async function purgeExpiredEntries(): Promise<void> {
  const index = await getCacheIndex();
  const cutoff = Date.now() - MAX_AGE_MS;
  let changed = false;
  for (const [id, entry] of Object.entries(index)) {
    if (new Date(entry.cachedAt).getTime() < cutoff) {
      try {
        new File(entry.localUri).delete();
      } catch {}
      delete index[id];
      changed = true;
    }
  }
  if (changed) await saveCacheIndex(index);
}

// getcahcheEntry() -> Returns a cache entry if the file is still on disk, or null if missing/stale.

// cacheFile() -> Downloads a file and writes it to the cache directory.
// returns the local file:// URI, or null on failure.

// purgeExpiredEntries() -> Removes entries older than MAX_AGE_MS and deletes their local files.
// Safe to call on every app launch.
