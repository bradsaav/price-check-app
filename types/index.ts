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
