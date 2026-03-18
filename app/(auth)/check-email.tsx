import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { ActivityIndicator, Button, Text } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CheckEmailScreen() {
  const router = useRouter();
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const insets = useSafeAreaInsets();

  const handleContinue = async () => {
    setChecking(true);
    try {
      const user = await account.get();
      if (user.emailVerification) {
        router.replace("/(protected)/(tabs)/home");
      } else {
        toast.error(
          "Email not verified yet. Check your inbox and tap the link.",
        );
      }
    } catch (err: any) {
      toast.error(err.message || "Could not check verification status");
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await account.createVerification(
        "https://cloudnest-auth-bridge.vercel.app/auth?action=verify-email",
      );
      toast.success("Verification email resent!");
    } catch (err: any) {
      toast.error(err.message || "Failed to resend verification email");
    } finally {
      setResending(false);
    }
  };

  return (
    <View
      className="flex-1 justify-center items-center bg-[#F8FAFC] px-8"
      style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <Image
        source={require("../../assets/images/icon.png")}
        style={styles.logo}
      />

      <Text style={styles.heading}>Check your email</Text>
      <Text style={styles.body}>
        We sent a verification link to your inbox. Tap the link in the email to
        confirm your account, then come back here to continue.
      </Text>

      <Button
        mode="contained"
        onPress={handleContinue}
        disabled={checking}
        style={styles.primaryBtn}
        contentStyle={styles.btnContent}
        labelStyle={styles.btnLabel}
      >
        {checking ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          "I've verified my email"
        )}
      </Button>

      <Button
        mode="text"
        onPress={handleResend}
        disabled={resending}
        style={styles.resendBtn}
        labelStyle={styles.resendLabel}
      >
        {resending ? (
          <ActivityIndicator size="small" color="#14532D" />
        ) : (
          "Resend verification email"
        )}
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 90,
    height: 90,
    marginBottom: 24,
  },
  heading: {
    fontSize: 22,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  body: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  primaryBtn: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#14532D",
    marginBottom: 12,
  },
  btnContent: {
    height: 48,
  },
  btnLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  resendBtn: {
    width: "100%",
  },
  resendLabel: {
    color: "#14532D",
    fontSize: 14,
  },
});
