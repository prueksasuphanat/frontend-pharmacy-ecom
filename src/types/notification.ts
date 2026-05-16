export interface Notification {
  id: number;
  user_id: number | null;
  type: string;
  title: string;
  message: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
}
