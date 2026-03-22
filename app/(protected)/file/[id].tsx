import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { ResizeMode, Video } from "expo-av";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui";
import { databases, storage } from "@/lib/appwrite";
import {
  formatFileSize,
  formatFullDate,
  getReadableFileType,
} from "@/lib/utils";
import type { FileItem } from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

export default function FileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [file, setFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const doc = await databases.getDocument({
          databaseId: DB_ID,
          collectionId: FILES_TABLE_ID,
          documentId: id,
        });
        setFile(doc as unknown as FileItem);
      } catch (err) {
        console.error("[file/[id]] fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const fileViewUrl = file
    ? storage.getFileViewURL(BUCKET_ID, file.storageFileId).href
    : "";

  const fileDownloadUrl = file
    ? storage.getFileDownloadURL(BUCKET_ID, file.storageFileId).href
    : "";

  const handleDownload = async () => {
    if (!file) return;
    setIsDownloading(true);
    try {
      toast.loading("Downloading…");
      const localFile = await File.downloadFileAsync(
        fileDownloadUrl,
        new File(Paths.document, file.fileName),
      );
      toast.dismiss();

      if (file.category === "image" || file.category === "video") {
        await MediaLibrary.requestPermissionsAsync();
        await MediaLibrary.saveToLibraryAsync(localFile.uri);
        toast.success("Saved to camera roll");
      } else {
        // for documents, open the native share sheet so the user can open or save it
        await Sharing.shareAsync(localFile.uri);
        toast.success("File downloaded");
      }
    } catch (err) {
      toast.dismiss();
      toast.error("Download failed");
      console.error("[file/[id]] download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!file) return;
    try {
      toast.loading("Preparing…");
      const localFile = await File.downloadFileAsync(
        fileDownloadUrl,
        new File(Paths.document, file.fileName),
      );
      toast.dismiss();
      await Sharing.shareAsync(localFile.uri);
    } catch {
      toast.dismiss();
      toast.error("Share failed");
    }
  };

  const handleDelete = () => {
    if (!file) return;
    Alert.alert(
      "Delete File",
      "This will permanently remove the file from your vault. This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await storage.deleteFile({
                bucketId: BUCKET_ID,
                fileId: file.storageFileId,
              });
              await databases.deleteDocument({
                databaseId: DB_ID,
                collectionId: FILES_TABLE_ID,
                documentId: file.$id,
              });
              toast.success("File deleted");
              router.back();
            } catch {
              toast.error("Delete failed");
            }
          },
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#14532D" />
      </SafeAreaView>
    );
  }

  if (!file) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center px-8">
        <Feather name="alert-circle" size={48} color="#DC2626" />
        <Text className="text-lg font-semibold text-text mt-4 text-center">
          File not found
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-sm text-primary">Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <View className="flex-row items-center px-4 py-3 border-b border-border bg-surface">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <Feather name="arrow-left" size={22} color="#374151" />
        </TouchableOpacity>

        <Text
          className="flex-1 text-base font-semibold text-text"
          numberOfLines={1}
        >
          {file.fileName}
        </Text>
        <TouchableOpacity onPress={handleDelete} className="ml-3">
          <Feather name="trash-2" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <PreviewArea file={file} fileViewUrl={fileViewUrl} />

        <View
          className="mx-4 bg-surface rounded-2xl p-5 -mt-4 z-10"
          style={{
            elevation: 3,
            shadowColor: "#000",
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <Text className="text-lg font-semibold text-text mb-4">
            File Info
          </Text>

          <InfoRow label="Type" value={getReadableFileType(file.fileType)} />
          <InfoRow label="Size" value={formatFileSize(file.fileSize)} />
          <InfoRow label="Uploaded" value={formatFullDate(file.$createdAt)} />
          <InfoRow label="Category" value={file.category} capitalize />
        </View>

        <View className="flex-row gap-3 px-4 mt-5">
          <Button
            title="Download"
            variant="outline"
            size="md"
            className="flex-1"
            isLoading={isDownloading}
            leftIcon={<Feather name="download" size={16} color="#14532D" />}
            onPress={handleDownload}
          />
          <Button
            title="Share"
            variant="outline"
            size="md"
            className="flex-1"
            leftIcon={<Feather name="share-2" size={16} color="#14532D" />}
            onPress={handleShare}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PreviewArea({
  file,
  fileViewUrl,
}: {
  file: FileItem;
  fileViewUrl: string;
}) {
  if (file.category === "image") {
    return <ZoomableImage uri={fileViewUrl} />;
  }

  if (file.category === "video") {
    return (
      <View className="w-full bg-black" style={{ height: 280 }}>
        <Video
          source={{ uri: fileViewUrl }}
          style={{ width: "100%", height: "100%" }}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          shouldPlay={false}
        />
      </View>
    );
  }

  if (file.fileType === "application/pdf") {
    return (
      <View
        className="w-full bg-neutral-100 items-center justify-center gap-3"
        style={{ height: 280 }}
      >
        <Feather name="file-text" size={64} color="#F97316" />
        <Text className="text-sm text-muted text-center px-8">
          PDF preview requires a development build.{"\n"}Use Download to view
          this file.
        </Text>
      </View>
    );
  }

  return (
    <View
      className="w-full bg-neutral-100 items-center justify-center gap-3"
      style={{ height: 280 }}
    >
      <Feather name="file" size={64} color="#6B7280" />
      <Text className="text-base font-semibold text-text">{file.fileName}</Text>
      <Text className="text-sm text-muted">
        Preview not available for this file type
      </Text>
    </View>
  );
}

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      savedScale.value = scale.value;
    })
    .onChange((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1); // snap back to normal if over-pinched
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View
      className="w-full bg-black items-center justify-center overflow-hidden"
      style={{ height: 320 }}
    >
      <GestureDetector gesture={pinchGesture}>
        <Animated.View
          style={[{ width: "100%", height: "100%" }, animatedStyle]}
        >
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ width: "100%", height: "100%" }}
            transition={200}
          />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

function InfoRow({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <View className="flex-row justify-between items-start py-2.5 border-b border-border">
      <Text className="text-sm text-muted">{label}</Text>
      <Text
        className={`text-sm text-text font-medium text-right flex-1 ml-4 ${capitalize ? "capitalize" : ""}`}
      >
        {value}
      </Text>
    </View>
  );
}

//  expo-av Video renders a native video player.
// useNativeControls={true} shows the system play/pause, scrubber,
// and fullscreen button — no custom UI needed.
//  shouldPlay={false} prevents autoplay; the user taps play themselves.

// Wraps expo-image with a pinch-to-zoom gesture using the new Gesture API
// from react-native-gesture-handler v2.
// How it works:
// - `useSharedValue(1)` creates a Reanimated shared value on the UI thread.
// - `Gesture.Pinch()` tracks the pinch gesture and fires `onChange` each frame.
// - `savedScale` stores the scale at the moment the gesture starts so we can
//   multiply it with the current `event.scale` for incremental zooming.
// - `useAnimatedStyle` creates a style object that lives on the UI thread,
//   avoiding JS-thread jank during the animation.
// - On gesture end: if the user zoomed out past 1×, spring back to 1×.
