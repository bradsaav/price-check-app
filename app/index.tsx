import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Screen from "../components/Screen";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <Screen>
      <View style={{ gap: 16 }}>
        <Text style={{ fontSize: 32, fontWeight: "700" }}>Price Check App</Text>

        <Text style={{ fontSize: 16, color: "#444", lineHeight: 22 }}>
          Compare product prices while shopping and decide whether to buy now or
          somewhere else.
        </Text>

        <PrimaryButton
          label="Start In-Store Mode"
          onPress={() => router.push("/in-store")}
        />
      </View>
    </Screen>
  );
}
