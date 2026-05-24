export interface WishlistItem {
  id: number;
  product_id: number;
  added_at: string;
  product: {
    id: number;
    name: string;
    code: string;
    quantity: number;
    image_url: string | null;
    units: Array<{
      id: number;
      unit: { id: number; name: string };
      price: number;
      is_special_price: boolean;
    }>;
  };
}
