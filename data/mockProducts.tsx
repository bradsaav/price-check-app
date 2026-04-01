import type { Product } from "../types";

export const mockProducts: Product[] = [
  {
    upc: "123456789012",
    name: "Apple AirPods Pro (2nd Gen)",
    offers: [
      { retailer: "Amazon", price: 189.99, fulfillment: "Online" },
      { retailer: "Walmart", price: 199.0, fulfillment: "Pickup" },
      { retailer: "Target", price: 194.99, fulfillment: "In Store" },
    ],
  },
  {
    upc: "987654321098",
    name: "Nintendo Switch OLED",
    offers: [
      { retailer: "Amazon", price: 329.99, fulfillment: "Online" },
      { retailer: "Walmart", price: 319.0, fulfillment: "Pickup" },
      { retailer: "Target", price: 324.99, fulfillment: "In Store" },
    ],
  },
];