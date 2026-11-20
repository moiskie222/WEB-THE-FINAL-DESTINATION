(function () {
  const keys = {
    orders: "pizzahaus-customer-orders-v1",
    favorites: "pizzahaus-favorites-v1",
    availability: "pizzahaus-menu-availability-v1"
  };

  function read(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      console.error(`Unable to read PizzaHaus data "${key}".`, error);
      throw new Error("Saved PizzaHaus data could not be read. Reload the page or clear this browser's saved demo data.");
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Unable to save PizzaHaus data "${key}".`, error);
      throw new Error("PizzaHaus data could not be saved in this browser. Check available storage and try again.");
    }
  }

  function getOrders() {
    const orders = read(keys.orders, []);
    if (!Array.isArray(orders)) throw new Error("Saved PizzaHaus orders have an unexpected format.");
    return orders;
  }

  function getFavorites() {
    const favorites = read(keys.favorites, []);
    if (!Array.isArray(favorites) || favorites.some((favorite) => typeof favorite !== "string")) {
      throw new Error("Saved PizzaHaus favorites have an unexpected format.");
    }
    return favorites;
  }

  function getAvailability() {
    const availability = read(keys.availability, {});
    if (!availability || typeof availability !== "object" || Array.isArray(availability)) {
      throw new Error("Saved menu availability has an unexpected format.");
    }
    return availability;
  }

  window.PizzaHausData = {
    getOrders,
    saveOrders: (orders) => write(keys.orders, orders),
    getFavorites,
    saveFavorites: (favorites) => write(keys.favorites, favorites),
    getAvailability,
    saveAvailability: (availability) => write(keys.availability, availability),
    orderStorageKey: keys.orders,
    availabilityStorageKey: keys.availability
  };
})();
