import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  Animated,
  ImageBackground,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SplashScreen2() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const contentOpacity = useRef(new Animated.Value(0)).current;
  const contentTranslateY = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    // delay for the background image to render before animating in
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(contentTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    }, 150);

    return () => clearTimeout(timer); // clean up fuction to clear timer.
  }, [contentOpacity, contentTranslateY]);

  const handleGetStarted = () => {
    router.replace("/(auth)/onboarding");
  };

  return (
    <ImageBackground
      source={require("../../assets/images/background.png")}
      style={styles.background}
      resizeMode="cover"
    >
      {/* dark overlay so text is readable */}
      <View style={styles.overlay} />

      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      <Animated.View
        style={[
          { paddingBottom: insets.bottom + (Platform.OS === "ios" ? 24 : 32) },
          {
            opacity: contentOpacity,
            transform: [{ translateY: contentTranslateY }],
          },
        ]}
        className="absolute bottom-0 left-0 right-0 bg-[rgba(255,255,255,0.08)] rounded-t-[32px] pt-8 px-7 border-t border-t-[rgba(255,255,255,0.18)]"
      >
        <View className="self-center bg-[rgba(74,222,128,0.2)] border border-[rgba(74,222,128,0.45)] rounded-full px-[14px] py-[5px] mb-5">
          <Text className="text-[#4ADE80] text-[13px] font-semibold tracking-[0.4px]">
            ☁ CloudNest
          </Text>
        </View>

        <Text className="text-[28px] font-extrabold text-white leading-[36px] tracking-[-0.5px] text-center">
          Save your files in the cloud
        </Text>

        <Text className="mt-3 text-[14px] leading-[20px] text-[rgba(255,255,255,0.72)] font-medium text-center">
          Your personal vault for photos, videos, and documents{"\n"}Private,
          Secure and Always with you.
        </Text>

        <Button
          title="Get Started"
          variant="primary"
          size="lg"
          onPress={handleGetStarted}
          className="mt-6 rounded-[50px]"
        />

        <View className="flex-row justify-center items-center mt-[18px]">
          <Text className="text-[rgba(255,255,255,0.55)] text-[14px]">
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text className="text-[#4ADE80] font-bold text-[14px]">Log in</Text>
          </Pressable>
        </View>
      </Animated.View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 30, 15, 0.52)",
  },
});
