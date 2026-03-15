import { useAuthStore } from "@/stores/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";

const GRADIENT_HOLD = 800;
const LOGO_FADE_IN = 600;
const LOGO_HOLD = 900;
const LOGO_FADE_OUT = 400;

export default function SplashScreen1() {
  const router = useRouter();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // ── Step 1: wait for GRADIENT_HOLD, then animate the logo in ── //
    const fadeIn = Animated.sequence([
      Animated.delay(GRADIENT_HOLD),
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: LOGO_FADE_IN,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          speed: 6,
          bounciness: 4,
          useNativeDriver: true,
        }),
      ]),
    ]);

    // ── Step 2: Hold, then fade out ── //
    const fadeOut = Animated.sequence([
      Animated.delay(LOGO_HOLD),
      Animated.timing(logoOpacity, {
        toValue: 0,
        duration: LOGO_FADE_OUT,
        useNativeDriver: true,
      }),
    ]);

    // ── Step 3: Run the full sequence, then navigate ─── //
    // We read auth state via getState() (not a hook) so we don't need to
    // subscribe to the store or cause any re-renders here.
    Animated.sequence([fadeIn, fadeOut]).start(() => {
      const { isAuthenticated, isLoading } = useAuthStore.getState();

      if (!isLoading && isAuthenticated) {
        // Returning user — skip the intro flow entirely
        router.replace("/(protected)/(tabs)/home");
      } else {
        // New user, logged-out user, or (rare) still-loading on slow network.
        router.replace("/(splash-screen)/screen2");
      }
    });
  }, [logoOpacity, logoScale, router]);

  return (
    <LinearGradient
      colors={["#14532D", "#166534", "#16A34A", "#4ADE80"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.logoWrapper}>
        <Animated.Image
          source={require("../../assets/images/icon.png")}
          style={[
            styles.logo,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoWrapper: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 110,
    height: 110,
  },
});

// calling useAuthStore.getState() inside the animation callback reads the current Zustand snapshot
// synchronously without subscribing to the store or triggering any re-renders.
// It's the correct way to access Zustand state outside of the React render cycle.
// Edge case (very slow network): If checkSession still hasn't resolved after 2.3s (unusual),
// isLoading will still be true, so we fall through to screen2. This is safe because the (protected)/_layout.tsx
// has its own isAuthenticated guard as a backstop — the user simply won't be able to reach protected screens without a session.
