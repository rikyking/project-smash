import type { Ingredient } from "../data/ingredients";
import type { Timestamp } from "firebase/firestore";

export interface Order {
  id: string;
  name: string;
  bread: Ingredient | null;
  meat: Ingredient | null;
  cheese: Ingredient[];
  veg: Ingredient[];
  sauce: Ingredient[];
  totalPrice: number;
  status: "pending" | "ready";
  timestamp: Timestamp | null;
  userId: string;
}