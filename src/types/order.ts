import { Timestamp } from "firebase/firestore";

export interface SelectedItem {
  name: string;
  price: number;
}

export interface Order {
  id?: string;
  timestamp?: Timestamp | null;
  userName?: string;
  username?: string;
  name?: string;
  totalPrice?: number;
  total?: number;
  status?: string;
  createdAt?: Timestamp | null;
  readyAt?: string;
  bread?: SelectedItem;
  meat?: SelectedItem;
  cheese?: SelectedItem[];
  sauce?: SelectedItem[];
}