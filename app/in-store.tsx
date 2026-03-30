import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Screen from "../components/Screen";
import { mockProducts } from "../data/mockProducts";
import type { Offer } from "../types";
import { getRecommendation } from "../utils/recommendation";
import { savePriceCheck } from "../utils/storage";

function findProduct(query: string) {
  const normalized = query.trim().toLowerCase();

  return mockProducts.find(
    (p) => p.upc === normalized || p.name.toLowerCase().includes(normalized),
  );
}

export default function InStoreScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [currentPrice, setCurrentPrice] = useState("");
  const [error, setError] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<null | {
    upc: string;
    name: string;
    offers: Offer[];
    recommendation: string;
    currentPrice: number;
  }>(null);

  function handleCompare() {
    setError("");
    setSaveMessage("");

    const product = findProduct(query);
    const price = Number(currentPrice);

    if (!product) {
      setResult(null);
      setError("Try AirPods, Nintendo, or one of the sample UPCs.");
      return;
    }

    if (!currentPrice || Number.isNaN(price) || price <= 0) {
      setResult(null);
      setError("Enter a valid current store price.");
      return;
    }

    setResult({
      upc: product.upc,
      name: product.name,
      offers: product.offers,
      recommendation: getRecommendation(price, product.offers),
      currentPrice: price,
    });
  }

  async function handleSave() {
    if (!result || isSaving) {
      return;
    }

    try {
      setIsSaving(true);
      setSaveMessage("");

      await savePriceCheck({
        id: Date.now().toString(),
        upc: result.upc,
        name: result.name,
        currentPrice: result.currentPrice,
        offers: result.offers,
        recommendation: result.recommendation,
        createdAt: new Date().toISOString(),
      });

      setSaveMessage("Item saved locally.");
    } catch (error) {
      console.error("Save failed:", error);
      setSaveMessage("Could not save item.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <PrimaryButton label="← Home" onPress={() => router.push("/")} />

        <Text style={{ fontSize: 28, fontWeight: "700" }}>In-Store Mode</Text>
        <Text style={{ fontSize: 16 }}>
          Enter a UPC or product name, then add the current store price.
        </Text>

        <TextInput
          placeholder="UPC or product name"
          value={query}
          onChangeText={setQuery}
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
          }}
        />

        <TextInput
          placeholder="Current store price"
          value={currentPrice}
          onChangeText={setCurrentPrice}
          keyboardType="numeric"
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 10,
            padding: 12,
          }}
        />

        <PrimaryButton label="Compare Prices" onPress={handleCompare} />

        {error ? <Text style={{ color: "crimson" }}>{error}</Text> : null}
        {saveMessage ? (
          <Text
            style={{
              color: saveMessage.includes("Could not") ? "crimson" : "green",
            }}
          >
            {saveMessage}
          </Text>
        ) : null}

        {result && (
          <View style={{ marginTop: 16, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>
              {result.name}
            </Text>
            <Text style={{ fontSize: 16 }}>
              Current store price: ${result.currentPrice.toFixed(2)}
            </Text>

            <View
              style={{
                backgroundColor: "#eef6ff",
                borderWidth: 1,
                borderColor: "#cfe3ff",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <Text style={{ fontWeight: "700" }}>Recommendation</Text>
              <Text>{result.recommendation}</Text>
            </View>

            <PrimaryButton
              label={isSaving ? "Saving..." : "Save Item"}
              onPress={handleSave}
            />

            {result.offers.map((offer) => (
              <View
                key={offer.retailer}
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <Text style={{ fontSize: 18, fontWeight: "600" }}>
                  {offer.retailer}
                </Text>
                <Text>${offer.price.toFixed(2)}</Text>
                <Text style={{ color: "#666" }}>{offer.fulfillment}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
