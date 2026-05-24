export interface Ingredient {
  name: string;
  price: number;
}

export interface IngredientsData {
  bread: Ingredient[];
  meat: Ingredient[];
  cheese: Ingredient[];
  veg: Ingredient[];
  sauce: Ingredient[];
}

export const ingredients: IngredientsData = {
  bread: [
    { name: "Pane dolce", price: 1.50 },
    { name: "Panino al Sesamo", price: 1.75 },
    // { name: "Panino Integrale", price: 2.00 },
  ],
  meat: [
    { name: "Manzo (100g)", price: 3.00 },
    { name: "Scusate siamo povere c'è solo il Manzo", price: 0 },
    // { name: "Doppio Manzo (2 X 100g)", price: 5.00 },
    // { name: "Pollo Grigliato", price: 2.80 },
    // { name: "Vegetariano", price: 2.50 },
  ],
  cheese: [
    { name: "Cheddar", price: 0.80 },
    { name: "Scamorza affumicata", price: 1.00 },
  ],
  veg: [
    { name: "Lattuga", price: 0.30 },
    { name: "Pomodoro", price: 0.40 },
    { name: "Cipolla croccante", price: 0.60 },
    { name: "Bacon Super Croccante", price: 1.20 },
  ],
  sauce: [
    { name: "Ketchup", price: 0.20 },
    { name: "Maionese", price: 0.20 },
    { name: "Salsa BBQ", price: 0.50 },
    { name: "Salsa Speciale", price: 0.70 },
  ],
};

export interface SelectedIngredients {
  bread: Ingredient | null;
  meat: Ingredient | null;
  cheese: Ingredient[];
  veg: Ingredient[];
  sauce: Ingredient[];
}

export const emptySelection: SelectedIngredients = {
  bread: null,
  meat: null,
  cheese: [],
  veg: [],
  sauce: [],
};