import React from "react";
import { ScrollView, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const UploadScreen = () => {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingHorizontal: 28,
        justifyContent: "center",
        alignItems: "center",
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text className="text-3xl font-bold">Upload</Text>
    </ScrollView>
  );
};

export default UploadScreen;
