export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  created_at?: string;
  updated_at?: string;
}

export interface CartItem extends Product {
  quantity: number;
}
