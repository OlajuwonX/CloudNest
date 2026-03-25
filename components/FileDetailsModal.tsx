import React from "react";
import {
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { formatFileSize, formatFullDate, getReadableFileType } from "@/lib/utils";
import type { FileItem } from "@/types";

interface FileDetailsModalProps {
  visible: boolean;
  file: FileItem | null;
  onClose: () => void;
}

function DetailRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-start py-3 border-b border-border">
      <Text className="text-sm text-muted w-24 shrink-0">{label}</Text>
      <Text
        className={`text-sm text-text font-medium text-right flex-1 ml-2 ${capitalize ? "capitalize" : ""}`}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function FileDetailsModal({
  visible,
  file,
  onClose,
}: FileDetailsModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/50 justify-center items-center px-6"
        onPress={onClose}
      >
        <Pressable
          className="w-full bg-surface rounded-2xl p-5"
          onPress={() => {}}
        >
          <Text className="text-lg font-bold text-text mb-1">File Details</Text>

          {file && (
            <View className="mt-2">
              <DetailRow label="Name" value={file.fileName} />
              <DetailRow label="Type" value={getReadableFileType(file.fileType)} />
              <DetailRow label="Size" value={formatFileSize(file.fileSize)} />
              <DetailRow label="Uploaded" value={formatFullDate(file.$createdAt)} />
              <DetailRow label="Category" value={file.category} capitalize />
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="mt-4 py-3 rounded-xl border border-border items-center"
            activeOpacity={0.7}
          >
            <Text className="text-base font-medium text-muted">Close</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
