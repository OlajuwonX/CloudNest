import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Clipboard from "expo-clipboard";
import { File, Paths } from "expo-file-system";
import * as MailComposer from "expo-mail-composer";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FileActionSheet from "@/components/FileActionSheet";
import FileCard from "@/components/FileCard";
import FileDetailsModal from "@/components/FileDetailsModal";
import QuickAction from "@/components/QuickAction";
import RenameModal from "@/components/RenameModal";
import StorageCard from "@/components/StorageCard";
import { Avatar, EmptyState, LoadingSkeleton } from "@/components/ui";
import { account, databases, storage } from "@/lib/appwrite";
import { type CacheIndex, getCacheIndex } from "@/lib/cache";
import { fileKeys, getRecentFiles, getStorageStats } from "@/lib/queries";
import { formatCurrentDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { FileItem } from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

const QUICK_ACTIONS = [
  {
    id: "photo",
    icon: "image" as const,
    label: "Photo",
    bgColor: "#EFF6FF",
    iconColor: "#3B82F6",
  },
  {
    id: "video",
    icon: "video" as const,
    label: "Video",
    bgColor: "#F5F3FF",
    iconColor: "#8B5CF6",
  },
  {
    id: "document",
    icon: "file-text" as const,
    label: "Document",
    bgColor: "#FFF7ED",
    iconColor: "#F97316",
  },
] as const;

export default function HomeScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [actionFile, setActionFile] = useState<FileItem | null>(null);
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [detailsFile, setDetailsFile] = useState<FileItem | null>(null);
  const [jwt, setJwt] = useState<string | undefined>(undefined);
  const [cacheIndex, setCacheIndex] = useState<CacheIndex>({});

  useEffect(() => {
    account
      .createJWT()
      .then(({ jwt: token }) => setJwt(token))
      .catch(() => {});
    getCacheIndex().then(setCacheIndex);
  }, []);

  const { data: recentFiles = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: fileKeys.recent(user?.$id ?? ""),
    queryFn: () => getRecentFiles(user!.$id),
    enabled: !!user,
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: fileKeys.storage(user?.$id ?? ""),
    queryFn: () => getStorageStats(user!.$id),
    enabled: !!user,
  });

  const isLoading = isLoadingFiles || isLoadingStats;
  const storageUsed = stats?.total ?? 0;
  const storageBreakdown = stats?.breakdown ?? {
    images: 0,
    videos: 0,
    documents: 0,
    others: 0,
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: fileKeys.all });
    setRefreshing(false);
  }, [queryClient]);

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

  const handleCopyLink = async (file: FileItem) => {
    try {
      const { jwt: linkJwt } = await account.createJWT();
      const url = `${storage.getFileViewURL(BUCKET_ID, file.storageFileId).href}&jwt=${linkJwt}`;
      await Clipboard.setStringAsync(url);
      toast.success("Link copied – expires in 15 min");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleShareEmail = async (file: FileItem) => {
    const available = await MailComposer.isAvailableAsync();
    if (!available) {
      toast.error("Email not available on this device");
      return;
    }
    try {
      toast.loading("Preparing…");
      const url = storage.getFileDownloadURL(BUCKET_ID, file.storageFileId).href;
      const localFile = await File.downloadFileAsync(
        url,
        new File(Paths.document, file.fileName),
      );
      toast.dismiss();
      await MailComposer.composeAsync({
        subject: `Shared file: ${file.fileName}`,
        body: "I'm sharing a file with you from CloudNest.",
        attachments: [localFile.uri],
      });
    } catch {
      toast.dismiss();
      toast.error("Failed to prepare email");
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

  const firstName = user?.name?.split(" ")[0] ?? "there";

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14532D"
          />
        }
      >
        <StatusBar
          barStyle="dark-content"
          translucent
          backgroundColor="transparent"
        />
        <View className="flex-row justify-between items-center px-5 pt-4">
          <View>
            <Text className="text-xl font-semibold text-text">
              Hello, {firstName} 👋
            </Text>
            <Text className="text-xs text-muted mt-0.5">
              {formatCurrentDate()}
            </Text>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/profile")}
            activeOpacity={0.8}
          >
            <Avatar name={user?.name ?? "User"} size="md" />
          </TouchableOpacity>
        </View>

        <View className="mx-5 mt-6">
          <StorageCard used={storageUsed} breakdown={storageBreakdown} />
        </View>

        <View className="mt-6">
          <Text className="text-lg font-semibold text-text px-5 mb-3">
            Quick Actions
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          >
            {QUICK_ACTIONS.map((action) => (
              <QuickAction
                key={action.id}
                icon={action.icon}
                label={action.label}
                bgColor={action.bgColor}
                iconColor={action.iconColor}
                onPress={() => router.push("/(protected)/(tabs)/upload")}
              />
            ))}
          </ScrollView>
        </View>

        <View className="mt-6 px-5">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-lg font-semibold text-text">
              Recent Files
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/(tabs)/files")}
              activeOpacity={0.7}
            >
              <Text className="text-sm text-primary font-medium">See All</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <LoadingSkeleton variant="list-item" count={3} />
          ) : recentFiles.length > 0 ? (
            <View className="rounded-xl overflow-hidden border border-border">
              {recentFiles.map((file) => (
                <FileCard
                  key={file.$id}
                  file={file}
                  viewMode="list"
                  onPress={() =>
                    router.push(`/(protected)/file/${file.$id}` as any)
                  }
                  jwt={jwt}
                  isCached={!!cacheIndex[file.storageFileId]}
                  onLongPress={() => setActionFile(file)}
                  onMenuPress={() => setActionFile(file)}
                />
              ))}
            </View>
          ) : (
            <EmptyState
              icon="upload-cloud"
              title="No files yet"
              subtitle="Upload your first file to get started"
              actionLabel="Upload Now"
              onAction={() => router.push("/(protected)/(tabs)/upload")}
            />
          )}
        </View>

        {!isLoading && recentFiles.length > 0 && (
          <TouchableOpacity
            onPress={() => router.push("/(protected)/(tabs)/files")}
            activeOpacity={0.7}
            className="mx-5 mt-4 flex-row items-center justify-center gap-2 py-3 rounded-xl border border-border bg-surface"
          >
            <Feather name="folder" size={16} color="#14532D" />
            <Text className="text-sm text-primary font-medium">
              Browse all files
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <FileActionSheet
        isVisible={actionFile !== null}
        onClose={() => setActionFile(null)}
        file={actionFile}
        onPreview={(f) => router.push(`/(protected)/file/${f.$id}` as any)}
        onDownload={handleDownload}
        onCopyLink={handleCopyLink}
        onShareEmail={handleShareEmail}
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
