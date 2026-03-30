export async function fetchProductByUpc(upc: string) {
  const url = `https://price-check-app-pi.vercel.app/api/product-lookup?upc=${encodeURIComponent(upc)}`;

  try {
    console.log("Fetching UPC from:", url);

    const response = await fetch(url);

    console.log("Response status:", response.status);

    const text = await response.text();
    console.log("Raw response:", text);

    if (!response.ok) {
      return null;
    }

    return JSON.parse(text);
  } catch (error) {
    console.error("Product lookup failed:", error);
    return null;
  }
}
