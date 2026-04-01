const BASE_URL = "http://192.168.1.37:3001";

export async function fetchProductByUpc(upc: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/api/product-lookup?upc=${encodeURIComponent(upc)}`,
    );

    const text = await response.text();

    let parsed: any = null;

    try {
      parsed = JSON.parse(text);
    } catch {
      return {
        ok: false,
        error: "Backend returned invalid JSON",
      };
    }

    if (!response.ok || !parsed?.ok) {
      return {
        ok: false,
        error: parsed?.error || `HTTP ${response.status}`,
      };
    }

    return parsed;
  } catch (error: any) {
    console.error("Product lookup failed:", error);

    return {
      ok: false,
      error: error?.message || "Network request failed",
    };
  }
}
