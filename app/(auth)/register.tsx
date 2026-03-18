import { Button } from "@/components/ui";
import { account } from "@/lib/appwrite";
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
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setFocus,
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

  const onSignup = async (data: RegisterFormData) => {
    const { name, email, password } = data;

    const error = await signUp(name, email, password);

    if (error) {
      toast.error(error);
      return;
    }

    try {
      // Send verification email using the universal deep link scheme with query params
      await account.createVerification(
        "https://cloudnest-auth-bridge.vercel.app/auth?action=verify-email",
      );
      toast.success("Check your email to verify your account!");
    } catch (err: any) {
      toast.error(err.message || "Failed to send verification email");
    }

    toast.success("Welcome to CloudNest! 🎉");
    router.replace("/(auth)/check-email");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background"
      keyboardVerticalOffset={insets.top}
    >
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingHorizontal: 28,
          justifyContent: "center",
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Full Name"
              placeholder="John Doe"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              blurOnSubmit={false}
              autoCapitalize="words"
              keyboardType="default"
              mode="outlined"
              autoComplete="name"
              returnKeyType="next"
              onSubmitEditing={() => setFocus("email")}
              style={styles.input}
              error={!!errors.name}
            />
          )}
        />
        {errors.name && (
          <Text style={styles.errorText}>{errors.name.message}</Text>
        )}

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Email"
              placeholder="johndoe@gmail.com"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              blurOnSubmit={false}
              autoCapitalize="none"
              keyboardType="email-address"
              mode="outlined"
              autoComplete="email"
              returnKeyType="next"
              onSubmitEditing={() => setFocus("password")}
              style={styles.input}
              error={!!errors.email}
            />
          )}
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email.message}</Text>
        )}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
              label="Password"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              blurOnSubmit={false}
              autoComplete="new-password"
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              mode="outlined"
              style={styles.input}
              returnKeyType="next"
              onSubmitEditing={() => setFocus("confirmPassword")}
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
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value, ref } }) => (
            <TextInput
              ref={ref}
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
              onSubmitEditing={handleSubmit(onSignup)}
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
          <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
        )}

        <Button
          title={isSubmitting ? "Signing Up..." : "Sign Up"}
          onPress={handleSubmit(onSignup)}
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
      </ScrollView>
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
  loginText: {
    color: "#14532D",
    fontWeight: "bold",
    fontSize: 14,
  },
});

// instead of using useRef to set keyboard focus on inputs as used before
// use react hook forms setFocus to set the focus to each inputs.
// then pass the ref into the controller and then into the inputs.
