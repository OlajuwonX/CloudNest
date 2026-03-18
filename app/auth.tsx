import { Redirect, useLocalSearchParams } from "expo-router";

export default function AuthDeepLinkProxy() {
  const params = useLocalSearchParams();

  const action = params.action as string | undefined;
  const userId = params.userId as string | undefined;
  const secret = params.secret as string | undefined;

  // missing required params → fallback safely
  if (!action || !userId || !secret) {
    return <Redirect href="/(auth)/login" />;
  }

  if (action === "verify-email") {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/verify-email",
          params: { userId, secret },
        }}
      />
    );
  }

  if (action === "reset-password") {
    return (
      <Redirect
        href={{
          pathname: "/(auth)/reset-password",
          params: { userId, secret },
        }}
      />
    );
  }

  // Unknown action → fallback
  return <Redirect href="/(auth)/login" />;
}

// this screen acts as a transparent router. When Appwrite redirects the user
// to \`cloudnest://auth?action=verify-email&userId=...&secret=...\`,
// expo router mounts this screen at the \`/auth\` path.
// it reads the \`action\` query param and instantly forwards the user to the
// correct screen, passing along the \`userId\` and \`secret\`.
