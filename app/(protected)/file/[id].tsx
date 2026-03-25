import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import {
  AVPlaybackStatus,
  AVPlaybackStatusSuccess,
  ResizeMode,
  Video,
} from "expo-av";
import { File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import { router, useLocalSearchParams } from "expo-router";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useQueryClient } from "@tanstack/react-query";

import RenameModal from "@/components/RenameModal";
import { account, databases, storage } from "@/lib/appwrite";
import { fileKeys } from "@/lib/queries";
import { formatFileSize } from "@/lib/utils";
import type { FileItem } from "@/types";

const DB_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID!;
const FILES_TABLE_ID = process.env.EXPO_PUBLIC_APPWRITE_FILES_TABLE_ID!;
const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

function fmtMs(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPlayer({ uri }: { uri: string }) {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [shouldPlay, setShouldPlay] = useState(false);

  const loaded: AVPlaybackStatusSuccess | null =
    status !== null && status.isLoaded ? status : null;
  const hasError =
    status !== null && !status.isLoaded && "error" in status && !!status.error;
  const isPlaying = shouldPlay;
  const posMs = loaded?.positionMillis ?? 0;
  const durMs = loaded?.durationMillis ?? 0;
  const progress = durMs > 0 ? posMs / durMs : 0;

  const togglePlay = () => setShouldPlay((p) => !p);

  const handleFullscreen = async () => {
    if (!videoRef.current) return;
    try {
      await videoRef.current.presentFullscreenPlayer();
    } catch {
      // component unmounted before fullscreen could be entered — ignore
    }
  };

  if (hasError) {
    return (
      <View className="flex-1 bg-black items-center justify-center gap-2">
        <Feather name="alert-circle" size={40} color="#DC2626" />
        <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
          Unable to play this video
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <Video
        ref={videoRef}
        source={{ uri }}
        style={{ width: "100%", height: "100%" }}
        resizeMode={ResizeMode.CONTAIN}
        useNativeControls={false}
        shouldPlay={shouldPlay}
        onPlaybackStatusUpdate={setStatus}
      />

      <TouchableOpacity
        onPress={togglePlay}
        activeOpacity={0.8}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 52,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!loaded ? (
          <ActivityIndicator size="large" color="#ffffff" />
        ) : (
          <View
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: "rgba(0,0,0,0.55)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Feather
              name={isPlaying ? "pause" : "play"}
              size={26}
              color="#fff"
              style={{ marginLeft: isPlaying ? 0 : 3 }}
            />
          </View>
        )}
      </TouchableOpacity>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 52,
          backgroundColor: "rgba(0,0,0,0.65)",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 16,
          gap: 12,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 12, minWidth: 84 }}>
          {fmtMs(posMs)} / {fmtMs(durMs)}
        </Text>

        <View
          style={{
            flex: 1,
            height: 3,
            backgroundColor: "rgba(255,255,255,0.3)",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: "100%",
              backgroundColor: "#fff",
            }}
          />
        </View>

        <TouchableOpacity onPress={handleFullscreen} hitSlop={10}>
          <Feather name="maximize" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function ZoomableImage({ uri }: { uri: string }) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      "worklet";
      if (scale.value > 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const pinch = Gesture.Pinch()
    .onStart(() => {
      "worklet";
      savedScale.value = scale.value;
    })
    .onChange((e) => {
      "worklet";
      scale.value = Math.max(1, savedScale.value * e.scale);
    })
    .onEnd(() => {
      "worklet";
      if (scale.value < 1) scale.value = withSpring(1);
    });

  const gesture = Gesture.Exclusive(doubleTap, pinch);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View className="flex-1 bg-black">
      <GestureDetector gesture={gesture}>
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
          <Image
            source={{ uri }}
            contentFit="contain"
            style={{ flex: 1 }}
            transition={200}
          />
        </Animated.View>
      </GestureDetector>
    </View>
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
    return <VideoPlayer uri={fileViewUrl} />;
  }

  if (file.fileType === "application/pdf") {
    return (
      <View className="flex-1 bg-neutral-900 items-center justify-center gap-4 px-8">
        <Feather name="file-text" size={80} color="#F97316" />
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          {file.fileName}
        </Text>
        <Text style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
          PDF preview requires a development build.{"\n"}Use the download button
          to view this file.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center gap-4 px-8">
      <Feather name="file" size={80} color="#6B7280" />
      <Text
        style={{
          color: "#fff",
          fontSize: 16,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        {file.fileName}
      </Text>
      <Text style={{ color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
        Preview not available for this file type
      </Text>
    </View>
  );
}

export default function FileDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const { top, bottom } = useSafeAreaInsets();

  const [file, setFile] = useState<FileItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [renameVisible, setRenameVisible] = useState(false);
  // JWT is embedded directly in media URLs as `&jwt=<token>` so the native
  // video player and expo-image both authenticate without custom headers.
  const [jwt, setJwt] = useState<string | null>(null);

  useEffect(() => {
    account
      .createJWT()
      .then(({ jwt: token }) => setJwt(token))
      .catch(() => {});
  }, []);

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

  // append JWT as a query param so both expo-image and the native video player
  // can authenticate without relying on custom HTTP headers or shared cookies.
  const appendJwt = (url: string) => (jwt ? `${url}&jwt=${jwt}` : url);

  const fileViewUrl = file
    ? appendJwt(storage.getFileViewURL(BUCKET_ID, file.storageFileId).href)
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

  const handleRename = async (newName: string) => {
    if (!file) return;
    try {
      await databases.updateDocument(DB_ID, FILES_TABLE_ID, file.$id, {
        fileName: newName,
      });
      setFile({ ...file, fileName: newName });
      await queryClient.invalidateQueries({ queryKey: fileKeys.all });
      toast.success("File renamed");
    } catch {
      toast.error("Rename failed");
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
              await queryClient.invalidateQueries({ queryKey: fileKeys.all });
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
      <View
        className="flex-1 bg-black items-center justify-center"
        style={{ paddingTop: top }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!file) {
    return (
      <View
        className="flex-1 bg-black items-center justify-center px-8"
        style={{ paddingTop: top }}
      >
        <Feather name="alert-circle" size={48} color="#DC2626" />
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            fontWeight: "600",
            marginTop: 16,
            textAlign: "center",
          }}
        >
          File not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <Text style={{ color: "#86EFAC", fontSize: 14 }}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <PreviewArea file={file} fileViewUrl={fileViewUrl} />

      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: top + 6,
          paddingBottom: 10,
          paddingHorizontal: 16,
          backgroundColor: "rgba(0,0,0,0.55)",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={8}
          style={{ marginRight: 8 }}
        >
          <Feather name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>

        <Text
          style={{
            flex: 1,
            color: "#fff",
            fontSize: 15,
            fontWeight: "600",
          }}
          numberOfLines={1}
        >
          {file.fileName}
        </Text>

        <TouchableOpacity
          onPress={handleShare}
          hitSlop={8}
          style={{ marginLeft: 8 }}
        >
          <Feather name="share-2" size={20} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDownload}
          disabled={isDownloading}
          hitSlop={8}
          style={{ marginLeft: 12 }}
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Feather name="download" size={20} color="#fff" />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setRenameVisible(true)}
          hitSlop={8}
          style={{ marginLeft: 12 }}
        >
          <Feather name="edit-2" size={19} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleDelete}
          hitSlop={8}
          style={{ marginLeft: 12 }}
        >
          <Feather name="trash-2" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View
        style={{
          position: "absolute",
          bottom: bottom + 12,
          right: 16,
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}
      >
        <Text style={{ color: "#D1D5DB", fontSize: 11 }}>
          {formatFileSize(file.fileSize)}
        </Text>
      </View>

      <RenameModal
        visible={renameVisible}
        currentName={file.fileName}
        onClose={() => setRenameVisible(false)}
        onRename={handleRename}
      />
    </View>
  );
}
