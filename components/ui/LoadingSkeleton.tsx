import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import type { SkeletonVariant } from "@/types";

// ─── Shimmer block ──── //

function ShimmerBlock({ className = "" }: { className?: string }) {
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.3, { duration: 700 }),
        withTiming(1, { duration: 700 }),
      ),
      -1, // infinite
      true, // reverse
    );
    // clean up function to cancel the infinite animation when the skeleton unmounts
    return () => cancelAnimation(opacity);
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={animStyle}
      className={`bg-border rounded-lg ${className}`}
    />
  );
}

function ListItemSkeleton() {
  return (
    <View className="flex-row items-center gap-3 px-4 py-3">
      {/* avatar circle */}
      <ShimmerBlock className="w-12 h-12 rounded-full" />

      {/* two text lines */}
      <View className="flex-1 gap-2">
        <ShimmerBlock className="h-4 w-3/4" />
        <ShimmerBlock className="h-3 w-1/2" />
      </View>
    </View>
  );
}

function CardSkeleton() {
  return (
    <View className="mx-4 mb-3 rounded-xl overflow-hidden">
      <ShimmerBlock className="w-full h-32 rounded-xl" />
      <View className="mt-2 gap-2 px-1">
        <ShimmerBlock className="h-4 w-3/4" />
        <ShimmerBlock className="h-3 w-1/3" />
      </View>
    </View>
  );
}

function AvatarSkeleton() {
  return <ShimmerBlock className="w-12 h-12 rounded-full" />;
}

function TextSkeleton() {
  return (
    <View className="gap-2 px-4">
      <ShimmerBlock className="h-4 w-full" />
      <ShimmerBlock className="h-4 w-5/6" />
      <ShimmerBlock className="h-4 w-2/3" />
    </View>
  );
}

// ─── Props ─── //

interface LoadingSkeletonProps {
  variant?: SkeletonVariant;
  /** skeleton counts — defaults to 3 **/
  count?: number;
  className?: string;
}

export default function LoadingSkeleton({
  variant = "list-item",
  count = 3,
  className = "",
}: LoadingSkeletonProps) {
  const renderItem = (index: number) => {
    switch (variant) {
      case "card":
        return <CardSkeleton key={index} />;
      case "avatar":
        return <AvatarSkeleton key={index} />;
      case "text":
        return <TextSkeleton key={index} />;
      case "list-item":
      default:
        return <ListItemSkeleton key={index} />;
    }
  };

  return (
    <View className={className}>
      {Array.from({ length: count }, (_, i) => renderItem(i))}
    </View>
  );
}
