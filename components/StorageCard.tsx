import React from "react";
import { Text, View } from "react-native";

import ProgressBar from "@/components/ui/ProgressBar";
import { formatFileSize } from "@/lib/utils";
import type { StorageBreakdown } from "@/types";

const DEFAULT_TOTAL_BYTES = 5 * 1024 * 1024 * 1024;

function BreakdownRow({
  color,
  label,
  bytes,
}: {
  color: string;
  label: string;
  bytes: number;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <View
        className="w-2 h-2 rounded-full shrink-0"
        style={{ backgroundColor: color }}
      />
      <Text className="text-xs text-muted flex-1">{label}</Text>
      <Text className="text-xs text-text font-medium">
        {formatFileSize(bytes)}
      </Text>
    </View>
  );
}

interface StorageCardProps {
  // bytes currently used by user across all uploaded files
  used: number;
  // total storage quota in bytes — defaults to 5 GB
  total?: number;
  // per-category byte breakdown for the legend rows
  breakdown: StorageBreakdown;
}

export default function StorageCard({
  used,
  total = DEFAULT_TOTAL_BYTES,
  breakdown,
}: StorageCardProps) {
  const percent = Math.min(100, Math.round((used / total) * 100));

  const barColor =
    percent >= 90 ? "#DC2626" : percent >= 75 ? "#D97706" : "#14532D";

  return (
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
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-text font-semibold text-base">Storage</Text>

        <Text className="text-muted text-sm">
          {formatFileSize(used)} / {formatFileSize(total)}
        </Text>
      </View>

      <ProgressBar
        progress={percent}
        color={barColor}
        height={10}
        className="mb-4"
      />

      <View className="gap-2">
        <BreakdownRow color="#3B82F6" label="Images" bytes={breakdown.images} />
        <BreakdownRow color="#8B5CF6" label="Videos" bytes={breakdown.videos} />
        <BreakdownRow
          color="#F97316"
          label="Documents"
          bytes={breakdown.documents}
        />
      </View>
    </View>
  );
}

// BreakDown() is a single row inside the breakdown section. shows a coloured dot, a label ("Images") and a formatted byte count.
// formatFileSize converts raw bytes to "2.4 MB", "1.0 GB", etc. This shows how much space is used out of the total quota.
// progressBar is a reanimated component that smoothly animates. from 0 → percent when first rendered, giving a satisfying fill effect.
