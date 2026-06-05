export interface Ingredient {
  name: string;
  price: number;
  image: string;
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
    { name: "Pane dolce", price: 1.50 , image: "../public/panino.jpg" },
    // {
    //   name: "Panino al Sesamo", price: 1.75,
    //   image: ""
    // },
    // { name: "Panino Integrale", price: 2.00 },
  ],
  meat: [
    {
      name: "Manzo (150g)", price: 3.00,
      image: "../public/manzo.png"
    },
    // {
    //   name: "Scusate siamo povere c'è solo il Manzo", price: 0,
    //   image: ""
    // },
    // { name: "Doppio Manzo (2 X 100g)", price: 5.00 },
    // { name: "Pollo Grigliato", price: 2.80 },
    // { name: "Vegetariano", price: 2.50 },
  ],
  cheese: [
    {
      name: "Cheddar", price: 0.80,
      image: "../public/cheddar.png"
    },
    // {
    //   name: "Scamorza affumicata", price: 1.00,
    //   image: ""
    // },
  ],
  veg: [
    {
      name: "Lattuga", price: 0.30,
      image: "../public/lattuga.webp"
    },
    {
      name: "Pomodoro", price: 0.40,
      image: "../public/pomodoro.png"
    },
    {
      name: "Cipolla croccante", price: 0.60,
      image: "../public/cipolla.png"
    },
    {
      name: "Bacon Super Croccante", price: 1.20,
      image: "../public/bacon.png"
    },
  ],
  sauce: [
    {
      name: "Ketchup", price: 0.20,
      image: "../public/ketchup.png"
    },
    {
      name: "Maionese", price: 0.20,
      image: "../public/maionese.png"
    },
    {
      name: "Salsa BBQ", price: 0.50,
      image: "../public/salsa-bbq.png"
    },
    {
      name: "Salsa Burger", price: 0.70,
      image: "../public/salsa-burger.png"
    },
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