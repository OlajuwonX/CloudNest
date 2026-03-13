import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { TextInput } from "react-native-paper";

const paperTheme = {
  colors: {
    primary: "#14532D", // focus ring & active label colour
    outline: "#E5E7EB", // resting border colour
    onSurfaceVariant: "#6B7280", // floating label & placeholder colour
    error: "#DC2626", // error border & label colour
    background: "#FFFFFF",
    surface: "#FFFFFF",
  },
};

type AutoCompleteType =
  | "additional-name"
  | "address-line1"
  | "address-line2"
  | "birthdate-day"
  | "birthdate-full"
  | "birthdate-month"
  | "birthdate-year"
  | "cc-csc"
  | "cc-exp"
  | "cc-exp-day"
  | "cc-exp-month"
  | "cc-exp-year"
  | "cc-number"
  | "cc-name"
  | "cc-given-name"
  | "cc-middle-name"
  | "cc-family-name"
  | "cc-type"
  | "country"
  | "current-password"
  | "email"
  | "family-name"
  | "gender"
  | "given-name"
  | "honorific-prefix"
  | "honorific-suffix"
  | "name"
  | "name-family"
  | "name-given"
  | "name-middle"
  | "name-middle-initial"
  | "name-prefix"
  | "name-suffix"
  | "nickname"
  | "organization"
  | "organization-title"
  | "url"
  | "new-password"
  | "off"
  | "one-time-code"
  | "postal-code"
  | "street-address"
  | "tel"
  | "username"
  | "username-new"
  | "password"
  | "password-new"
  | "postal-address"
  | "postal-address-country"
  | "postal-address-extended"
  | "postal-address-extended-postal-code"
  | "postal-address-locality"
  | "postal-address-region"
  | "sms-otp"
  | "tel-country-code"
  | "tel-national"
  | "tel-device";

// ─── Props ─── //

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string; // non-empty string shows the error message below
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoComplete?: AutoCompleteType;
  leftIcon?: keyof typeof Feather.glyphMap;
  rightIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  mode?: "flat" | "outlined";
  editable?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  className?: string; // extra classes on the outer view wrapper
}

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  autoComplete,
  error,
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "sentences",
  leftIcon,
  rightIcon,
  onRightIconPress,
  mode = "outlined",
  editable = true,
  multiline = false,
  numberOfLines,
  className = "",
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  // eye icon for password fields
  const showPasswordToggle = secureTextEntry;

  return (
    <View className={`w-full ${className}`}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode={mode}
        autoComplete={autoComplete}
        error={!!error}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        outlineStyle={{ borderRadius: 12 }}
        contentStyle={{
          backgroundColor: "#FFFFFF",
          fontFamily: "Inter_400Regular",
        }}
        theme={paperTheme}
        // left icon ─ rendered as a paper TextInput.Icon
        left={
          leftIcon ? (
            <TextInput.Icon
              icon={() => <Feather name={leftIcon} size={18} color="#6B7280" />}
            />
          ) : undefined
        }
        // right icon ─ password toggle takes priority, then custom icon
        right={
          showPasswordToggle ? (
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity onPress={() => setIsSecure((prev) => !prev)}>
                  <Feather
                    name={isSecure ? "eye-off" : "eye"}
                    size={18}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              )}
            />
          ) : rightIcon ? (
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity onPress={onRightIconPress}>
                  <Feather name={rightIcon} size={18} color="#6B7280" />
                </TouchableOpacity>
              )}
            />
          ) : undefined
        }
      />

      {/* inline error message */}
      {!!error && (
        <Text className="text-danger text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  );
}
