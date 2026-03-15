import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@backpackapp-io/react-native-toast";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const passwordRef = useRef<any>(null);

  // reads directly from the store to avoid subscribing to the full state object and re-rendering this screen on every state change.
  const signIn = useAuthStore((s) => s.signIn);

  const validate = (): boolean => {
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    const error = await signIn(email.trim(), password);

    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Welcome back! 👋");
    router.replace("/(protected)/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center p-6 bg-background"
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />
      <View className="flex-1 p-7 justify-center">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-16 mx-auto mb-4"
          style={{ height: undefined, aspectRatio: 1 }}
        />

        <Text style={styles.label}>
          Welcome back{"\n"}Please login to continue
        </Text>

        <TextInput
          label="Email"
          placeholder="johndoe@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          mode="outlined"
          autoComplete="email"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          style={styles.input}
        />

        <TextInput
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          mode="outlined"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
          style={{ marginBottom: 10 }}
        />

        <Button
          title="Login"
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          variant="outline"
          className="mt-6 rounded-[50px]"
        />

        <View className="flex-row justify-center items-center mt-[18px]">
          <Text className="text-[rgba(255,255,255,0.55)] text-[14px]">
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text className="text-[#2d45d1] font-bold text-[14px]">
              Sign Up
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  label: {
    textAlign: "center",
    marginBottom: 10,
    fontSize: 24,
    fontWeight: 500,
  },
  input: {
    marginBottom: 8,
  },
});
