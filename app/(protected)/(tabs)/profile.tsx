import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ID, Permission, Role } from "react-native-appwrite";
import { SafeAreaView } from "react-native-safe-area-context";

import StorageCard from "@/components/StorageCard";
import { Avatar, LoadingSkeleton } from "@/components/ui";
import { account, storage } from "@/lib/appwrite";
import { fileKeys, getStorageStats } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

const BUCKET_ID = process.env.EXPO_PUBLIC_APPWRITE_BUCKET_ID!;

function SectionHeader({ title }: { title: string }) {
  return (
    <Text className="text-xs font-semibold text-muted uppercase tracking-wider px-5 pt-6 pb-2">
      {title}
    </Text>
  );
}

interface SettingsRowProps {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  showChevron?: boolean;
}

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  danger = false,
  showChevron,
}: SettingsRowProps) {
  const chevron = showChevron ?? !!onPress;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      className="flex-row items-center px-4 py-4 bg-surface border-b border-border"
    >
      <View
        className="w-8 h-8 rounded-full items-center justify-center mr-3 shrink-0"
        style={{ backgroundColor: danger ? "#FEF2F2" : "#F3F4F6" }}
      >
        <Feather name={icon} size={15} color={danger ? "#DC2626" : "#374151"} />
      </View>

      <Text
        className={`flex-1 text-sm font-medium ${danger ? "text-danger" : "text-text"}`}
      >
        {label}
      </Text>

      {value && (
        <Text className="text-xs text-muted mr-2" numberOfLines={1}>
          {value}
        </Text>
      )}

      {chevron && !danger && (
        <Feather name="chevron-right" size={16} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );
}

function NameEditModal({
  visible,
  currentName,
  onClose,
  onSave,
  isSaving,
}: {
  visible: boolean;
  currentName: string;
  onClose: () => void;
  onSave: (name: string) => void;
  isSaving: boolean;
}) {
  const [value, setValue] = React.useState(currentName);

  useEffect(() => {
    if (visible) setValue(currentName);
  }, [visible, currentName]);

  const canSave = value.trim().length > 0 && value.trim() !== currentName;

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
            <Text className="text-xl font-bold text-text mb-2">
              Edit Display Name
            </Text>

            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder="Your name"
              placeholderTextColor="#9CA3AF"
              autoFocus
              maxLength={64}
              className="border border-border rounded-xl px-4 py-3 text-[20px] text-text bg-background"
            />

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={onClose}
                className="flex-1 py-3 rounded-xl border border-border items-center"
                activeOpacity={0.7}
              >
                <Text className="text-[16px] font-medium text-muted">
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => onSave(value.trim())}
                disabled={!canSave || isSaving}
                className="flex-1 py-3 rounded-xl bg-primary items-center"
                activeOpacity={canSave && !isSaving ? 0.8 : 1}
                style={{ opacity: canSave && !isSaving ? 1 : 0.45 }}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-[16px] font-semibold text-white">
                    Save
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

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: fileKeys.storage(user?.$id ?? ""),
    queryFn: () => getStorageStats(user!.$id),
    enabled: !!user,
  });

  const storageBreakdown = stats?.breakdown ?? {
    images: 0,
    videos: 0,
    documents: 0,
    others: 0,
  };

  // models.Preferences is typed as `{}` � cast to access dynamic pref keys.
  // getFilePreview() uses positional args + returns a URL, same as getFileViewURL.
  const prefs = (user?.prefs ?? {}) as Record<string, string>;
  const avatarFileId = prefs.avatarFileId;

  useEffect(() => {
    if (!avatarFileId) {
      setAvatarUrl(undefined);
      return;
    }

    const url = storage.getFileDownload(BUCKET_ID, avatarFileId);
    setAvatarUrl(url.toString());
  }, [avatarFileId]);

  const handleAvatarPress = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      toast.error("Camera roll permission denied");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingAvatar(true);

    try {
      // Delete old avatar first to avoid orphaned files in the bucket
      if (avatarFileId) {
        try {
          await storage.deleteFile({
            bucketId: BUCKET_ID,
            fileId: avatarFileId,
          });
        } catch {
          // ignore — old file may already be gone
        }
      }

      const fileId = ID.unique();
      await storage.createFile(
        BUCKET_ID,
        fileId,
        {
          uri: asset.uri,
          name: `avatar_${user!.$id}.jpg`,
          type: "image/jpeg",
          size: asset.fileSize ?? 0,
        },
        [
          Permission.read(Role.user(user!.$id)),
          Permission.update(Role.user(user!.$id)),
          Permission.delete(Role.user(user!.$id)),
        ],
      );

      // persist new fileId in account prefs, merged with any existing prefs
      await account.updatePrefs({ ...prefs, avatarFileId: fileId });

      const updatedUser = await account.get();
      setUser(updatedUser);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success("Profile picture updated");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to update avatar";
      toast.error(msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSaveName = async (newName: string) => {
    setSavingName(true);
    try {
      await account.updateName(newName);
      const updatedUser = await account.get();
      setUser(updatedUser);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success("Name updated");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update name";
      toast.error(msg);
    } finally {
      setSavingName(false);
      setNameModalVisible(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          const error = await signOut();
          if (error) {
            toast.error(error);
          } else {
            queryClient.clear();
            router.replace("/(auth)/login");
          }
        },
      },
    ]);
  };

  const memberSince = user?.$createdAt
    ? new Date(user.$createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 96 }}
      >
        <View
          className="mx-5 mt-6 bg-surface rounded-2xl p-5 items-center"
          style={{
            elevation: 2,
            shadowColor: "#000",
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 2 },
          }}
        >
          <View className="relative">
            {uploadingAvatar ? (
              <View
                className="rounded-full bg-gray-200 items-center justify-center"
                style={{ width: 96, height: 96 }}
              >
                <ActivityIndicator size="small" color="#14532D" />
              </View>
            ) : (
              <Avatar
                name={user?.name ?? "User"}
                size="xl"
                imageUrl={avatarUrl}
              />
            )}
            <TouchableOpacity
              onPress={handleAvatarPress}
              activeOpacity={0.85}
              disabled={uploadingAvatar}
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 28,
                height: 28,
                borderRadius: 14,
                backgroundColor: "#fff",
                borderWidth: 1,
                borderColor: "#000",
                alignItems: "center",
                justifyContent: "center",
                elevation: 3,
              }}
            >
              <Feather name="camera" size={13} color="#000" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setNameModalVisible(true)}
            activeOpacity={0.7}
            className="flex-row items-center gap-2 mt-5"
          >
            <Text className="text-xl font-bold text-text">
              {user?.name ?? "User"}
            </Text>
            <Feather name="edit-2" size={15} color="#6B7280" />
          </TouchableOpacity>

          <Text className="text-sm text-muted mt-1">{user?.email ?? ""}</Text>

          {memberSince && (
            <View className="flex-row items-center gap-1.5 mt-3 bg-background rounded-full px-3 py-1.5">
              <Feather name="calendar" size={12} color="#6B7280" />
              <Text className="text-xs text-muted">
                Member since {memberSince}
              </Text>
            </View>
          )}
        </View>

        <SectionHeader title="Storage" />
        <View className="mx-5">
          {isLoadingStats ? (
            <LoadingSkeleton variant="card" count={1} />
          ) : (
            <StorageCard
              used={stats?.total ?? 0}
              breakdown={storageBreakdown}
            />
          )}
        </View>

        <SectionHeader title="Account" />
        <View
          className="mx-5 rounded-2xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <SettingsRow
            icon="lock"
            label="Change Password"
            onPress={() => router.push("/(auth)/forgot-password")}
          />
          <SettingsRow
            icon="mail"
            label="Email"
            value={user?.email ?? ""}
            showChevron={false}
          />
        </View>

        <SectionHeader title="App" />
        <View
          className="mx-5 rounded-2xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <SettingsRow
            icon="info"
            label="About CloudNest"
            onPress={() =>
              Alert.alert(
                "CloudNest",
                "A lightweight private cloud vault.\n\nBuilt with Expo + Appwrite.\nVersion 1.0.0",
              )
            }
          />
          <SettingsRow
            icon="code"
            label="Version"
            value="1.0.0"
            showChevron={false}
          />
        </View>

        <SectionHeader title="Session" />
        <View
          className="mx-5 rounded-2xl overflow-hidden"
          style={{ borderWidth: 1, borderColor: "#E5E7EB" }}
        >
          <SettingsRow
            icon="log-out"
            label="Sign Out"
            onPress={handleSignOut}
            danger
          />
        </View>
      </ScrollView>

      <NameEditModal
        visible={nameModalVisible}
        currentName={user?.name ?? ""}
        onClose={() => setNameModalVisible(false)}
        onSave={handleSaveName}
        isSaving={savingName}
      />
    </SafeAreaView>
  );
}
