import paninoImg from '../assets/panino.jpg';
import manzoImg from '../assets/manzo.png';
import cheddarImg from '../assets/cheddar.png';
import lattugaImg from '../assets/lattuga.webp';
import pomodoriImg from '../assets/pomodoro.png';
//import cipollaImg from '../assets/cipolla.png';
import baconImg from '../assets/bacon.png';
import ketchupImg from '../assets/ketchup.png';
import maioneseImg from '../assets/maionese.png';
import salsaBbqImg from '../assets/salsa-bbq.png';
import salsaBurgerImg from '../assets/salsa-speciale.png';

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
    { name: "Pane dolce", price: 1.50 , image: paninoImg },
    // {
    //   name: "Panino al Sesamo", price: 1.75,
    //   image: ""
    // },
    // { name: "Panino Integrale", price: 2.00 },
  ],
  meat: [
    {
      name: "Manzo (150g)", price: 3.00,
      image: manzoImg
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
      image: cheddarImg
    },
    // {
    //   name: "Scamorza affumicata", price: 1.00,
    //   image: ""
    // },
  ],
  veg: [
    {
      name: "Lattuga", price: 0.30,
      image: lattugaImg
    },
    {
      name: "Pomodoro", price: 0.40,
      image: pomodoriImg
    },
    //{
    //  name: "Cipolla croccante", price: 0.60,
    //  image: cipollaImg
    //},
    {
      name: "Bacon Super Croccante", price: 1.20,
      image: baconImg
    },
  ],
  sauce: [
    {
      name: "Ketchup", price: 0.20,
      image: ketchupImg
    },
    {
      name: "Maionese", price: 0.20,
      image: maioneseImg
    },
    {
      name: "Salsa BBQ", price: 0.50,
      image: salsaBbqImg
    },
    {
      name: "Salsa Burger", price: 0.70,
      image: salsaBurgerImg
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
