export default async function handler(req: any, res: any) {
  const { upc } = req.query;

  if (!upc) {
    return res.status(400).json({ error: "Missing UPC" });
  }

  try {
    const response = await fetch(
      `https://api.upcitemdb.com/prod/trial/lookup?upc=${upc}`,
    );

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    const item = data.items[0];

    return res.status(200).json({
      name: item.title,
      brand: item.brand,
      image: item.images?.[0] || null,
      upc: item.upc,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Lookup failed" });
  }
}
