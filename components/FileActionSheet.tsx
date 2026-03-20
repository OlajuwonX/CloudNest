import { Feather } from "@expo/vector-icons";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useEffect, useRef } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";

import { formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";

interface FileActionSheetProps {
  isVisible: boolean;
  onClose: () => void;
  file: FileItem | null;
  onPreview: (file: FileItem) => void;
  onDownload: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

interface ActionRow {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  danger?: boolean;
}

const ACTION_ROWS: ActionRow[] = [
  { id: "preview", icon: "external-link", label: "Open" },
  { id: "download", icon: "download", label: "Download" },
  { id: "rename", icon: "edit-2", label: "Rename" },
  { id: "delete", icon: "trash-2", label: "Delete", danger: true },
];

export default function FileActionSheet({
  isVisible,
  onClose,
  file,
  onPreview,
  onDownload,
  onRename,
  onDelete,
}: FileActionSheetProps) {
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (isVisible) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [isVisible]);

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const handleDelete = (f: FileItem) => {
    onClose();
    setTimeout(() => {
      Alert.alert(
        "Delete File",
        "This will permanently remove the file from your vault. This cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => onDelete(f),
          },
        ],
      );
    }, 300);
  };

  const handleAction = (actionId: string, f: FileItem) => {
    switch (actionId) {
      case "preview":
        onClose();
        onPreview(f);
        break;
      case "download":
        onClose();
        onDownload(f);
        break;
      case "rename":
        onClose();
        onRename(f);
        break;
      case "delete":
        handleDelete(f);
        break;
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      enablePanDownToClose
      onClose={onClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#FFFFFF" }}
      handleIndicatorStyle={{ backgroundColor: "#E5E7EB", width: 40 }}
      enableDynamicSizing
    >
      <BottomSheetView style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {file && (
          <View className="py-4 border-b border-border mb-2">
            <Text
              className="text-base font-semibold text-text"
              numberOfLines={1}
            >
              {file.name}
            </Text>
            <Text className="text-xs text-muted mt-0.5">
              {formatFileSize(file.size)} · {file.category}
            </Text>
          </View>
        )}

        {file &&
          ACTION_ROWS.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => handleAction(action.id, file)}
              className="flex-row items-center py-4 border-b border-border"
              activeOpacity={0.7}
            >
              <Feather
                name={action.icon}
                size={20}
                color={action.danger ? "#DC2626" : "#374151"}
              />

              <Text
                className={`flex-1 ml-4 text-base ${
                  action.danger ? "text-danger" : "text-text"
                }`}
              >
                {action.label}
              </Text>

              <Feather name="chevron-right" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          ))}
      </BottomSheetView>
    </BottomSheet>
  );
}
