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
import { Text, TextInput } from "react-native-paper";
import Toast from "react-native-toast-message";

export default function LoginScreen() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const passwordRef = useRef<any>(null);

  const handleSubmit = async () => {
    if (!email || !password) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please fill in all fields.",
      });
      return;
    }
    if (password.length < 8) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Password must contain at least 8 characters",
      });
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center p-6 bg-background"
    >
      <View className="flex-1 p-7  justify-center">
        <Image
          source={require("../../assets/images/icon.png")}
          className="w-16 mx-auto mb-4"
          style={{ height: undefined, aspectRatio: 1 }}
        />
        <Text style={styles.heading} variant="headlineMedium">
          Log in
        </Text>
        <Text style={styles.label} variant="titleMedium">
          Welcome back, please login to continue
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
          returnKeyType="done"
          onSubmitEditing={() => passwordRef.current?.focus()}
          style={styles.input}
        />
        <TextInput
          ref={passwordRef}
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          mode="outlined"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          right={
            <TextInput.Icon
              icon={showPassword ? "eye-off" : "eye"}
              onPress={() => setShowPassword(!showPassword)}
            />
          }
          style={{ marginBottom: 10 }}
        />
        <Button
          title="Login"
          onPress={handleSubmit}
          isLoading={false}
          disabled={false}
          variant="outline"
          className="mt-6 rounded-3xl"
        />
        <View className="flex-row justify-center text-center gap-1 mt-3">
          <Text>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text className="text-primary font-medium">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  heading: {
    textAlign: "center",
    marginBottom: 4,
  },
  label: {
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    marginBottom: 8,
  },
});
