import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface RenameModalProps {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
}

export default function RenameModal({
  visible,
  currentName,
  onClose,
  onRename,
}: RenameModalProps) {
  const [value, setValue] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible) setValue(currentName);
  }, [visible, currentName]);

  const trimmed = value.trim();
  const canSave =
    trimmed.length > 0 && trimmed !== currentName && trimmed.length <= 255;

  const handleSave = async () => {
    if (!canSave) return;
    setIsSaving(true);
    try {
      await onRename(trimmed);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-6"
          onPress={onClose}
        >
          <Pressable
            className="w-full bg-surface rounded-2xl p-5"
            onPress={() => {}}
          >
            <Text className="text-xl font-bold text-text mb-1">
              Rename File
            </Text>
            <Text className="text-sm text-muted mb-4">
              Enter a new name for this file.
            </Text>

            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="File name"
              placeholderTextColor="#9CA3AF"
              autoFocus
              maxLength={255}
              returnKeyType="done"
              onSubmitEditing={handleSave}
              className="border border-border rounded-xl px-4 py-3 text-[16px] text-text bg-background"
            />

            {trimmed.length > 200 && (
              <Text className="text-xs text-muted mt-1 text-right">
                {trimmed.length}/255
              </Text>
            )}

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={onClose}
                disabled={isSaving}
                className="flex-1 py-3 rounded-xl border border-border items-center"
                activeOpacity={0.7}
              >
                <Text className="text-[16px] font-medium text-muted">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleSave}
                disabled={!canSave || isSaving}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
                activeOpacity={canSave && !isSaving ? 0.8 : 1}
                style={{ opacity: canSave && !isSaving ? 1 : 0.45 }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-[16px] font-semibold text-white">
                    Rename
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
