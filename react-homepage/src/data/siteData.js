import slide1 from "../assets/images/p1.png";
import slide2 from "../assets/images/p2.png";
import slide3 from "../assets/images/p3.png";

export const navLinks = [
  { label: "Home", href: "index.html", current: true },
  { label: "Menu", href: "page1.html" },
  { label: "About", href: "page2.html" },
  { label: "Contact", href: "page3.html" },
];

export const slides = [
  { src: slide1, alt: "Freshly baked PizzaHouse pizza" },
  { src: slide2, alt: "Pineapple and ham pizza" },
  { src: slide3, alt: "Pizza fresh from the oven" },
];

export const favorites = [
  {
    name: "Margherita",
    description: "Tomato, mozzarella, basil, and a drizzle of olive oil.",
  },
  {
    name: "Garden Party",
    description: "A colorful mix of seasonal vegetables and creamy mozzarella.",
  },
  {
    name: "House Special",
    description: "Our signature sauce, savory toppings, and a golden crust.",
  },
];
