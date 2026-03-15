import { Stack } from "expo-router";

// No header for the immersive splash intro flow
export default function SplashLayout() {
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
