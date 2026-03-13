import { Feather } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";

import Button from "./Button";

// ─── Props ─── //

interface EmptyStateProps {
  icon: keyof typeof Feather.glyphMap;
  title: string;
  subtitle?: string;
  /** optional CTA button label */
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <View
      className={`flex-1 items-center justify-center px-8 py-12 ${className}`}
    >
      {/* icon circle */}
      <View className="w-24 h-24 rounded-full bg-accent-light items-center justify-center mb-6">
        <Feather name={icon} size={40} color="#14532D" />
      </View>

      <Text className="text-xl font-bold text-text text-center mb-2">
        {title}
      </Text>

      {subtitle ? (
        <Text className="text-sm text-muted text-center leading-5 mb-6">
          {subtitle}
        </Text>
      ) : null}

      {/* optional CTA */}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="primary"
          size="md"
          onPress={onAction}
          className="mt-2 px-8"
        />
      ) : null}
    </View>
  );
}
