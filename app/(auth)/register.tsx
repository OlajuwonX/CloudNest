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

export default function RegisterScreen() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const router = useRouter();

  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  // read action only, prevents this screen re-rendering on every auth state change.
  const signUp = useAuthStore((s) => s.signUp);

  const validate = (): boolean => {
    if (!name.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters");
      return false;
    }
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
    if (!confirmPassword) {
      toast.error("Please confirm your password");
      return false;
    }
    if (confirmPassword !== password) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsLoading(true);

    // signUp handles: account.create → createEmailPasswordSession → account.get and sets user + isAuthenticated in the store on success.
    const error = await signUp(name.trim(), email.trim(), password);

    setIsLoading(false);

    if (error) {
      toast.error(error);
      return;
    }

    toast.success("Welcome to CloudNest! 🎉");

    router.replace("/(protected)/(tabs)/home");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
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
        <Text style={styles.heading}>
          Create Account{"\n"}
          <Text style={styles.subHeading}>Build your private cloud vault</Text>
        </Text>

        <TextInput
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          keyboardType="default"
          mode="outlined"
          autoComplete="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          style={styles.input}
        />

        <TextInput
          ref={emailRef}
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
          autoComplete="new-password"
          autoCapitalize="none"
          secureTextEntry={!showPassword}
          mode="outlined"
          style={styles.input}
          returnKeyType="next"
          onSubmitEditing={() => confirmPasswordRef.current?.focus()}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword((prev) => !prev)}
            />
          }
        />

        <TextInput
          ref={confirmPasswordRef}
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoComplete="new-password"
          autoCapitalize="none"
          secureTextEntry={!showConfirmPassword}
          style={styles.input}
          mode="outlined"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          right={
            <TextInput.Icon
              icon={showConfirmPassword ? "eye-off" : "eye"}
              onPress={() => setShowConfirmPassword((prev) => !prev)}
            />
          }
        />

        <Button
          title="Sign Up"
          onPress={handleSubmit}
          isLoading={isLoading}
          disabled={isLoading}
          variant="outline"
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: {
    textAlign: "center",
    marginBottom: 12,
    fontSize: 24,
    fontWeight: 500,
  },
  subHeading: {
    textAlign: "center",
    fontSize: 20,
    color: "black",
    lineHeight: 24,
    fontWeight: 500,
  },
  input: {
    marginBottom: 8,
  },
});
