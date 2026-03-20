import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

import FileActionSheet from "@/components/FileActionSheet";
import FileCard from "@/components/FileCard";
import FilterSheet from "@/components/FilterSheet";
import { EmptyState, LoadingSkeleton } from "@/components/ui";
import { databases, storage } from "@/lib/appwrite";
import { useAuthStore } from "@/stores/authStore";
import type {
  FileCategory,
  FileItem,
  FilterOptions,
  SortOption,
} from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

const PAGE_SIZE = 20;

function buildQueries(
  userId: string,
  category: FileCategory | null,
  sortBy: SortOption,
  cursorId?: string,
): string[] {
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
      queries.push(Query.orderDesc("size"));
      break;
    case "name":
      queries.push(Query.orderAsc("name"));
      break;
  }

  if (cursorId) queries.push(Query.cursorAfter(cursorId));

  return queries;
}

export default function FilesScreen() {
  const user = useAuthStore((s) => s.user);

  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const lastCursorId = useRef<string | undefined>(undefined);

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filter, setFilter] = useState<FilterOptions>({
    category: null,
    sortBy: "newest",
  });

  const [filterVisible, setFilterVisible] = useState(false);
  const [actionFile, setActionFile] = useState<FileItem | null>(null);

  const fetchFiles = useCallback(
    async (opts: FilterOptions) => {
      if (!user) return;
      setIsLoading(true);
      try {
        const queries = buildQueries(user.$id, opts.category, opts.sortBy);
        const res = await databases.listDocuments({
          databaseId: DB_ID,
          collectionId: FILES_TABLE_ID,
          queries,
        });
        const docs = res.documents as unknown as FileItem[];
        setFiles(docs);
        lastCursorId.current =
          docs.length > 0 ? docs[docs.length - 1].$id : undefined;
        setHasMore(docs.length === PAGE_SIZE);
      } catch (err) {
        console.error("[files] fetchFiles error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [user],
  );

  const fetchMore = useCallback(async () => {
    if (!user || isLoadingMore || !hasMore || !lastCursorId.current) return;
    setIsLoadingMore(true);
    try {
      const queries = buildQueries(
        user.$id,
        filter.category,
        filter.sortBy,
        lastCursorId.current,
      );
      const res = await databases.listDocuments({
        databaseId: DB_ID,
        collectionId: FILES_TABLE_ID,
        queries,
      });
      const docs = res.documents as unknown as FileItem[];
      setFiles((prev) => [...prev, ...docs]);
      if (docs.length > 0) lastCursorId.current = docs[docs.length - 1].$id;
      setHasMore(docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("[files] fetchMore error:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [user, filter, isLoadingMore, hasMore]);

  useEffect(() => {
    fetchFiles(filter);
  }, [fetchFiles, filter]);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    lastCursorId.current = undefined;
    await fetchFiles(filter);
    setRefreshing(false);
  }, [fetchFiles, filter]);

  const handleApplyFilter = (opts: FilterOptions) => {
    lastCursorId.current = undefined;
    setFilter(opts); // triggers the useEffect → fetchFiles
  };

  const handleDownload = async (file: FileItem) => {
    try {
      const url = storage.getFileDownloadURL(
        BUCKET_ID,
        file.storageFileId,
      ).href;
      toast.loading("Downloading…");

      const localFile = await File.downloadFileAsync(
        url,
        new File(Paths.document, file.name),
      );
      toast.dismiss();
      await Sharing.shareAsync(localFile.uri);
      toast.success("File downloaded");
    } catch {
      toast.dismiss();
      toast.error("Download failed");
    }
  };

  const handleRename = (file: FileItem) => {
    Alert.prompt?.(
      "Rename File",
      "Enter a new name",
      async (newName) => {
        if (!newName?.trim() || newName.trim() === file.name) return;
        try {
          await databases.updateDocument({
            databaseId: DB_ID,
            collectionId: FILES_TABLE_ID,
            documentId: file.$id,
            data: { name: newName.trim() },
          });
          // optimistic update: update local state immediately instead of refetching
          setFiles((prev) =>
            prev.map((f) =>
              f.$id === file.$id ? { ...f, name: newName.trim() } : f,
            ),
          );
          toast.success("File renamed");
        } catch {
          toast.error("Rename failed");
        }
      },
      "plain-text",
      file.name,
    );
  };

  const handleDelete = async (file: FileItem) => {
    try {
      await storage.deleteFile({
        bucketId: BUCKET_ID,
        fileId: file.storageFileId,
      });
      await databases.deleteDocument({
        databaseId: DB_ID,
        collectionId: FILES_TABLE_ID,
        documentId: file.$id,
      });
      setFiles((prev) => prev.filter((f) => f.$id !== file.$id));
      toast.success("File deleted");
    } catch {
      toast.error("Delete failed");
    }
  };

  const hasActiveFilter =
    filter.category !== null || filter.sortBy !== "newest";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center justify-between px-5 py-3 border-b border-border bg-surface">
        <Text className="text-xl font-semibold text-text">My Files</Text>

        <View className="flex-row items-center gap-4">
          <TouchableOpacity onPress={() => router.push("/search" as any)}>
            <Feather name="search" size={22} color="#374151" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setFilterVisible(true)}>
            <Feather
              name="sliders"
              size={22}
              color={hasActiveFilter ? "#14532D" : "#374151"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() =>
              setViewMode((prev) => (prev === "list" ? "grid" : "list"))
            }
          >
            <Feather
              name={viewMode === "list" ? "grid" : "list"}
              size={22}
              color="#374151"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Active filter chips ── */}
      {hasActiveFilter && (
        <View className="flex-row flex-wrap gap-2 px-5 py-2 bg-surface border-b border-border">
          {filter.category && (
            <TouchableOpacity
              onPress={() => handleApplyFilter({ ...filter, category: null })}
              className="flex-row items-center gap-1 bg-primary px-3 py-1 rounded-full"
            >
              <Text className="text-xs text-white font-medium capitalize">
                {filter.category}s
              </Text>
              <Feather name="x" size={12} color="#ffffff" />
            </TouchableOpacity>
          )}
          {filter.sortBy !== "newest" && (
            <TouchableOpacity
              onPress={() => handleApplyFilter({ ...filter, sortBy: "newest" })}
              className="flex-row items-center gap-1 bg-primary px-3 py-1 rounded-full"
            >
              <Text className="text-xs text-white font-medium">
                {filter.sortBy}
              </Text>
              <Feather name="x" size={12} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {isLoading ? (
        <LoadingSkeleton
          variant={viewMode === "grid" ? "card" : "list-item"}
          count={6}
        />
      ) : files.length === 0 ? (
        <EmptyState
          icon="cloud-off"
          title="No files yet"
          subtitle="Your uploaded files will appear here"
          actionLabel="Upload Files"
          onAction={() => router.push("/(protected)/(tabs)/upload")}
        />
      ) : (
        <FlashList
          key={viewMode}
          data={files}
          keyExtractor={(item) => item.$id}
          numColumns={viewMode === "grid" ? 2 : 1}
          onRefresh={onRefresh}
          refreshing={refreshing}
          onEndReached={fetchMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            padding: viewMode === "grid" ? 4 : 0,
            paddingBottom: 96,
          }}
          renderItem={({ item }) => (
            <FileCard
              file={item}
              viewMode={viewMode}
              onPress={() =>
                router.push(`/(protected)/file/${item.$id}` as any)
              }
              onLongPress={() => setActionFile(item)}
            />
          )}
          ListFooterComponent={
            isLoadingMore ? (
              <View className="py-4">
                <LoadingSkeleton
                  variant={viewMode === "grid" ? "card" : "list-item"}
                  count={2}
                />
              </View>
            ) : null
          }
        />
      )}

      <FilterSheet
        isVisible={filterVisible}
        onClose={() => setFilterVisible(false)}
        currentFilter={filter.category}
        currentSort={filter.sortBy}
        onApply={handleApplyFilter}
      />

      <FileActionSheet
        isVisible={actionFile !== null}
        onClose={() => setActionFile(null)}
        file={actionFile}
        onPreview={(f) => router.push(`/(protected)/file/${f.$id}` as any)}
        onDownload={handleDownload}
        onRename={handleRename}
        onDelete={handleDelete}
      />
    </SafeAreaView>
  );
}

//  fetchMore appends the next page onto the existing list.
//  Guard conditions prevent double-fetching (isLoadingMore) and
//  unnecessary requests when all pages have been consumed (!hasMore).

// File.downloadFileAsync() is the new expo-file-system API (v18+).
// It downloads to a File inside Paths.document (the app's persistent storage)
// and returns the File object whose .uri holds the local path for Sharing.

//   Alert.prompt is iOS-only. On Android it's undefined, so we check first.
//   A proper cross-platform solution would use a custom TextInput modal,
//   but that's deferred to a future iteration.
