import { Link, Redirect } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  const isAuthenticated = false;

  if (isAuthenticated) {
    return <Redirect href="/(protected)/(tabs)/home" />;
  }

  return (
    <View className="flex-1 justify-center items-center">
      <Text className="text-3xl text-primary font-medium">
        Welcome to CloudNest!
      </Text>
      <Link href="/register">Login / Sign Up</Link>
      <Link href="/onboarding">Onboarding</Link>
    </View>
  );
}
