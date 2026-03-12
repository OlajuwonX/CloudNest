import { Input } from "@/components/ui";
import { KeyboardAvoidingView, Platform, View } from "react-native";
import { Text } from "react-native-paper";



export default function AuthScreen() {

    return (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View>
                <Text>Create Account</Text>

                <Input label="Email" placeholder="johndoe@gmail.com" />
            </View>
        </KeyboardAvoidingView>
    )
}