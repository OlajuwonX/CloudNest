import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { formatDate, formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";

interface FileCardProps {
  file: FileItem;
  viewMode: "list" | "grid";
  onPress: () => void;
  onLongPress?: () => void;
}

const ICON_CONFIG = {
  image: { icon: "image" as const, color: "#3B82F6", bg: "#EFF6FF" },
  video: { icon: "video" as const, color: "#8B5CF6", bg: "#F5F3FF" },
  document: { icon: "file-text" as const, color: "#F97316", bg: "#FFF7ED" },
  other: { icon: "file-plus" as const, color: "#6B7280", bg: "#F3F4F6" },
};

export default function FileCard({
  file,
  viewMode,
  onPress,
  onLongPress,
}: FileCardProps) {
  // fall back to "other" config for any unexpected category value
  const config = ICON_CONFIG[file.category] ?? ICON_CONFIG.other;

  // to give haptic feedback so the user feels something happened before the action sheet or context menu opens.
  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLongPress?.();
  };

  // horizontal row
  if (viewMode === "list") {
    return (
      <TouchableOpacity
        onPress={onPress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        className="flex-row items-center py-3 px-4 border-b border-border bg-surface"
      >
        <View
          className="w-11 h-11 rounded-full items-center justify-center mr-3 shrink-0"
          style={{ backgroundColor: config.bg }}
        >
          <Feather name={config.icon} size={20} color={config.color} />
        </View>

        <View className="flex-1">
          <Text className="text-text font-medium text-sm" numberOfLines={1}>
            {file.name}
          </Text>
          <Text className="text-muted text-xs mt-0.5">
            {formatFileSize(file.size)} · {formatDate(file.$createdAt)}
          </Text>
        </View>

        <Feather name="more-vertical" size={18} color="#6B7280" />
      </TouchableOpacity>
    );
  }

  // grid mode
  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      className="flex-1 m-1.5 rounded-xl bg-surface overflow-hidden"
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      <View
        className="w-full items-center justify-center"
        style={{ height: 110, backgroundColor: config.bg }}
      >
        {file.category === "image" ? (
          <Image
            source={{ uri: file.storageFileId }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
        ) : (
          <Feather name={config.icon} size={40} color={config.color} />
        )}
      </View>

      <View className="px-2.5 py-2">
        <Text className="text-text text-xs font-medium" numberOfLines={1}>
          {file.name}
        </Text>
        <Text className="text-muted text-xs mt-0.5">
          {formatFileSize(file.size)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// numberOfLines={1} truncates long filenames with "…"
// so the row never wraps to a second line.

// more-vertical 3-dot menu icon — tapping the whole row triggers onPress,
// the parent screen handles long-press for the action sheet

//            * expo-image is preferred over RN's built-in Image because it:
//            * - Caches aggressively (memory + disk)
//            * - Supports smooth transitions (transition={200})
//            * - Handles loading/error states internally
//            *
//            * NOTE: in the real integration, replace `storageFileId` with the
//            * actual Appwrite preview URL from storage.getFilePreview(...).

// for cross-platform shadow styles: elevation for Android, shadow* for iOS
