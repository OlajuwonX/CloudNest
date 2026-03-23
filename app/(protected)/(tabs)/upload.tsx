import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ID } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui";
import { databases, storage } from "@/lib/appwrite";
import { fileKeys } from "@/lib/queries";
import { getFileCategory } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import type { SelectedFile, UploadItem } from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

const SOURCE_OPTIONS = [
  {
    id: "gallery",
    icon: "image" as const,
    circleColor: "#3B82F6",
    title: "Photo & Video Library",
    subtitle: "Select from your gallery",
  },
  {
    id: "document",
    icon: "file-text" as const,
    circleColor: "#F97316",
    title: "Documents",
    subtitle: "PDF, DOC, XLS, TXT and more",
  },
  {
    id: "camera",
    icon: "camera" as const,
    circleColor: "#16A34A",
    title: "Camera",
    subtitle: "Take a new photo",
  },
] as const;

export default function UploadScreen() {
  const user = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSummary, setUploadSummary] = useState("");

  const addFiles = (files: SelectedFile[]) => {
    const newItems: UploadItem[] = files.map((file) => ({
      file,
      progress: 0,
      status: "pending",
    }));
    setUploadItems((prev) => [...prev, ...newItems]);
  };

  const updateItem = (uri: string, patch: Partial<UploadItem>) => {
    setUploadItems((prev) =>
      prev.map((item) =>
        item.file.uri === uri ? { ...item, ...patch } : item,
      ),
    );
  };

  const removeItem = (uri: string) => {
    setUploadItems((prev) => prev.filter((item) => item.file.uri !== uri));
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library in Settings.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      // MediaTypeOptions.All lets users pick both photos and videos in one sheet
      mediaTypes: ["images", "videos"],
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const files: SelectedFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName ?? `file_${Date.now()}`,
        size: asset.fileSize ?? 0,
        mimeType: asset.mimeType ?? "image/jpeg",
      }));
      addFiles(files);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.*",
        "text/plain",
        "application/vnd.ms-excel",
      ],
      multiple: true,
      copyToCacheDirectory: true, // makes the URI readable by the Appwrite upload
    });

    if (!result.canceled && result.assets) {
      const files: SelectedFile[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.name,
        size: asset.size ?? 0,
        mimeType: asset.mimeType ?? "application/octet-stream",
      }));
      addFiles(files);
    }
  };

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow camera access in Settings.",
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      addFiles([
        {
          uri: asset.uri,
          name: asset.fileName ?? `photo_${Date.now()}.jpg`,
          size: asset.fileSize ?? 0,
          mimeType: asset.mimeType ?? "image/jpeg",
        },
      ]);
    }
  };

  /** Routes the press on each source card to the appropriate picker. */
  const handleSourcePress = (id: string) => {
    if (id === "gallery") pickFromGallery();
    else if (id === "document") pickDocument();
    else if (id === "camera") pickFromCamera();
  };

  const uploadAll = async () => {
    if (!user || uploadItems.length === 0) return;

    setIsUploading(true);
    let successCount = 0;

    for (let i = 0; i < uploadItems.length; i++) {
      const item = uploadItems[i];
      setUploadSummary(`Uploading ${i + 1} of ${uploadItems.length} files…`);

      // Mark this file as actively uploading
      updateItem(item.file.uri, { status: "uploading" });

      try {
        const storageFile = await storage.createFile({
          bucketId: BUCKET_ID,
          fileId: ID.unique(),
          file: {
            uri: item.file.uri,
            name: item.file.name,
            type: item.file.mimeType,
            size: item.file.size,
          },
          onProgress: (prog) => {
            // prog.progress is a 0-100 number from the SDK
            updateItem(item.file.uri, { progress: prog.progress ?? 0 });
          },
        });

        await databases.createDocument({
          databaseId: DB_ID,
          collectionId: FILES_TABLE_ID,
          documentId: ID.unique(),
          data: {
            userId: user.$id,
            fileName: item.file.name,
            fileType: item.file.mimeType,
            category: getFileCategory(item.file.mimeType),
            fileSize: item.file.size,
            storageFileId: storageFile.$id,
          },
        });

        // mark complete and lock progress at 100
        updateItem(item.file.uri, { status: "done", progress: 100 });
        successCount++;
      } catch (err) {
        // mark this file as failed but continue with remaining files
        const msg = err instanceof Error ? err.message : "Upload failed";
        updateItem(item.file.uri, { status: "error", error: msg });
        console.error(`[upload] failed for ${item.file.name}:`, err);
      }
    }

    setUploadSummary(
      successCount === uploadItems.length
        ? "All files uploaded!"
        : `${successCount} of ${uploadItems.length} files uploaded`,
    );

    if (successCount > 0) {
      toast.success(
        `${successCount} file${successCount > 1 ? "s" : ""} uploaded successfully`,
      );
      // invalidate all file queries so the home dashboard and files list
      // both refetch automatically when the user navigates back to them.
      await queryClient.invalidateQueries({ queryKey: fileKeys.all });
    }

    setIsUploading(false);

    // auto-navigate home after a brief delay so the user can see the done state
    setTimeout(() => {
      setUploadItems([]);
      setUploadSummary("");
      router.replace("/(protected)/(tabs)/home");
    }, 1500);
  };

  const hasFiles = uploadItems.length > 0;
  // const pendingCount = uploadItems.filter((i) => i.status === "pending").length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="items-center pt-4 pb-2">
          <Text className="text-xl font-semibold text-text">Upload Files</Text>
        </View>

        <View className="gap-3 px-5 mt-4">
          {SOURCE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.id}
              onPress={() => handleSourcePress(option.id)}
              activeOpacity={0.75}
              disabled={isUploading}
              className="flex-row items-center bg-surface rounded-xl p-4 border border-border"
            >
              <View
                className="w-12 h-12 rounded-full items-center justify-center shrink-0"
                style={{ backgroundColor: option.circleColor + "22" }}
              >
                <Feather
                  name={option.icon}
                  size={22}
                  color={option.circleColor}
                />
              </View>

              <View className="flex-1 ml-4">
                <Text className="text-base font-semibold text-text">
                  {option.title}
                </Text>
                <Text className="text-xs text-muted mt-0.5">
                  {option.subtitle}
                </Text>
              </View>

              <Feather name="chevron-right" size={18} color="#6B7280" />
            </TouchableOpacity>
          ))}
        </View>

        {hasFiles && (
          <View className="mt-6 px-5">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-base font-semibold text-text">
                {isUploading
                  ? uploadSummary
                  : `Selected Files (${uploadItems.length})`}
              </Text>
              {!isUploading && (
                <TouchableOpacity onPress={() => setUploadItems([])}>
                  <Text className="text-sm text-danger font-medium">
                    Clear All
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              horizontal
              data={uploadItems}
              keyExtractor={(item) => item.file.uri}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 12 }}
              renderItem={({ item }) => (
                <FilePreviewCard
                  item={item}
                  onRemove={() => removeItem(item.file.uri)}
                  isUploading={isUploading}
                />
              )}
            />
          </View>
        )}

        <View className="px-5 mt-6">
          <Button
            title={
              isUploading
                ? "Uploading…"
                : `Upload ${hasFiles ? uploadItems.length : ""} File${uploadItems.length !== 1 ? "s" : ""}`.trim()
            }
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isUploading}
            disabled={!hasFiles || isUploading}
            onPress={uploadAll}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilePreviewCard({
  item,
  onRemove,
  isUploading,
}: {
  item: UploadItem;
  onRemove: () => void;
  isUploading: boolean;
}) {
  const isImage = item.file.mimeType.startsWith("image/");

  const statusColor =
    item.status === "done"
      ? "#16A34A"
      : item.status === "error"
        ? "#DC2626"
        : "#14532D";

  return (
    <View
      className="w-24"
      style={{ position: "relative", overflow: "visible" }}
    >
      <View className="w-24 h-24 rounded-xl overflow-hidden bg-border items-center justify-center">
        {isImage ? (
          <Image
            source={{ uri: item.file.uri }}
            contentFit="cover"
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
        ) : (
          <Feather name="file-text" size={32} color="#6B7280" />
        )}

        {item.status === "uploading" && (
          <View className="absolute inset-0 bg-black/40 items-center justify-center rounded-xl">
            <ActivityIndicator color="#ffffff" />
            <Text className="text-white text-xs mt-1">
              {Math.round(item.progress)}%
            </Text>
          </View>
        )}

        {item.status === "done" && (
          <View className="absolute inset-0 bg-black/30 items-center justify-center rounded-xl">
            <Feather name="check-circle" size={28} color="#4ADE80" />
          </View>
        )}

        {item.status === "error" && (
          <View className="absolute inset-0 bg-black/50 items-center justify-center rounded-xl">
            <Feather name="x-circle" size={28} color="#DC2626" />
          </View>
        )}
      </View>

      {item.status === "uploading" && (
        <View className="mt-1 h-1.5 w-full bg-border rounded-full overflow-hidden">
          <View
            className="h-full rounded-full"
            style={{ width: `${item.progress}%`, backgroundColor: statusColor }}
          />
        </View>
      )}

      <Text className="text-xs text-text mt-1 text-center" numberOfLines={1}>
        {item.file.name}
      </Text>

      {!isUploading && (
        <TouchableOpacity
          onPress={onRemove}
          style={{
            position: "absolute",
            top: 0,
            right: -4,
            backgroundColor: "#DC2626",
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="x" size={12} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// PickFromGallery() -> Photo & Video Library picker.
//  We request permission first. If denied we show a system alert so the user
//  knows they need to grant access in Settings rather than just seeing nothing happen.

//  pickDocument() -> Document picker — opens the native file browser.
//  The type array restricts what the user can pick to office and text formats

//  pickFromCamera() -> Camera picker. We open the native camera and
//  capture a single photo. Camera permission is handled the same way as gallery permission.

//  Upload flow
//  uploadAll loops through every selected file and uploads them to Appwrite one by one.
//  The loop continues even if one file fails — we catch per-file errors,
//  mark that file as 'error', and move on. A final toast tells the user how many succeeded.
//  Why sequential and not parallel?
//  Uploading all files simultaneously could saturate the user's connection.
//  Sequential upload gives smoother progress feedback and is easier to reason about.
