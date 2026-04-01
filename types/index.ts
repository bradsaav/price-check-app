export type Offer = {
  retailer: string;
  price: number;
  fulfillment: string;
};

export type Product = {
  upc: string;
  name: string;
  offers: Offer[];
};
export type SavedPriceCheck = {
  id: string;
  upc: string;
  name: string;
  currentPrice: number;
  offers: Offer[];
  recommendation: string;
  createdAt: string;
};