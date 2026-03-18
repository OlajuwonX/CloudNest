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
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { Text, TextInput } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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
  const insets = useSafeAreaInsets();

  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    setFocus,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const login = async (data: LoginFormData) => {
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
          Welcome back{"\n"}
          <Text style={styles.subHeading}>Please login to continue</Text>
        </Text>

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
              blurOnSubmit={false}
              onBlur={onBlur}
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
              autoCapitalize="none"
              secureTextEntry={!showPassword}
              mode="outlined"
              returnKeyType="done"
              onSubmitEditing={handleSubmit(login)}
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
          <Text style={styles.errorText}>{errors.password.message}</Text>
        )}
        <Pressable onPress={() => router.push("/forgot-password")}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>
        <Button
          title={isSubmitting ? "Logging in..." : "Login"}
          onPress={handleSubmit(login)}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="mt-6"
          hideSpinner={true}
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
  forgotPasswordText: {
    color: "#2d45d1",
    fontWeight: "400",
    fontSize: 14,
    textAlign: "right",
  },
  signupText: {
    color: "#2d45d1",
    fontWeight: "bold",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginBottom: 8,
  },
});

// instead of using useRef to set keyboard focus on inputs as used before
// use react hook forms setFocus to set the focus to each inputs.
// Then pass the ref into the controller and then into the inputs.
