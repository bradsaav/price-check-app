import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Screen from "../components/Screen";
import type { SavedPriceCheck } from "../types";
import {
    clearSavedPriceChecks,
    deleteSavedPriceCheck,
    getSavedPriceChecks,
} from "../utils/storage";

export default function HistoryScreen() {
  const router = useRouter();
  const [items, setItems] = useState<SavedPriceCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const saved = await getSavedPriceChecks();
      setItems(saved);
    } catch (error) {
      console.error("Failed to load history:", error);
      setMessage("Could not load history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, [loadItems]),
  );

  async function handleDelete(id: string) {
    try {
      await deleteSavedPriceCheck(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setMessage("Item deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      setMessage("Could not delete item.");
    }
  }

  async function handleClearAll() {
    try {
      await clearSavedPriceChecks();
      setItems([]);
      setMessage("History cleared.");
    } catch (error) {
      console.error("Clear history failed:", error);
      setMessage("Could not clear history.");
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <PrimaryButton label="← Home" onPress={() => router.push("/")} />

        <Text style={{ fontSize: 28, fontWeight: "700" }}>History</Text>
        <Text style={{ fontSize: 16 }}>
          View your saved price checks from this device.
        </Text>

        <PrimaryButton label="Refresh" onPress={loadItems} />

        {items.length > 0 ? (
          <PrimaryButton label="Clear All History" onPress={handleClearAll} />
        ) : null}

        {message ? (
          <Text
            style={{
              color: message.includes("Could not") ? "crimson" : "green",
            }}
          >
            {message}
          </Text>
        ) : null}

        {loading ? <Text>Loading saved items...</Text> : null}

        {!loading && items.length === 0 ? (
          <View
            style={{
              borderWidth: 1,
              borderColor: "#ddd",
              borderRadius: 12,
              padding: 16,
            }}
          >
            <Text style={{ fontWeight: "700", marginBottom: 6 }}>
              No saved items yet
            </Text>
            <Text style={{ color: "#666" }}>
              Save a product from In-Store Mode and it will appear here.
            </Text>
          </View>
        ) : null}

        {items.map((item) => {
          const cheapest = item.offers.reduce((min, offer) =>
            offer.price < min.price ? offer : min,
          );

          return (
            <View
              key={item.id}
              style={{
                borderWidth: 1,
                borderColor: "#ddd",
                borderRadius: 12,
                padding: 16,
                gap: 8,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "700" }}>
                {item.name}
              </Text>

              <Text>
                <Text style={{ fontWeight: "600" }}>UPC:</Text> {item.upc}
              </Text>

              <Text>
                <Text style={{ fontWeight: "600" }}>Current store price:</Text>{" "}
                ${item.currentPrice.toFixed(2)}
              </Text>

              <Text>
                <Text style={{ fontWeight: "600" }}>Best outside price:</Text> $
                {cheapest.price.toFixed(2)} at {cheapest.retailer}
              </Text>

              <View
                style={{
                  backgroundColor: "#eef6ff",
                  borderWidth: 1,
                  borderColor: "#cfe3ff",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontWeight: "700" }}>Recommendation</Text>
                <Text>{item.recommendation}</Text>
              </View>

              <Text style={{ color: "#666" }}>
                Saved: {new Date(item.createdAt).toLocaleString()}
              </Text>

              <PrimaryButton
                label="Delete Item"
                onPress={() => handleDelete(item.id)}
              />
            </View>
          );
        })}
      </ScrollView>
    </Screen>
  );
}
