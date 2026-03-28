import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { fileKeys, getFiles } from "@/lib/queries";
import { formatFileSize } from "@/lib/utils";
import type { FileCategory, StorageBreakdown } from "@/types";

const DEFAULT_TOTAL_BYTES = 5 * 1024 * 1024 * 1024; // 5 GB

interface CategoryConfig {
  key: keyof StorageBreakdown;
  fileCategory: FileCategory;
  label: string;
  color: string;
}

const CATEGORIES: CategoryConfig[] = [
  { key: "images", fileCategory: "image", label: "Images", color: "#3B82F6" },
  { key: "videos", fileCategory: "video", label: "Videos", color: "#8B5CF6" },
  {
    key: "documents",
    fileCategory: "document",
    label: "Documents",
    color: "#F97316",
  },
  { key: "others", fileCategory: "other", label: "Others", color: "#6B7280" },
];

interface DrillDownSheet {
  key: keyof StorageBreakdown;
  fileCategory: FileCategory;
  label: string;
  color: string;
  bytes: number;
}

interface StorageAnalyticsCardProps {
  userId: string;
  used: number;
  total?: number;
  breakdown: StorageBreakdown;
}

export default function StorageAnalyticsCard({
  userId,
  used,
  total = DEFAULT_TOTAL_BYTES,
  breakdown,
}: StorageAnalyticsCardProps) {
  const [selected, setSelected] = useState<DrillDownSheet | null>(null);
  const [focusedKey, setFocusedKey] = useState<keyof StorageBreakdown | null>(
    null,
  );

  const activeCategories = CATEGORIES.filter((c) => breakdown[c.key] > 0);

  const pieData =
    activeCategories.length > 0
      ? activeCategories.map((c) => ({
          value: breakdown[c.key],
          color: focusedKey === c.key ? lighten(c.color) : c.color,
          focused: focusedKey === c.key,
          onPress: () => openDrillDown(c),
        }))
      : [{ value: 1, color: "#E5E7EB" }];

  const openDrillDown = (c: CategoryConfig) => {
    setSelected({ ...c, bytes: breakdown[c.key] });
    setFocusedKey(c.key);
  };

  const handleClose = useCallback(() => {
    setFocusedKey(null);
    setSelected(null);
  }, []);

  if (used === 0) {
    return (
      <View
        className="bg-surface rounded-2xl p-5 items-center gap-3"
        style={{
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text className="text-text font-semibold text-base self-start">
          Storage Overview
        </Text>
        <Feather name="cloud" size={40} color="#D1D5DB" />
        <Text className="text-muted text-sm text-center">
          No storage used yet.{"\n"}Upload your first file to get started.
        </Text>
      </View>
    );
  }

  return (
    <>
      <View
        className="bg-surface rounded-2xl p-5"
        style={{
          elevation: 2,
          shadowColor: "#000",
          shadowOpacity: 0.06,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        <Text className="text-text font-semibold text-base mb-4">
          Storage Overview
        </Text>

        <View className="flex-row items-center gap-5">
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <View
              style={{
                borderRadius: 12,
                backgroundColor: "#F9FAFB",
                padding: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PieChart
                data={pieData}
                donut
                radius={69}
                innerRadius={43}
                strokeWidth={1}
                strokeColor="#fff"
                animationDuration={600}
                isAnimated
                extraRadius={10}
                focusOnPress
                sectionAutoFocus
                centerLabelComponent={() => (
                  <View style={{ alignItems: "center" }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "700",
                        color: "#111827",
                      }}
                    >
                      {formatFileSize(used)}
                    </Text>
                    <Text
                      style={{ fontSize: 11, color: "#6B7280", marginTop: 1 }}
                    >
                      used
                    </Text>
                  </View>
                )}
              />
            </View>
          </View>

          <View className="flex-1 gap-2.5">
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.key}
                onPress={() => breakdown[c.key] > 0 && openDrillDown(c)}
                activeOpacity={breakdown[c.key] > 0 ? 0.7 : 1}
                className="flex-row items-center gap-2"
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: breakdown[c.key] > 0 ? c.color : "#E5E7EB",
                  }}
                />
                <Text
                  className="flex-1 text-xs"
                  style={{
                    color: breakdown[c.key] > 0 ? "#374151" : "#D1D5DB",
                  }}
                >
                  {c.label}
                </Text>
                <Text
                  className="text-xs font-medium"
                  style={{
                    color: breakdown[c.key] > 0 ? "#111827" : "#D1D5DB",
                  }}
                >
                  {formatFileSize(breakdown[c.key])}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text
          className="text-xs text-muted text-center mt-4"
          style={{ lineHeight: 16 }}
        >
          {formatFileSize(used)} of {formatFileSize(total)} used
        </Text>
      </View>

      <DrillDownModal
        item={selected}
        userId={userId}
        onClose={handleClose}
      />
    </>
  );
}

interface DrillDownModalProps {
  item: DrillDownSheet | null;
  userId: string;
  onClose: () => void;
}

function DrillDownModal({ item, userId, onClose }: DrillDownModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={!!item}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={{ flex: 1 }}>
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
          onPress={onClose}
        />
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: "72%",
            paddingBottom: insets.bottom + 16,
          }}
        >
          {/* drag handle */}
          <View style={{ alignItems: "center", paddingTop: 12, paddingBottom: 4 }}>
            <View
              style={{
                width: 40,
                height: 4,
                borderRadius: 2,
                backgroundColor: "#E5E7EB",
              }}
            />
          </View>
          {item && (
            <DrillDownContent item={item} userId={userId} onClose={onClose} />
          )}
        </View>
      </View>
    </Modal>
  );
}

interface DrillDownContentProps {
  item: DrillDownSheet;
  userId: string;
  onClose: () => void;
}

function DrillDownContent({ item, userId }: DrillDownContentProps) {
  const { data, isLoading } = useQuery({
    queryKey: [...fileKeys.list(userId, { category: item.fileCategory, sortBy: "largest" }), "drilldown"],
    queryFn: () => getFiles(userId, item.fileCategory, "largest"),
    select: (res) => res.files.slice(0, 5),
    staleTime: 60_000,
  });

  const files = data ?? [];

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-row items-center gap-3 pt-4 pb-5 border-b border-border">
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: item.color + "20",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CategoryIcon category={item.key} color={item.color} />
        </View>
        <View>
          <Text className="text-lg font-bold text-text">{item.label}</Text>
          <Text className="text-xs text-muted mt-0.5">
            {formatFileSize(item.bytes)}
          </Text>
        </View>
      </View>

      <Text className="text-xs font-semibold text-muted uppercase tracking-wider mt-4 mb-3">
        Top Files
      </Text>

      {isLoading ? (
        <View style={{ paddingVertical: 24, alignItems: "center" }}>
          <ActivityIndicator color={item.color} />
        </View>
      ) : files.length === 0 ? (
        <Text className="text-sm text-muted text-center py-6">
          No files found
        </Text>
      ) : (
        files.map((f) => (
          <View
            key={f.$id}
            className="flex-row items-center py-3 border-b border-border"
          >
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                backgroundColor: item.color + "15",
                alignItems: "center",
                justifyContent: "center",
                marginRight: 12,
              }}
            >
              <CategoryIcon category={item.key} color={item.color} size={14} />
            </View>
            <Text className="flex-1 text-sm text-text" numberOfLines={1}>
              {f.fileName}
            </Text>
            <Text className="text-xs text-muted ml-2">
              {formatFileSize(f.fileSize)}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function CategoryIcon({
  category,
  color,
  size = 18,
}: {
  category: keyof StorageBreakdown;
  color: string;
  size?: number;
}) {
  const iconMap: Record<keyof StorageBreakdown, string> = {
    images: "image",
    videos: "video",
    documents: "file-text",
    others: "file",
  };
  return <Feather name={iconMap[category] as any} size={size} color={color} />;
}

// lighten a hex color by mixing with white for focused state.
function lighten(hex: string, amount = 0.35): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 0xff) * (1 - amount) + 255 * amount);
  const g = Math.round(((n >> 8) & 0xff) * (1 - amount) + 255 * amount);
  const b = Math.round((n & 0xff) * (1 - amount) + 255 * amount);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
