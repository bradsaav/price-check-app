import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedPriceCheck } from "../types";

const SAVED_CHECKS_KEY = "saved-price-checks";

export async function getSavedPriceChecks(): Promise<SavedPriceCheck[]> {
  try {
    const raw = await AsyncStorage.getItem(SAVED_CHECKS_KEY);

    if (!raw) {
      return [];
    }

    return JSON.parse(raw) as SavedPriceCheck[];
  } catch (error) {
    console.error("Failed to load saved price checks:", error);
    return [];
  }
}

export async function savePriceCheck(item: SavedPriceCheck): Promise<void> {
  try {
    const existing = await getSavedPriceChecks();
    const updated = [item, ...existing];
    await AsyncStorage.setItem(SAVED_CHECKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save price check:", error);
    throw error;
  }
}

export async function deleteSavedPriceCheck(id: string): Promise<void> {
  try {
    const existing = await getSavedPriceChecks();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(SAVED_CHECKS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to delete price check:", error);
    throw error;
  }
}

export async function clearSavedPriceChecks(): Promise<void> {
  try {
    await AsyncStorage.removeItem(SAVED_CHECKS_KEY);
  } catch (error) {
    console.error("Failed to clear saved price checks:", error);
    throw error;
  }
}
