import React, { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProgressBarProps {
  /** Value between 0 and 100 */
  progress: number
  /** Fill colour — defaults to primary (#14532D) */
  color?: string
  /** Track (background) colour — defaults to border (#E5E7EB) */
  trackColor?: string
  /** Bar height in pixels — defaults to 8 */
  height?: number
  /** Extra NativeWind classes on the outer wrapper */
  className?: string
  /** Animation duration in ms — defaults to 400 */
  duration?: number
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProgressBar({
  progress,
  color      = '#14532D',
  trackColor = '#E5E7EB',
  height     = 8,
  className  = '',
  duration   = 400,
}: ProgressBarProps) {
  // Clamp progress to 0–100
  const clamped = Math.min(100, Math.max(0, progress))

  const width = useSharedValue(0)

  useEffect(() => {
    width.value = withTiming(clamped, { duration })
  }, [clamped])

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }))

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
  )
}
