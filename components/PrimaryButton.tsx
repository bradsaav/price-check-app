import { Pressable, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
};

export default function PrimaryButton({ label, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: "#111",
        padding: 14,
        borderRadius: 10,
        alignItems: "center",
      }}
    >
      <Text style={{ color: "#fff", fontWeight: "600", fontSize: 16 }}>
        {label}
      </Text>
    </Pressable>
  );
}
