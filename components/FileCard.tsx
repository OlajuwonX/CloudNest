import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { storage } from "@/lib/appwrite";
import { formatDate, formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";

const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

interface FileCardProps {
  file: FileItem;
  viewMode: "list" | "grid";
  onPress: () => void;
  onLongPress?: () => void;
  onMenuPress?: () => void;
  jwt?: string;
  isCached?: boolean;
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
  onMenuPress,
  jwt,
  isCached = false,
}: FileCardProps) {
  const config = ICON_CONFIG[file.category] ?? ICON_CONFIG.other;

  const thumbnailUrl =
    jwt && (file.category === "image" || file.category === "video")
      ? `${storage.getFilePreviewURL(BUCKET_ID, file.storageFileId).href}&jwt=${jwt}`
      : null;

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onLongPress?.();
  };

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMenuPress?.();
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
          className="w-11 h-11 rounded-full items-center justify-center mr-3 shrink-0 overflow-hidden"
          style={{ backgroundColor: config.bg }}
        >
          {thumbnailUrl ? (
            <Image
              source={{ uri: thumbnailUrl }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
            />
          ) : (
            <Feather name={config.icon} size={20} color={config.color} />
          )}
        </View>

        <View className="flex-1">
          <Text className="text-text font-medium text-sm" numberOfLines={1}>
            {file.fileName}
          </Text>
          <View className="flex-row items-center gap-1.5 mt-0.5">
            <Text className="text-muted text-xs">
              {formatFileSize(file.fileSize)} · {formatDate(file.$createdAt)}
            </Text>
            {isCached && (
              <Feather name="check-circle" size={11} color="#16A34A" />
            )}
          </View>
        </View>

        <TouchableOpacity
          onPress={handleMenuPress}
          hitSlop={10}
          activeOpacity={0.6}
        >
          <Feather name="more-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

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
        {isCached && (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              zIndex: 1,
              backgroundColor: "#16A34A",
              borderRadius: 10,
              width: 18,
              height: 18,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather name="check" size={10} color="#fff" />
          </View>
        )}
        {thumbnailUrl ? (
          <>
            <Image
              source={{ uri: thumbnailUrl }}
              contentFit="cover"
              style={{ width: "100%", height: "100%" }}
              transition={200}
            />
            {file.category === "video" && (
              <View
                style={{
                  position: "absolute",
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: "rgba(0,0,0,0.55)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Feather
                  name="play"
                  size={14}
                  color="#fff"
                  style={{ marginLeft: 2 }}
                />
              </View>
            )}
          </>
        ) : (
          <Feather name={config.icon} size={40} color={config.color} />
        )}
      </View>

      <View className="px-2.5 py-2 flex-row items-center">
        <View className="flex-1">
          <Text className="text-text text-xs font-medium" numberOfLines={1}>
            {file.fileName}
          </Text>
          <Text className="text-muted text-xs mt-0.5">
            {formatFileSize(file.fileSize)}
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleMenuPress}
          hitSlop={8}
          activeOpacity={0.6}
        >
          <Feather name="more-vertical" size={16} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
