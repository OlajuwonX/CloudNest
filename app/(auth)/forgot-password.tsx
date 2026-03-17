import { Button } from "@/components/ui";
import { account } from "@/lib/appwrite";
import { toast } from "@backpackapp-io/react-native-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "expo-router";
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

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await account.createRecovery(
        data.email,
        "cloudnest://auth?action=reset-password",
      );
      toast.success("Check your email to reset your password!");
      router.replace("/(auth)/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to send recovery email");
    }
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
          Forgot Password?{"\n"}
          <Text style={styles.subHeading}>
            We&apos;ll send you a recovery link
          </Text>
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
              returnKeyType="done"
              onSubmitEditing={handleSubmit(onSubmit)}
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

        <Button
          title={isSubmitting ? "Sending..." : "Send Recovery Email"}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          variant="primary"
          size="lg"
          className="mt-6"
          hideSpinner={true}
          accessibilityLabel="Send Recovery Email button"
        />

        <View className="flex-row justify-center items-center mt-[18px]">
          <Text className="text-[rgba(255,255,255,0.55)] text-[14px]">
            Remembered your password?{" "}
          </Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
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
    color: "#2d45d1",
    fontWeight: "bold",
    fontSize: 14,
  },
});
