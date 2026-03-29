import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useEffect } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";

export interface AnchorPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FileActionMenuProps {
  isVisible: boolean;
  onClose: () => void;
  file: FileItem | null;
  anchor: AnchorPosition | null;
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
  image: "View Image",
  video: "Play Video",
  document: "Open Document",
  other: "Open File",
};

function buildActions(file: FileItem): ActionRow[] {
  return [
    {
      id: "preview",
      icon: "external-link",
      label: PREVIEW_LABEL[file.category] ?? "Open",
    },
    { id: "download", icon: "download", label: "Download" },
    { id: "copyLink", icon: "link", label: "Copy Link" },
    { id: "shareEmail", icon: "mail", label: "Share via Email" },
    { id: "rename", icon: "edit-2", label: "Rename" },
    { id: "details", icon: "info", label: "File Details" },
    { id: "delete", icon: "trash-2", label: "Delete", danger: true },
  ];
}

const CATEGORY_COLOR: Record<string, string> = {
  image: "#3B82F6",
  video: "#8B5CF6",
  document: "#F97316",
  other: "#6B7280",
};

const CATEGORY_ICON: Record<string, keyof typeof Feather.glyphMap> = {
  image: "image",
  video: "video",
  document: "file-text",
  other: "file",
};

const CATEGORY_BG: Record<string, string> = {
  image: "#EFF6FF",
  video: "#F5F3FF",
  document: "#FFF7ED",
  other: "#F3F4F6",
};

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");
const CARD_WIDTH = Math.min(300, SCREEN_W - 40);
// for smart positioning (header + 7 rows * ~56px)
const ROW_HEIGHT = 50;
const HEADER_HEIGHT = 70;
const ESTIMATED_CARD_H = HEADER_HEIGHT + 7 * ROW_HEIGHT;

function calcCardTop(anchor: AnchorPosition | null): number {
  const CARD_MAX_H = SCREEN_H * 0.5;

  if (!anchor) return SCREEN_H / 2 - CARD_MAX_H / 2;

  const anchorBottom = anchor.y + anchor.height;

  // below first
  let top = anchorBottom + 12;

  // overflows → move above
  if (top + CARD_MAX_H > SCREEN_H) {
    top = anchor.y - CARD_MAX_H - 12;
  }

  // clamp inside screen
  return Math.max(12, Math.min(top, SCREEN_H - CARD_MAX_H - 12));
}

export default function FileActionMenu({
  isVisible,
  onClose,
  file,
  anchor,
  onPreview,
  onDownload,
  onCopyLink,
  onShareEmail,
  onRename,
  onDetails,
  onDelete,
}: FileActionMenuProps) {
  const scale = useSharedValue(0.88);
  const opacity = useSharedValue(0);
  const cardTop = useSharedValue(calcCardTop(anchor));

  // recompute card position whenever anchor changes
  useEffect(() => {
    cardTop.value = calcCardTop(anchor);
  }, [anchor, cardTop]);

  useEffect(() => {
    if (isVisible) {
      opacity.value = withTiming(1, { duration: 180 });
      scale.value = withSpring(1, {
        damping: 18,
        stiffness: 260,
        mass: 0.8,
      });
    } else {
      opacity.value = withTiming(0, { duration: 140 });
      scale.value = withTiming(0.88, { duration: 140 });
    }
  }, [isVisible, opacity, scale]);
  function calcCardLeft(anchor: AnchorPosition | null) {
    if (!anchor) return (SCREEN_W - CARD_WIDTH) / 2;

    const centerX = anchor.x + anchor.width / 2;

    return Math.max(
      12,
      Math.min(centerX - CARD_WIDTH / 2, SCREEN_W - CARD_WIDTH - 12),
    );
  }

  const cardLeft = useSharedValue(calcCardLeft(anchor));

  useEffect(() => {
    cardLeft.value = calcCardLeft(anchor);
  }, [anchor, cardLeft]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateY: withTiming(isVisible ? 0 : 10) },
    ],
    opacity: opacity.value,
    top: cardTop.value,
    left: cardLeft.value,
  }));

  const handleDelete = (f: FileItem) => {
    onClose();
    // wait for modal close animation before showing alert
    setTimeout(() => {
      Alert.alert(
        "Delete File",
        `"${f.fileName}" will be permanently removed from your vault. This cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(f) },
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
        setTimeout(() => onDetails(f), 320);
        break;
      case "delete":
        handleDelete(f);
        break;
    }
  };

  if (!file) return null;

  const accentColor = CATEGORY_COLOR[file.category] ?? "#6B7280";
  const categoryIcon = CATEGORY_ICON[file.category] ?? "file";
  const categoryBg = CATEGORY_BG[file.category] ?? "#F3F4F6";
  const actions = buildActions(file);

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View style={[{ flex: 1 }, backdropStyle]}>
        <BlurView intensity={35} tint="dark" style={{ flex: 1 }}>
          <Pressable style={{ flex: 1 }} onPress={onClose} />
        </BlurView>
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",

            width: CARD_WIDTH,
          },
          cardStyle,
        ]}
        pointerEvents="box-none"
      >
        {/* File info header */}
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            marginBottom: 2,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 24,
            shadowOffset: { width: 0, height: 12 },
            elevation: 12,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              padding: 14,
              gap: 12,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                backgroundColor: categoryBg,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Feather name={categoryIcon} size={22} color={accentColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: "#111827",
                }}
                numberOfLines={1}
              >
                {file.fileName}
              </Text>
              <Text style={{ fontSize: 11, color: "#6B7280", marginTop: 2 }}>
                {formatFileSize(file.fileSize)} · {file.category}
              </Text>
            </View>
          </View>
        </View>

        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 18,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOpacity: 0.12,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 8,
            maxHeight: SCREEN_H * 0.5,
          }}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            contentContainerStyle={{ paddingBottom: 6 }}
            style={{ flexGrow: 0 }}
          >
            {actions.map((action, idx) => (
              <TouchableOpacity
                key={action.id}
                onPress={() => handleAction(action.id, file)}
                activeOpacity={0.6}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingHorizontal: 16,
                  paddingVertical: 9,
                  borderBottomWidth: idx < actions.length - 1 ? 0.5 : 0,
                  borderBottomColor: "#F3F4F6",
                }}
              >
                <View
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: 8,
                    backgroundColor: action.danger ? "#FEF2F2" : "#F9FAFB",
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                  }}
                >
                  <Feather
                    name={action.icon}
                    size={16}
                    color={action.danger ? "#DC2626" : "#374151"}
                  />
                </View>
                <Text
                  style={{
                    flex: 1,
                    fontSize: 14,
                    color: action.danger ? "#DC2626" : "#111827",
                    fontWeight: action.danger ? "500" : "400",
                  }}
                >
                  {action.label}
                </Text>
                {!action.danger && (
                  <Feather name="chevron-right" size={16} color="#D1D5DB" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}
