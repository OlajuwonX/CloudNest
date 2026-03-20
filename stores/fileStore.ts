import { databases } from "@/lib/appwrite";
import type { FileItem, StorageBreakdown } from "@/types";
import { Query } from "react-native-appwrite";
import { create } from "zustand";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;

interface FileStore {
  // the 5 most recently uploaded files shown on the home dashboard
  recentFiles: FileItem[];

  // total bytes the user has used across all uploaded files
  storageUsed: number;

  // bytes broken down by category (images, videos, documents, others)
  storageBreakdown: StorageBreakdown;

  // true while either fetch call is in flight — drives skeleton/spinner UI
  isLoading: boolean;

  // fetches the 5 most recent files for a given user from Appwrite
  fetchRecentFiles: (userId: string) => Promise<void>;

  // fetches all files and tallies storage usage per category
  fetchStorageStats: (userId: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set) => ({
  // initial state
  recentFiles: [],
  storageUsed: 0,
  storageBreakdown: { images: 0, videos: 0, documents: 0, others: 0 },
  isLoading: false,

  fetchRecentFiles: async (userId: string) => {
    try {
      set({ isLoading: true });

      const response = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: FILES_TABLE_ID,
        queries: [
          Query.equal("userId", userId),
          Query.orderDesc("$createdAt"),
          Query.limit(5),
        ],
      });

      set({ recentFiles: response.documents as unknown as FileItem[] });
    } catch (error) {
      // log error but don't crash — the UI will show an empty state instead
      console.error("[fileStore] fetchRecentFiles error:", error);
    } finally {
      // always clear loading, even on error, so the UI doesn't get stuck
      set({ isLoading: false });
    }
  },

  fetchStorageStats: async (userId: string) => {
    try {
      const response = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: FILES_TABLE_ID,
        queries: [Query.equal("userId", userId), Query.limit(500)],
      });

      const files = response.documents as unknown as FileItem[];

      // tally bytes per category in a single pass through the array
      let images = 0,
        videos = 0,
        documents = 0,
        others = 0,
        total = 0;

      for (const file of files) {
        total += file.size;
        if (file.category === "image") images += file.size;
        else if (file.category === "video") videos += file.size;
        else if (file.category === "document") documents += file.size;
        else others += file.size;
      }

      set({
        storageUsed: total,
        storageBreakdown: { images, videos, documents, others },
      });
    } catch (error) {
      console.error("[fileStore] fetchStorageStats error:", error);
    }
  },
}));

// FileStore describes all the data and actions related to the user's files.
// zustand store combine state + actions in a single object (unlike Redux where
// you keep reducers, actions, and state separated). This keeps everything
// about "files" in one place, which is easier to reason about.

// fileStore.fetchRecentFiles

// appwrite Query API:
// - Query.equal('userId', userId)  → filters the rows where userId matches
// - Query.orderDesc('$createdAt')  → newest first ($createdAt is auto-set by Appwrite)
// - Query.limit(5)                 → only fetch 5 documents for the dashboard
// listDocuments returns a { documents: [], total: number } object.
// cast to `unknown` first then to `FileItem[]` because Appwrite's SDK
// returns `Models.Document[]` which doesn't know our custom attributes.

// fileStore.fetchStorageStats

// to calculate how much storage is used, we need ALL the user's files —
// not just the recent 5. We set a generous limit of 500.
// a more scalable approach (for future improvement) would be to store
// aggregate stats in a separate Appwrite document and update it on every
// upload/delete, avoiding a full scan here.
