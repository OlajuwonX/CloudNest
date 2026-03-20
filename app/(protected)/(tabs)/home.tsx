import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
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

import FileCard from "@/components/FileCard";
import QuickAction from "@/components/QuickAction";
import StorageCard from "@/components/StorageCard";
import { Avatar, EmptyState, LoadingSkeleton } from "@/components/ui";

import { useAuthStore } from "@/stores/authStore";
import { useFileStore } from "@/stores/fileStore";

import { formatCurrentDate } from "@/lib/utils";

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
  const recentFiles = useFileStore((s) => s.recentFiles);
  const storageUsed = useFileStore((s) => s.storageUsed);
  const storageBreakdown = useFileStore((s) => s.storageBreakdown);
  const isLoading = useFileStore((s) => s.isLoading);
  const fetchRecentFiles = useFileStore((s) => s.fetchRecentFiles);
  const fetchStorageStats = useFileStore((s) => s.fetchStorageStats);

  // ── Pull-to-refresh state ──
  const [refreshing, setRefreshing] = useState(false);

  // ── Data fetching ──
  const loadData = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      fetchRecentFiles(user.$id),
      fetchStorageStats(user.$id),
    ]);
  }, [user, fetchRecentFiles, fetchStorageStats]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, [loadData]);

  // ── Derived values ──
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
          {/* Section header row */}
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
                  onLongPress={() => {
                    // long-press will open FileActionSheet (built in Phase 4)
                  }}
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

// ── Auth state ── //
// useAuthStore() -> is a Zustand hook. Calling it here subscribes this component
// to changes in the auth slice — if user logs out, this component re-renders.

// ── File store state  ── //
// useFileStore() -> we use individual selectors (one per value) so the component only re-renders
// when the specific slice it reads actually changes, rather than re-rendering on any store update.

// reloadData() -> loadData fetches both recent files and storage stats in parallel.
// Promise.all runs both requests simultaneously — faster than awaiting them one-by-one
// because neither call depends on the other's result.  useCallback memoises the function.
// Without it, a new function reference would be created on every render, causing the useEffect
// below to fire in an infinite loop (since loadData is listed as a dependency)
