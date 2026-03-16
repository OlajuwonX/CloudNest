import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

import type { ButtonSize, ButtonVariant } from "@/types";

const containerVariant: Record<ButtonVariant, string> = {
  primary: "bg-primary border border-primary",
  secondary: "bg-secondary border border-secondary",
  accent: "bg-accent border border-accent",
  danger: "bg-danger border border-danger",
  outline: "bg-transparent border-2 border-primary",
  ghost: "bg-transparent border border-transparent",
};

const textVariant: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-white",
  accent: "text-primary",
  danger: "text-white",
  outline: "text-primary",
  ghost: "text-primary",
};

const containerSize: Record<ButtonSize, string> = {
  sm: "px-4 py-2 rounded-lg",
  md: "px-5 py-3.5 rounded-xl",
  lg: "px-6 py-4 rounded-[40px]",
};

const textSize: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-base",
  lg: "text-xl",
};

const spinnerColor: Record<ButtonVariant, string> = {
  primary: "#ffffff",
  secondary: "#ffffff",
  accent: "#14532D",
  danger: "#ffffff",
  outline: "#14532D",
  ghost: "#14532D",
};

// ─── Props ─── //

interface ButtonProps extends Omit<TouchableOpacityProps, "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  hideSpinner?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export default function Button({
  title,
  variant = "primary",
  size = "lg",
  isLoading = false,
  disabled = false,
  hideSpinner = false,
  leftIcon,
  rightIcon,
  className = "",
  onPress,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const handlePress: TouchableOpacityProps["onPress"] = (e) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress?.(e);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      disabled={isDisabled}
      onPress={handlePress}
      className={`
        flex-row items-center justify-center gap-2
        ${containerVariant[variant]}
        ${containerSize[size]}
        ${isDisabled ? "opacity-50" : "opacity-100"}
        ${className}
      `}
      {...rest}
    >
      {/* left icon — hidden while loading */}
      {!isLoading && leftIcon && <View>{leftIcon}</View>}

      {/* spinner or title */}
      {!hideSpinner && isLoading ? (
        <ActivityIndicator size="small" color={spinnerColor[variant]} />
      ) : (
        <Text
          className={`font-semibold ${textVariant[variant]} ${textSize[size]}`}
        >
          {title}
        </Text>
      )}

      {/* right icon — hidden while loading */}
      {!isLoading && rightIcon && <View>{rightIcon}</View>}
    </TouchableOpacity>
  );
}
