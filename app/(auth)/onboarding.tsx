import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StatusBar,
  Text,
  useWindowDimensions,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SLIDES = [
  {
    key: "1",
    image: require("../../assets/images/onboarding1.webp"),
    title: "Your Private Cloud",
    subtitle: "Store your files securely in your own private cloud storage.",
  },
  {
    key: "2",
    image: require("../../assets/images/onboarding2.webp"),
    title: "Upload Anything",
    subtitle:
      "Upload photos, videos, PDFs, and more seamlessly. Accessible anywhere and anytime.",
  },
  {
    key: "3",
    image: require("../../assets/images/onboarding3.webp"),
    title: "Free Up Space",
    subtitle:
      "Backup your files to the cloud and free up space on your device.",
  },
] as const;

// ─── dot component ──── //
function Dot({ index, activeIndex }: { index: number; activeIndex: number }) {
  // animated width: active → 24px pill, adjacent → 8px, rest → 6px
  const animatedStyle = useAnimatedStyle(() => {
    const width = withTiming(activeIndex === index ? 24 : 8, { duration: 300 });
    const opacity = withTiming(activeIndex === index ? 1 : 0.35, {
      duration: 300,
    });
    return { width, opacity };
  });

  return (
    <Animated.View
      style={[animatedStyle, { backgroundColor: "#14532D" }]}
      className="h-2 rounded-full"
    />
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 60 });

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const goToNext = () => {
    const next = activeIndex + 1;
    if (next < SLIDES.length) {
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
    }
  };

  const handleSkip = () => router.replace("/(auth)/login");
  const handleSignUp = () => router.replace("/(auth)/register");

  const isLastSlide = activeIndex === SLIDES.length - 1;

  const renderSlide = ({ item }: { item: (typeof SLIDES)[number] }) => (
    <View style={{ width: SCREEN_WIDTH }} className="overflow-hidden">
      <Image
        source={item.image}
        style={{ width: SCREEN_WIDTH }}
        resizeMode="cover"
        className="flex-1 rounded-b-[32px]"
        fadeDuration={300}
      />
    </View>
  );

  return (
    <View
      style={{ paddingBottom: insets.bottom + 24 }}
      className="flex-1 bg-slate-50"
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {!isLastSlide && (
        <Pressable
          onPress={handleSkip}
          style={{ top: insets.top + 16 }}
          hitSlop={12}
          className="absolute right-6 z-10"
        >
          <Text className="text-[15px] text-gray-200 font-medium">Skip</Text>
        </Pressable>
      )}

      <FlatList
        ref={flatListRef}
        data={SLIDES as unknown as (typeof SLIDES)[number][]}
        keyExtractor={(item) => item.key}
        renderItem={renderSlide}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToAlignment="center"
        bounces={false}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig.current}
        style={{ height: SCREEN_HEIGHT * 0.65 }}
        className="grow-0 shrink-0"
        initialNumToRender={1}
        maxToRenderPerBatch={1}
        windowSize={2}
      />

      <View className="flex-1 px-7 pt-7">
        <Text className="text-[26px] font-extrabold text-slate-900 text-center tracking-[-0.3px]">
          {SLIDES[activeIndex].title}
        </Text>
        <Text className="text-[15px] text-gray-500 text-center leading-[22px] mt-2.5 px-2">
          {SLIDES[activeIndex].subtitle}
        </Text>

        <View className="flex-row items-center justify-center gap-1.5 mt-6">
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} activeIndex={activeIndex} />
          ))}
        </View>

        {isLastSlide ? (
          <Button
            title="Sign Up"
            variant="primary"
            size="lg"
            onPress={handleSignUp}
            className="rounded-[50px] mt-6"
          />
        ) : (
          <Button
            title="Next"
            variant="primary"
            size="lg"
            onPress={goToNext}
            className="rounded-[50px] mt-6"
          />
        )}

        {isLastSlide && (
          <View className="flex-row justify-center items-center mt-4">
            <Text className="text-gray-500 text-[14px]">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={handleSkip} hitSlop={8}>
              <Text className="text-green-900 text-[14px] font-bold">
                Log in
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

// ── viewability tracking [viewabilityConfig] ─── //
// useCallback + useRef are critical here: FlatList requires the
// onViewableItemsChanged callback and viewabilityConfig to be stable
// references (created before mount). Inline functions cause a RN crash.
