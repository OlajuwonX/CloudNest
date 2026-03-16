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

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .min(1, "Email is required")
      .email("Please enter a valid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const router = useRouter();
  const signUp = useAuthStore((s) => s.signUp);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    const { name, email, password } = data;

    const error = await signUp(name, email, password);

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
          style={{
            width: 110,
            height: 110,
            alignSelf: "center",
            marginBottom: 6,
          }}
        />

        <Text style={styles.heading}>
          Create Account{"\n"}
          <Text style={styles.subHeading}>Build your private cloud vault</Text>
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoCapitalize="words"
              keyboardType="default"
              mode="outlined"
              autoComplete="name"
              returnKeyType="next"
              style={styles.input}
              error={!!errors.name}
            />
          )}
        />
        {errors.name && (
          <Text className="text-red-500 text-[12px] mb-2">
            {errors.name.message}
          </Text>
        )}

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
              autoComplete="new-password"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              returnKeyType="next"
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

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              autoComplete="new-password"
              autoCapitalize="none"
              secureTextEntry={!showConfirmPassword}
              mode="outlined"
              style={styles.input}
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
              error={!!errors.confirmPassword}
              right={
                <TextInput.Icon
                  icon={showConfirmPassword ? "eye-off" : "eye"}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              }
            />
          )}
        />
        {errors.confirmPassword && (
          <Text className="text-red-500 text-[12px] mb-2">
            {errors.confirmPassword.message}
          </Text>
        )}

        <Button
          title={isSubmitting ? "Signing Up..." : "Sign Up"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          hideSpinner={true}
          size="lg"
          className="mt-6"
          accessibilityLabel="Sign up button"
        />

        <View className="flex-row justify-center items-center mt-[18px]">
          <Text className="text-[rgba(255,255,255,0.55)] text-[14px]">
            Already have an account?{" "}
          </Text>
          <Pressable onPress={() => router.push("/login")}>
            <Text style={styles.loginText}>Log in</Text>
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
  loginText: {
    color: "#14532D",
    fontWeight: "bold",
    fontSize: 14,
  },
});
