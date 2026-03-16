import { Redirect, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { ActivityIndicator } from "react-native-paper";

// ── Universal Deep Link Handler ──
// This screen acts as a transparent router. When Appwrite redirects the user
// to \`cloudnest://auth?action=verify-email&userId=...&secret=...\`, 
// Expo Router mounts this screen at the \`/auth\` path.
// It reads the \`action\` query param and instantly forwards the user to the 
// correct screen, passing along the \`userId\` and \`secret\`.
export default function AuthDeepLinkProxy() {
  const params = useLocalSearchParams();
  const action = params.action as string;

  if (action === "verify-email") {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/verify-email",
          params: { userId: params.userId, secret: params.secret },
        }}
      />
    );
  }

  if (action === "reset-password") {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/reset-password",
          params: { userId: params.userId, secret: params.secret },
        }}
      />
    );
  }

  // If the link is malformed or missing an action, send to login as a safe fallback
  return <Redirect href="/(auth)/login" />;
}
