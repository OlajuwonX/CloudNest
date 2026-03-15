import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

// ─── Props ─── //

interface ProgressBarProps {
  /** from 0 and 100 */
  progress: number;
  /** fill colour — defaults to primary (#14532D) */
  color?: string;
  /** track (background) colour — defaults to border (#E5E7EB) */
  trackColor?: string;
  /** bar height in pixels — defaults to 8 */
  height?: number;
  /** extra  classes on the outer wrapper */
  className?: string;
  /** animation duration in ms — defaults to 400 */
  duration?: number;
}

export default function ProgressBar({
  progress,
  color = "#14532D",
  trackColor = "#E5E7EB",
  height = 8,
  className = "",
  duration = 400,
}: ProgressBarProps) {
  // clamp progress to 0–100
  const clamped = Math.min(100, Math.max(0, progress));

  const width = useSharedValue(0);

  useEffect(() => {
    width.value = withTiming(clamped, { duration });
    // clean up function that cancels an in-flight animation to avoid memeory leaks.
    return () => cancelAnimation(width);
  }, [clamped, duration, width]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View
      className={`w-full overflow-hidden rounded-full ${className}`}
      style={{ height, backgroundColor: trackColor }}
    >
      <Animated.View
        style={[
          {
            height,
            backgroundColor: color,
            borderRadius: height,
          },
          animatedStyle,
        ]}
      />
    </View>
  );
}
