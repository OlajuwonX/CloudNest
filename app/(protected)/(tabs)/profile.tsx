import { toast } from "@backpackapp-io/react-native-toast";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StorageCard from "@/components/StorageCard";
import { Avatar, LoadingSkeleton } from "@/components/ui";
import { fileKeys, getStorageStats } from "@/lib/queries";
import { useAuthStore } from "@/stores/authStore";

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

export default function ProfileScreen() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const queryClient = useQueryClient();

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

      <View className="px-5 py-3 border-b border-border bg-surface">
        <Text className="text-xl font-semibold text-text">Profile</Text>
      </View>

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
          <Avatar name={user?.name ?? "User"} size="xl" />

          <Text className="text-xl font-bold text-text mt-3">
            {user?.name ?? "User"}
          </Text>
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
            icon="user"
            label="Edit Profile"
            onPress={() =>
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available in a future update.",
              )
            }
          />
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
    </SafeAreaView>
  );
}
