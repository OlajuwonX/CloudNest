import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);

  const router = useRouter();

  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const confirmPasswordRef = useRef<any>(null);

  const handleSubmit = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }
    if (name.length < 6) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Name must be at least 6 characters long",
      });
    }
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must contain at least 8 characters",
      });
    }
    if (confirmPassword !== password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Passwords do not match",
      });
    }
  };

  const theme = useTheme();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
    >
      <View className="flex-1 p-7 justify-center">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-16 mx-auto mb-4"
          style={{ height: undefined, aspectRatio: 1 }}
        />
        <Text style={styles.heading} variant="headlineMedium">
          Create Account
        </Text>
        <TextInput
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
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
              onPress={() => setShowPassword(!showPassword)}
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
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          }
        />
        <Button
          title="Sign Up"
          onPress={handleSubmit}
          isLoading={false}
          disabled={false}
          variant="outline"
          className="mt-6 rounded-3xl"
        />
        <View className="flex-row justify-center text-center gap-1 mt-3">
          <Text>Already have an account?</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text className="text-primary font-medium">Log In</Text>
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
  },
  input: {
    marginBottom: 8,
  },
});
