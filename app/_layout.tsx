import { useAuthStore } from "@/stores/authStore";
import { ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

// ─── react-native-paper theme ──── //
const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#14532D",
    secondary: "#1E3A8A",
    error: "#DC2626",
    background: "#F8FAFC",
    surface: "#FFFFFF",
    outline: "#E5E7EB",
    onSurfaceVariant: "#6B7280",
  },
};

export default function RootLayout() {
  const checkSession = useAuthStore((s) => s.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          {/*
           * BottomSheetModalProvider must wrap any screen that uses BottomSheetModal.
           * It creates a shared portal that renders the sheet above all other content.
           * Without this, calling ref.current.present() would silently do nothing.
           */}
          <BottomSheetModalProvider>
            <Stack screenOptions={{ headerShown: false }} />

            {/* Global toast renderer */}
            <Toasts defaultPosition={ToastPosition.TOP} defaultDuration={3000} />
          </BottomSheetModalProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// ── Session restore (checkSession) ── //
// runs once on mount. calls Appwrite account.get() to check if a
// valid session cookie already exists. The result populates isAuthenticated
// in the store, which is read by index.tsx to decide where to redirect the user.
