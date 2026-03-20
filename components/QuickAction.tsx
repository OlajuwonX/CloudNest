import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  iconColor: string;
  bgColor: string;
  onPress: () => void;
}

export default function QuickAction({
  icon,
  label,
  iconColor,
  bgColor,
  onPress,
}: QuickActionProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="w-20 items-center"
    >
      <View
        className="w-14 h-14 rounded-full items-center justify-center mb-2"
        style={{ backgroundColor: bgColor }}
      >
        <Feather name={icon} size={24} color={iconColor} />
      </View>

      <Text className="text-xs text-muted text-center">{label}</Text>
    </TouchableOpacity>
  );
}

// QuickAction renders a small vertical card used in the Home screen's horizontal scroll row.
// It triggers a light haptic when tapped so the interaction feels responsive
// even before the navigation animation starts.

// handlePress() -> ImpactFeedbackStyle.Light produces a subtle "tick" vibration.
// This is the same feedback used on iOS system buttons.
// On Android it maps to a short vibration via Vibrator API.
