import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRouter } from "expo-router";
import React from "react";
import { Button, ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ProfileScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const signOut = async () => {
    try {
      await account.deleteSession("current"); // Logs out the current session
      toast.success("Signed out successfully!");
      router.replace("/login"); // Redirect to login screen
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 28,
        justifyContent: "center",
        alignItems: "center",
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold">Profile</Text>
      <Button title="Sign Out" onPress={signOut} />
    </ScrollView>
  );
};

export default ProfileScreen;
