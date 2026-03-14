import { ToastPosition, Toasts } from "@backpackapp-io/react-native-toast";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MD3LightTheme, PaperProvider } from "react-native-paper";
import "./global.css";

// ─── react-native-paper theme ─── //

const paperTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#14532D", // dark green   — input focus ring, active label
    secondary: "#1E3A8A", // dark blue
    error: "#DC2626", // danger red    — error borders / labels
    background: "#F8FAFC",
    surface: "#FFFFFF",
    outline: "#E5E7EB", // resting input border
    onSurfaceVariant: "#6B7280", // placeholder & floating label colour
  },
};

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={paperTheme}>
        <Stack screenOptions={{ headerShown: false }} />

        {/* backpack toast */}
        <Toasts defaultPosition={ToastPosition.TOP} defaultDuration={3000} />
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
