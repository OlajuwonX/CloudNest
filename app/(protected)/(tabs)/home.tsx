import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRouter } from "expo-router";
import React from "react";
import { Button, Text, View } from "react-native";

const HomeScreen = () => {
  const signOut = async () => {
    try {
      await account.deleteSession("current"); // Logs out the current session
      toast.success("Signed out successfully!");
      router.replace("/login"); // Redirect to login screen
    } catch (err: any) {
      toast.error(err.message || "Failed to sign out");
    }
  };

  const router = useRouter();
  return (
    <View className="flex-1 justify-center items-center">
      <Text>Home</Text>
      <Button title="Sign Out" onPress={signOut} />
    </View>
  );
};

export default HomeScreen;
