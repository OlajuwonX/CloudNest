import { Feather } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { TextInput } from 'react-native-paper'

// ─── Paper theme overrides to match CloudNest palette ────────────────────────

const paperTheme = {
  colors: {
    primary: '#14532D',          // focus ring & active label colour
    outline: '#E5E7EB',          // resting border colour
    onSurfaceVariant: '#6B7280', // floating label & placeholder colour
    error: '#DC2626',            // error border & label colour
    background: '#FFFFFF',
    surface: '#FFFFFF',
  },
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface InputProps {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder?: string
  error?: string              // Non-empty string shows the error message below
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoComplete?: string
  leftIcon?: keyof typeof Feather.glyphMap
  rightIcon?: keyof typeof Feather.glyphMap
  onRightIconPress?: () => void
  editable?: boolean
  multiline?: boolean
  numberOfLines?: number
  className?: string          // extra classes on the outer View wrapper
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  leftIcon,
  rightIcon,
  onRightIconPress,
  editable = true,
  multiline = false,
  numberOfLines,
  className = '',
}: InputProps) {
  const [isSecure, setIsSecure] = useState(secureTextEntry)

  // For password fields the eye icon always lives on the right side
  const showPasswordToggle = secureTextEntry

  return (
    <View className={`w-full ${className}`}>
      <TextInput
        label={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        mode="outlined"
        error={!!error}
        secureTextEntry={isSecure}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        editable={editable}
        multiline={multiline}
        numberOfLines={numberOfLines}
        outlineStyle={{ borderRadius: 12 }}
        contentStyle={{ backgroundColor: '#FFFFFF', fontFamily: 'Inter_400Regular' }}
        theme={paperTheme}

        // Left icon ─ rendered as a paper TextInput.Icon
        left={
          leftIcon ? (
            <TextInput.Icon
              icon={() => (
                <Feather name={leftIcon} size={18} color="#6B7280" />
              )}
            />
          ) : undefined
        }

        // Right icon ─ password toggle takes priority, then custom icon
        right={
          showPasswordToggle ? (
            <TextInput.Icon
              icon={() => (
                <TouchableOpacity onPress={() => setIsSecure((prev) => !prev)}>
                  <Feather
                    name={isSecure ? 'eye-off' : 'eye'}
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

      {/* Inline error message */}
      {!!error && (
        <Text className="text-danger text-xs mt-1 ml-1">{error}</Text>
      )}
    </View>
  )
}
