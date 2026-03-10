import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl text-primary font-medium">Welcome to CloudNest!</Text>
      <Link href="/onboarding">Onboarding</Link>

    </View>
  );
}
