import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import PrimaryButton from "../components/PrimaryButton";
import Screen from "../components/Screen";
import { mockProducts } from "../data/mockProducts";
import type { Offer } from "../types";
import { fetchProductByUpc } from "../utils/productApi";
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
  const [permission, requestPermission] = useCameraPermissions();
  const [scannerOpen, setScannerOpen] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

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

  async function handleCompare() {
    setError("");
    setSaveMessage("");

    const trimmedQuery = query.trim();
    const price = Number(currentPrice);

    if (!trimmedQuery) {
      setResult(null);
      setError("Enter a UPC or product name.");
      return;
    }

    if (!currentPrice || Number.isNaN(price) || price <= 0) {
      setResult(null);
      setError("Enter a valid current store price.");
      return;
    }

    const isLikelyUpc = /^\d{8,14}$/.test(trimmedQuery);

    if (isLikelyUpc) {
      const apiResult = await fetchProductByUpc(trimmedQuery);

      if (!apiResult.ok) {
        setResult(null);
        setError(`Lookup failed: ${apiResult.error}`);
        return;
      }

      const apiProduct = apiResult.data;

      const offers = [
        { retailer: "Amazon", price: 189.99, fulfillment: "Online" },
        { retailer: "Walmart", price: 199.0, fulfillment: "Pickup" },
        { retailer: "Target", price: 194.99, fulfillment: "In Store" },
      ];

      setResult({
        upc: apiProduct.upc || trimmedQuery,
        name: apiProduct.name || "Unknown Product",
        offers,
        recommendation: getRecommendation(price, offers),
        currentPrice: price,
      });

      setError("");
      return;
    }

    const product = findProduct(trimmedQuery);

    if (!product) {
      setResult(null);
      setError("Product not found in local sample data.");
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
    } catch (saveError) {
      console.error("Save failed:", saveError);
      setSaveMessage("Could not save item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleOpenScanner() {
    setError("");
    setSaveMessage("");

    if (!permission) {
      return;
    }

    if (!permission.granted) {
      const response = await requestPermission();

      if (!response.granted) {
        setError("Camera permission is required to scan barcodes.");
        return;
      }
    }

    setHasScanned(false);
    setScannerOpen(true);
  }

  async function handleBarcodeScanned({ data }: { data: string }) {
    if (hasScanned) return;

    setHasScanned(true);
    setScannerOpen(false);

    setQuery(data);

    const product = await fetchProductByUpc(data);

    if (product) {
      setError(`Found: ${product.name}`);
    } else {
      setError(`Scanned UPC: ${data}`);
    }
  }

  if (scannerOpen) {
    return (
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["upc_a", "upc_e", "ean13", "ean8"],
          }}
        />

        <View
          style={{
            position: "absolute",
            top: 60,
            left: 16,
            right: 16,
            gap: 12,
          }}
        >
          <PrimaryButton
            label="Close Scanner"
            onPress={() => {
              setScannerOpen(false);
              setHasScanned(false);
            }}
          />

          <View
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: 12,
              borderRadius: 12,
            }}
          >
            <Text style={{ color: "#fff", textAlign: "center" }}>
              Point camera at barcode
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <PrimaryButton label="← Home" onPress={() => router.back()} />
        <PrimaryButton
          label="View History"
          onPress={() => router.push("/history")}
        />

        <Text style={{ fontSize: 28, fontWeight: "700" }}>In-Store Mode</Text>
        <Text style={{ fontSize: 16 }}>
          Scan a barcode or enter a UPC/product name, then add the current store
          price.
        </Text>

        <PrimaryButton
          label="Open Barcode Scanner"
          onPress={handleOpenScanner}
        />

        <TextInput
          placeholder="UPC or product name"
          placeholderTextColor="#666"
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
          placeholderTextColor="#666"
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

        {error ? (
          <Text
            style={{ color: error.startsWith("Scanned") ? "#444" : "crimson" }}
          >
            {error}
          </Text>
        ) : null}

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
