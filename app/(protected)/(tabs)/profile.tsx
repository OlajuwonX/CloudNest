import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const ProfileScreen = () => {
  const router = useRouter();
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
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl font-bold">Profile</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

export default ProfileScreen;
