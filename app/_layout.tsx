import { useAuthStore } from "@/stores/authStore";
import { ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import "./global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30seconds
      gcTime: 5 * 60_000, // Keep unused cached data in memory for 5 minutes before thrashing it.
      retry: 1, // retry once on failure before showing an error state.
    },
  },
});

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={paperTheme}>
            <BottomSheetModalProvider>
              <Stack screenOptions={{ headerShown: false }} />

              {/* Global toast renderer */}
              <Toasts
                defaultPosition={ToastPosition.TOP}
                defaultDuration={3000}
              />
            </BottomSheetModalProvider>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}

// queryClient holds the cache and configuration for all useQuery / useMutation calls.
// creating it outside the component means the same instance persists for the app's lifetime.

// ── Session restore (checkSession) ── //
// runs once on mount. calls Appwrite account.get() to check if a
// valid session cookie already exists. The result populates isAuthenticated
// in the store, which is read by index.tsx to decide where to redirect the user.

// bottomSheetModalProvider must wrap any screen that uses BottomSheetModal.
// it creates a shared portal that renders the sheet above all other content.
// without this, calling ref.current.present() would silently do nothing.
