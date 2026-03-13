import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { Text } from "react-native-paper";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="">
        <Text className="">Welcome Back</Text>
        <Input
          label="Email"
          placeholder="johndoe@gmail.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          leftIcon="mail"
          mode="outlined"
          autoComplete="email"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          leftIcon="lock"
          mode="outlined"
        />
        <Button
          title="Login"
          onPress={() => {}}
          isLoading={false}
          disabled={false}
          variant="outline"
        />
        <View className="flex-row items-center gap-1">
          <Text>Don&apos;t have an account?</Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text className="text-primary font-medium">Sign Up</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
