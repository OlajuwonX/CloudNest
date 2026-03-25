import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { File, Paths } from "expo-file-system";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import FileActionSheet from "@/components/FileActionSheet";
import FileCard from "@/components/FileCard";
import FileDetailsModal from "@/components/FileDetailsModal";
import FilterSheet from "@/components/FilterSheet";
import RenameModal from "@/components/RenameModal";
import { EmptyState, LoadingSkeleton } from "@/components/ui";
import { account, databases, storage } from "@/lib/appwrite";
import { fileKeys, getFiles } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";
import type { FileItem, FilterOptions } from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

export default function FilesScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [filter, setFilter] = useState<FilterOptions>({
    category: null,
    sortBy: "newest",
  });
  const [filterVisible, setFilterVisible] = useState(false);
  const [actionFile, setActionFile] = useState<FileItem | null>(null);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [jwt, setJwt] = useState<string | undefined>(undefined);

  useEffect(() => {
    account.createJWT().then(({ jwt: token }) => setJwt(token)).catch(() => {});
  }, []);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: fileKeys.list(user?.$id ?? "", filter),
    queryFn: ({ pageParam }) =>
      getFiles(user!.$id, filter.category, filter.sortBy, pageParam),
    initialPageParam: undefined as string | undefined,

    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;
      const allFiles = allPages.flatMap((p) => p.files);
      return allFiles[allFiles.length - 1]?.$id;
    },
    enabled: !!user,
  });

  // Flatten all pages into a single array for the FlashList.
  const files = data?.pages.flatMap((p) => p.files) ?? [];

  // Pull-to-refresh: invalidate this query so React Query refetches from page 1.
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleApplyFilter = (opts: FilterOptions) => {
    setFilter(opts);
    setFilterVisible(false);
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
        new File(Paths.document, file.fileName),
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
    setRenameFile(file);
  };

  const handleConfirmRename = async (newName: string) => {
    if (!renameFile) return;
    try {
      await databases.updateDocument(DB_ID, FILES_TABLE_ID, renameFile.$id, {
        fileName: newName,
      });
      await queryClient.invalidateQueries({ queryKey: fileKeys.all });
      toast.success("File renamed");
    } catch {
      toast.error("Rename failed");
    }
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

      await queryClient.invalidateQueries({ queryKey: fileKeys.all });
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
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          contentContainerStyle={{
            padding: viewMode === "grid" ? 4 : 0,
            paddingBottom: 96,
          }}
          renderItem={({ item }) => (
            <FileCard
              file={item}
              viewMode={viewMode}
              jwt={jwt}
              onPress={() =>
                router.push(`/(protected)/file/${item.$id}` as any)
              }
              onLongPress={() => setActionFile(item)}
              onMenuPress={() => setActionFile(item)}
            />
          )}
          ListFooterComponent={
            isFetchingNextPage ? (
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
        onDetails={(f) => setDetailsFile(f)}
        onDelete={handleDelete}
      />

      <RenameModal
        visible={renameFile !== null}
        currentName={renameFile?.fileName ?? ""}
        onClose={() => setRenameFile(null)}
        onRename={handleConfirmRename}
      />

      <FileDetailsModal
        visible={detailsFile !== null}
        file={detailsFile}
        onClose={() => setDetailsFile(null)}
      />
    </SafeAreaView>
  );
}

// useInfiniteQuery vs useQuery:
// useQuery is for a single fetch. useInfiniteQuery is for paginated data where
// you load more results by appending pages. Each page has its own cursor.

// why invalidateQueries after delete/rename instead of optimistic update?
// invalidating is simpler and guarantees the UI reflects what's actually in
// the database. Optimistic updates are faster but require rollback logic on error.

// alert.prompt is iOS-only. On Android it's undefined, so we check first.
// a proper cross-platform solution would use a custom TextInput modal,
// but that's deferred to a future iteration.

// useInfiniteQuery handles cursor-based pagination.
// each "page" is one call to getFiles() with the cursor from the previous page.
// pageParam starts as undefined (no cursor = first page).

// getNextPageParam tells React Query what cursor to use for the next page.
// it looks at the last item in the last fetched page. If hasMore is false,
// returning undefined signals that there are no more pages to fetch.

// invalidating fileKeys.all refreshes both this list AND the home screen's
// recent files + storage stats in one call.

// onEndReached fires when the user scrolls near the bottom.
// fetchNextPage() loads the next cursor page and appends it to the cache.
