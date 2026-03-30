import { PropsWithChildren } from "react";
import { SafeAreaView, View } from "react-native";

export default function Screen({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, padding: 24 }}>{children}</View>
    </SafeAreaView>
  );
}
