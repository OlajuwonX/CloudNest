import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FileCard from "@/components/FileCard";
import QuickAction from "@/components/QuickAction";
import StorageCard from "@/components/StorageCard";
import { Avatar, EmptyState, LoadingSkeleton } from "@/components/ui";

import { fileKeys, getRecentFiles, getStorageStats } from "@/lib/queries";
import { formatCurrentDate } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";

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

  const { data: recentFiles = [], isLoading: isLoadingFiles } = useQuery({
    queryKey: fileKeys.recent(user?.$id ?? ""),
    queryFn: () => getRecentFiles(user!.$id),
    enabled: !!user,
  });

  // Separate query for storage stats — independent cache entry.
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
                  onPress={() => router.push(`/file/${file.$id}` as any)}
                  onLongPress={() => {}}
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
    </SafeAreaView>
  );
}

// useQuery replaces the old Zustand fileStore for server data.
// React Query manages loading state, caching, and background refetches automatically.
// The queryKey is an array — React Query uses it as a cache key.
// Including userId means each user gets their own isolated cache entry.

// useQuery fetches and caches the 5 most recent files.
// queryKey includes userId so different users never share cached data.
// enabled: !!user prevents the query from running before auth is ready.

// invalidateQueries({ queryKey: fileKeys.all }) marks every query whose key
// starts with ["files"] as stale. React Query then refetches them in the background.
// This is how the home screen stays in sync after an upload or delete.

// pull-to-refresh: invalidating fileKeys.all marks both the recent files
// and storage queries as stale, which causes React Query to refetch them.
