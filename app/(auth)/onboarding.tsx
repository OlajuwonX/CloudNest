import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

// ─────────────────────────────────────────────────────────────────────────────
// TODO: Replace this placeholder with the full 3-slide onboarding carousel.
//
// Planned flow:
//   Slide 1 → "Your Private Cloud"
//   Slide 2 → "Upload Anything"
//   Slide 3 → "Free Up Space" → navigates to /(auth)/login
// ─────────────────────────────────────────────────────────────────────────────

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Onboarding</Text>
      <Text style={styles.subtitle}>
        The full carousel will be built here next.
      </Text>
      <Button
        title="Go to Login"
        variant="primary"
        size="lg"
        className="mt-8 rounded-2xl"
        onPress={() => router.replace("/(auth)/login")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    backgroundColor: "#F8FAFC",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#14532D",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
});
