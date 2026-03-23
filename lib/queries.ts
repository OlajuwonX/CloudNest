import { databases } from "@/lib/appwrite";
import type {
  FileCategory,
  FileItem,
  FilterOptions,
  StorageBreakdown,
} from "@/types";
import { Query } from "react-native-appwrite";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;

export const PAGE_SIZE = 20;

export const fileKeys = {
  all: ["files"] as const,
  recent: (userId: string) => ["files", "recent", userId] as const,
  storage: (userId: string) => ["files", "storage", userId] as const,
  list: (userId: string, filter: FilterOptions) =>
    ["files", "list", userId, filter] as const,
};

export const getRecentFiles = async (userId: string): Promise<FileItem[]> => {
  const response = await databases.listDocuments({
    databaseId: DB_ID,
    collectionId: FILES_TABLE_ID,
    queries: [
      Query.equal("userId", userId),
      Query.orderDesc("$createdAt"),
      Query.limit(5),
    ],
  });
  return response.documents as unknown as FileItem[];
};

export const getStorageStats = async (
  userId: string,
): Promise<{ total: number; breakdown: StorageBreakdown }> => {
  const response = await databases.listDocuments({
    databaseId: DB_ID,
    collectionId: FILES_TABLE_ID,
    queries: [Query.equal("userId", userId), Query.limit(500)],
  });

  const files = response.documents as unknown as FileItem[];
  let images = 0,
    videos = 0,
    documents = 0,
    others = 0,
    total = 0;

  for (const file of files) {
    total += file.fileSize;
    if (file.category === "image") images += file.fileSize;
    else if (file.category === "video") videos += file.fileSize;
    else if (file.category === "document") documents += file.fileSize;
    else others += file.fileSize;
  }

  return { total, breakdown: { images, videos, documents, others } };
};

// fetches one page of files for the files browser.
export const getFiles = async (
  userId: string,
  category: FileCategory | null,
  sortBy: FilterOptions["sortBy"],
  cursorId?: string,
): Promise<{ files: FileItem[]; hasMore: boolean }> => {
  const queries: string[] = [
    Query.equal("userId", userId),
    Query.limit(PAGE_SIZE),
  ];

  if (category) queries.push(Query.equal("category", category));

  switch (sortBy) {
    case "newest":
      queries.push(Query.orderDesc("$createdAt"));
      break;
    case "oldest":
      queries.push(Query.orderAsc("$createdAt"));
      break;
    case "largest":
      queries.push(Query.orderDesc("fileSize"));
      break;
    case "name":
      queries.push(Query.orderAsc("fileName"));
      break;
  }

  if (cursorId) queries.push(Query.cursorAfter(cursorId));

  const res = await databases.listDocuments({
    databaseId: DB_ID,
    collectionId: FILES_TABLE_ID,
    queries,
  });

  const files = res.documents as unknown as FileItem[];
  return { files, hasMore: files.length === PAGE_SIZE };
};

// getFiles() -> cursorId is the $id of the last item on the previous page — Appwrite's way
// of doing cursor-based pagination (equivalent to "give me items after this one").
