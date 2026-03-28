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
  onCopyLink: (file: FileItem) => void;
  onShareEmail: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onDetails: (file: FileItem) => void;
  onDelete: (file: FileItem) => void;
}

interface ActionRow {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  label: string;
  danger?: boolean;
}

const PREVIEW_LABEL: Record<string, string> = {
  image: "View",
  video: "Play",
  document: "Open",
  other: "Open",
};

function buildActions(file: FileItem): ActionRow[] {
  const previewLabel = PREVIEW_LABEL[file.category] ?? "Open";
  return [
    { id: "preview", icon: "external-link", label: previewLabel },
    { id: "download", icon: "download", label: "Download" },
    { id: "copyLink", icon: "link", label: "Copy Link" },
    { id: "shareEmail", icon: "mail", label: "Share via Email" },
    { id: "rename", icon: "edit-2", label: "Rename" },
    { id: "details", icon: "info", label: "Details" },
    { id: "delete", icon: "trash-2", label: "Delete", danger: true },
  ];
}

export default function FileActionSheet({
  isVisible,
  onClose,
  file,
  onPreview,
  onDownload,
  onCopyLink,
  onShareEmail,
  onRename,
  onDetails,
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
      case "copyLink":
        onClose();
        onCopyLink(f);
        break;
      case "shareEmail":
        onClose();
        onShareEmail(f);
        break;
      case "rename":
        onClose();
        onRename(f);
        break;
      case "details":
        onClose();
        setTimeout(() => onDetails(f), 350);
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
              {file.fileName}
            </Text>
            <Text className="text-xs text-muted mt-0.5">
              {formatFileSize(file.fileSize)} · {file.category}
            </Text>
          </View>
        )}

        {file &&
          buildActions(file).map((action) => (
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
