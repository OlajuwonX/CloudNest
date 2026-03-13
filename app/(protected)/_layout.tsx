import { Redirect, Stack } from "expo-router";

export default function ProtectedLayout() {
  const isAuthenticated = false;

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
