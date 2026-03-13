import { Button, Input } from "@/components/ui";
import { useRouter } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, View } from "react-native";
import { Text } from "react-native-paper";

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const router = useRouter();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <View className="flex-1 p-6 justify-center">
        <Text className="text-center mb-6">Create Account</Text>
        <Input
          label="Full Name"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
          autoCapitalize="none"
          keyboardType="default"
          leftIcon="user"
          mode="outlined"
          autoComplete="name"
          className="mb-4"
        />
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
          className="mb-4"
        />
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          secureTextEntry
          leftIcon="lock"
          mode="outlined"
          className="mb-4"
        />
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          autoCapitalize="none"
          secureTextEntry
          leftIcon="lock"
          className="mb-4"
          mode="outlined"
        />
        <Button
          title="Sign Up"
          onPress={() => {}}
          isLoading={false}
          disabled={false}
          variant="outline"
          className="mt-4"
        />
        <View className="flex-row items-center gap-1">
          <Text>Already have an account?</Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text className="text-primary font-medium">Log In</Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
