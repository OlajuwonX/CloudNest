import { useAuthStore } from "@/stores/authStore";
import { ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import "./global.css";

// ─── react-native-paper theme ──── //
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#14532D", // dark green
    secondary: "#1E3A8A", // dark blue
    error: "#DC2626", // danger red
    background: "#F8FAFC",
    surface: "#FFFFFF",
    outline: "#E5E7EB", // resting input border
    onSurfaceVariant: "#6B7280", // placeholder & floating label colour
  },
};

export default function RootLayout() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }} />

        {/* Global toast renderer */}
        <Toasts defaultPosition={ToastPosition.TOP} defaultDuration={3000} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}

// ── Session restore (checkSession) ── //

// runs once on mount. calls Appwrite account.get() to check if a
// valid session cookie already exists. The result populates isAuthenticated
// in the store, which is read by index.tsx to decide where to redirect the user.
