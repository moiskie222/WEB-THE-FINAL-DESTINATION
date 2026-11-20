const welcomeStrip = document.querySelector("#welcome-strip");
const welcomeMessage = document.querySelector("#welcome-message");
const welcomeDismiss = document.querySelector("#welcome-dismiss");
const heroWord = document.querySelector("[data-hero-word]");
const hero = document.querySelector("[data-carousel]");
const heroMedia = document.querySelector("[data-hero-media]");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const greeting = document.querySelector("[data-time-greeting]");
if (greeting) {
  const hour = new Date().getHours();
  greeting.textContent = hour < 11
    ? "Good morning—start your day with something delicious."
    : hour < 15
      ? "Lunch time? We have a fresh pizza for that."
      : hour < 21
        ? "A fresh pizza makes a lovely evening."
        : "Late-night cravings? Plan your next PizzaHaus visit.";
}

if (hero) {
  const images = [...hero.querySelectorAll(".carousel-image")];
  const product = hero.querySelector("[data-carousel-product]");
  const price = hero.querySelector("[data-carousel-price]");
  const orderLink = hero.querySelector("[data-carousel-order]");
  const products = [
    { name: "Ham & Cheese", price: "P150" },
    { name: "Hawaiian", price: "P150" },
    { name: "Pepperoni", price: "P150" }
  ];

  const updateProduct = () => {
    const activeIndex = images.findIndex((image) => !image.classList.contains("hidden"));
    const selectedProduct = products[activeIndex];
    if (!selectedProduct || !product || !price || !orderLink) return;
    product.textContent = selectedProduct.name;
    price.textContent = selectedProduct.price;
    orderLink.href = `page1.html?search=${encodeURIComponent(selectedProduct.name)}`;
  };

  if (images.length !== products.length) {
    console.error("The home carousel product data does not match its images.");
  } else {
    updateProduct();
    const observer = new MutationObserver(updateProduct);
    images.forEach((image) => observer.observe(image, { attributes: true, attributeFilter: ["class"] }));
  }
}

if (welcomeStrip && welcomeMessage && welcomeDismiss) {
  const messages = [
    "Freshly baked daily, made to share.",
    "Find PizzaHaus in Sipocot and Naga City.",
    "Explore the menu and find your new favorite."
  ];
  let messageIndex = 0;
  let messageTimer;

  const stopMessages = () => window.clearInterval(messageTimer);
  const startMessages = () => {
    stopMessages();
    if (!reducedMotion.matches && !document.hidden && !welcomeStrip.hidden) {
      messageTimer = window.setInterval(() => {
        messageIndex = (messageIndex + 1) % messages.length;
        welcomeMessage.textContent = messages[messageIndex];
      }, 5000);
    }
  };

  welcomeDismiss.addEventListener("click", () => {
    welcomeStrip.hidden = true;
    stopMessages();
  });
  document.addEventListener("visibilitychange", startMessages);
  reducedMotion.addEventListener("change", startMessages);
  startMessages();
}

if (heroWord) {
  const words = ["Hot", "Cheesy", "Fresh", "Fast"];
  let wordIndex = 0;
  let wordTimer;

  const stopWords = () => window.clearInterval(wordTimer);
  const startWords = () => {
    stopWords();
    if (!reducedMotion.matches && !document.hidden) {
      wordTimer = window.setInterval(() => {
        heroWord.classList.add("is-changing");
        window.setTimeout(() => {
          wordIndex = (wordIndex + 1) % words.length;
          heroWord.textContent = words[wordIndex];
          heroWord.classList.remove("is-changing");
        }, 220);
      }, 2800);
    }
  };

  document.addEventListener("visibilitychange", startWords);
  reducedMotion.addEventListener("change", startWords);
  startWords();
}