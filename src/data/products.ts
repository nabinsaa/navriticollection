export interface Product {
  id: number;
  name: string;
  origin: string;
  region: string;
  category: string;
  price: number;
  weight: string;
  material: string;
  process: string;
  size: string;
  color: string[];
  description: string;
  story: string;
  image: string;
  rating: number;
  reviews: number;
  intensity: number;
  tags: string[];
  stock_quantity?: number;
  low_stock_threshold?: number;
  sku?: string;
  discount_price?: number;
  is_featured?: boolean;
  is_new_arrival?: boolean;
  is_bestseller?: boolean;
  additional_images?: string[];
}

export const products: Product[] = [];

export const categories = [
  'All',
  'Saree',
  'Kurti',
  'Suit Set',
  'Dupatta',
  'Lehenga',
  'Gown',
];
