import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { StatusBar, Text, View } from "react-native";
import { ActivityIndicator } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function VerifyEmailScreen() {
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const userId = params.userId as string;
  const secret = params.secret as string;
  const router = useRouter();

  useEffect(() => {
    const verifyEmail = async () => {
      // time to settle before triggering the API
      if (!userId || !secret) {
        toast.error("Invalid or missing verification parameters.");
        router.replace("/(auth)/login");
        return;
      }

      try {
        await account.updateVerification(userId, secret);
        toast.success("Email verified successfully! 🎉");
        router.replace("/(protected)/(tabs)/home");
      } catch (err: any) {
        toast.error(err.message || "Failed to verify email");
        router.replace("/(auth)/login");
      }
    };

    verifyEmail();
  }, [userId, secret, router]);

  return (
    <View
      className="flex-1 justify-center items-center bg-[#F8FAFC]"
      style={{
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <ActivityIndicator
        size="large"
        color="#14532D"
        style={{ marginBottom: 20 }}
      />
      <Text className="text-[18px] font-semibold text-[#0F172A]">
        Verifying your email...
      </Text>
    </View>
  );
}
