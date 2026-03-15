import { useAuthStore } from "@/stores/authStore";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);

  // ── Guard: checks session ──── //
  // to avoid redirect flash before the store restores the Appwrite session on a cold launch.
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#14532D" />
      </View>
    );
  }

  // ── Guard: not authenticated ─── //
  // if the session check resolves and there is no user, redirect to login.
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
