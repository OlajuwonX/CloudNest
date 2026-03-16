import { Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { toast } from "@backpackapp-io/react-native-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    const error = await signIn(data.email, data.password);

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
          style={{
            width: 110,
            height: 110,
            alignSelf: "center",
            marginBottom: 6,
          }}
        />

        <Text style={styles.heading}>
          Welcome back{"\n"}
          <Text style={styles.subHeading}>Please login to continue</Text>
        </Text>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Email"
              placeholder="johndoe@gmail.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              autoComplete="email"
              returnKeyType="next"
              style={styles.input}
              error={!!errors.email}
            />
          )}
        />
        {errors.email && (
          <Text className="text-red-500 text-[12px] mb-2">
            {errors.email.message}
          </Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              mode="outlined"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              style={styles.input}
              error={!!errors.password}
              right={
                <TextInput.Icon
                  icon={showPassword ? "eye-off" : "eye"}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
            />
          )}
        />
        {errors.password && (
          <Text className="text-red-500 text-[12px] mb-2">
            {errors.password.message}
          </Text>
        )}

        <Button
          title={isSubmitting ? "Logging in..." : "Login"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="mt-6"
          accessibilityLabel="Login button"
        />

        <View className="flex-row justify-center items-center mt-[18px]">
          <Text className="text-[rgba(255,255,255,0.55)] text-[14px]">
            Don&apos;t have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/register")}>
            <Text style={styles.signupText}>Sign Up</Text>
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
    fontWeight: "500",
  },
  subHeading: {
    textAlign: "center",
    fontSize: 20,
    color: "black",
    lineHeight: 26,
    fontWeight: "500",
  },
  input: {
    marginBottom: 8,
  },
  signupText: {
    color: "#2d45d1",
    fontWeight: "bold",
    fontSize: 14,
  },
});
