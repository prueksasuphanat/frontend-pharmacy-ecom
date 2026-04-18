export interface Notification {
  id: string;
  user_id: string;
  type: "order" | "system" | "promotion";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}
